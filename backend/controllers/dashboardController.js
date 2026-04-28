const { getDb } = require('../config/db');
const { _helpers } = require('./studentsController');

/** GET /api/dashboard/stats */
exports.stats = async (req, res) => {
  const db = getDb();

  const [totalStudents, allStudents, courses, tests, workshops] = await Promise.all([
    db.collection('users').countDocuments({}),
    db.collection('users').find({}, {
      projection: { points: 1, streak_days: 1, name: 1, email: 1, completed_courses: 1, created_at: 1 }
    }).toArray(),
    db.collection('courses').countDocuments({}),
    db.collection('tests').countDocuments({}).catch(() => 0),
    db.collection('workshops').countDocuments({}).catch(() => 0),
  ]);

  const totalPoints     = allStudents.reduce((s, u) => s + (u.points || 0), 0);
  const avgPoints       = totalStudents ? Math.round(totalPoints / totalStudents) : 0;
  const activeStudents  = allStudents.filter(u => (u.streak_days || 0) > 0).length;
  const completionsTot  = allStudents.reduce((s, u) => s + (u.completed_courses || []).length, 0);

  // Avg score: on a 0-100 scale we treat avg points / 10, capped at 100.
  // Also try the real test_submissions average if present.
  let avgScore = Math.min(100, Math.round(avgPoints / 10));
  try {
    const subs = await db.collection('test_submissions')
      .aggregate([{ $group: { _id: null, avg: { $avg: { $multiply: [{ $divide: ['$score', '$max_score'] }, 100] } } } }])
      .toArray();
    if (subs[0] && subs[0].avg != null) avgScore = Math.round(subs[0].avg);
  } catch { /* ignore */ }

  // Top performers (top 5 by points).
  const top = [...allStudents]
    .sort((a, b) => (b.points || 0) - (a.points || 0))
    .slice(0, 5)
    .map((u, i) => ({
      rank: i + 1,
      _id: String(u._id),
      name: u.name,
      email: u.email,
      points: u.points || 0,
    }));

  // Signups over the last 14 days (for the trend chart).
  const days = 14;
  const series = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    series.push({ date: d.toISOString().slice(0, 10), signups: 0 });
  }
  for (const u of allStudents) {
    if (!u.created_at) continue;
    const k = new Date(u.created_at).toISOString().slice(0, 10);
    const slot = series.find(s => s.date === k);
    if (slot) slot.signups += 1;
  }

  // Recent activity = newest 8 students by created_at.
  const recent = [...allStudents]
    .filter(u => u.created_at)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 8)
    .map(u => ({
      _id: String(u._id),
      name: u.name,
      email: u.email,
      points: u.points || 0,
      when: u.created_at,
    }));

  return res.json({
    counts: {
      total_students: totalStudents,
      active_students: activeStudents,
      avg_points: avgPoints,
      avg_score: avgScore,
      total_courses: courses,
      total_tests: tests,
      total_workshops: workshops,
      total_completions: completionsTot,
    },
    top_performers: top,
    signup_trend: series,
    recent_students: recent,
  });
};

/** GET /api/leaderboard?course=&city=&institute=&limit=50 */
exports.leaderboard = async (req, res) => {
  const db = getDb();
  const { course = '', city = '', institute = '', limit = '50' } = req.query;

  const q = {};
  if (city) q.village = { $regex: city, $options: 'i' };
  if (course) q.enrolled_courses = course;
  // "institute" filter: students who've redeemed at this institute, via bookings
  if (institute) {
    try {
      const bookings = await db.collection('bookings').find({
        institute_id: institute
      }, { projection: { user_id: 1 } }).toArray();
      const ids = bookings.map(b => String(b.user_id));
      q._id = { $in: ids.map(id => {
        try { return new (require('mongodb').ObjectId)(id); } catch { return null; }
      }).filter(Boolean) };
    } catch { /* ignore */ }
  }

  const lim = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));
  const users = await db.collection('users').find(q, {
    projection: { password: 0, point_log: 0 }
  }).sort({ points: -1 }).limit(lim).toArray();

  const courseLookup = await _helpers.buildCourseLookup(db);
  const rows = users.map((u, i) => ({
    rank: i + 1,
    _id: String(u._id),
    name: u.name,
    email: u.email,
    village: u.village || '',
    grade: u.grade || '',
    points: u.points || 0,
    streak_days: u.streak_days || 0,
    badges: u.badges || [],
    enrolled_courses: (u.enrolled_courses || [])
      .map(cid => courseLookup[String(cid)])
      .filter(Boolean)
      .map(c => _helpers.pickLocalized(c.title, 'en')),
  }));

  // Provide filter dropdown sources.
  const courses = Object.values(courseLookup).map(c => ({
    _id: String(c._id),
    title: _helpers.pickLocalized(c.title, 'en'),
    category: c.category || 'General',
  }));
  const cities = [...new Set(
    (await db.collection('users').find({}, { projection: { village: 1 } }).toArray())
      .map(u => u.village).filter(Boolean)
  )].sort();
  let institutes = [];
  try {
    institutes = (await db.collection('institutes').find({}).toArray()).map(i => ({
      _id: String(i._id),
      name: _helpers.pickLocalized(i.name, 'en'),
    }));
  } catch { institutes = []; }

  return res.json({ rows, filters: { courses, cities, institutes } });
};
