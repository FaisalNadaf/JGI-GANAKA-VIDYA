const { ObjectId } = require('mongodb');
const { getDb } = require('../config/db');

// ---- helpers ----------------------------------------------------------

function pickLocalized(t, lang = 'en') {
  if (!t) return '';
  if (typeof t === 'string') return t;
  return t[lang] || t.en || Object.values(t)[0] || '';
}

function safeObjectId(id) {
  try { return new ObjectId(id); } catch { return null; }
}

/** Compute a 0–100 progress percent for a user across enrolled courses. */
function computeProgressPercent(user) {
  const enrolled = (user.enrolled_courses || []).length;
  const completed = (user.completed_courses || []).length;
  if (!enrolled) return 0;
  return Math.min(100, Math.round((completed / enrolled) * 100));
}

/** Try to derive 1–3 weak subjects from the user's test_submissions, falling
 *  back to "—" when no data exists. */
async function deriveWeakSubjects(db, userId) {
  // We don't know for sure if test_submissions exists in your seed; handle
  // both "test_submissions" and a fallback path through point_log reasons.
  try {
    const subs = await db.collection('test_submissions')
      .find({ user_id: String(userId) }).limit(50).toArray();
    if (subs.length) {
      const bySubject = {};
      for (const s of subs) {
        const subj = s.subject || s.course_title || 'General';
        const pct  = (s.score / (s.max_score || 1)) * 100;
        if (!bySubject[subj]) bySubject[subj] = [];
        bySubject[subj].push(pct);
      }
      const weak = Object.entries(bySubject)
        .map(([k, arr]) => [k, arr.reduce((a,b)=>a+b,0) / arr.length])
        .filter(([_, avg]) => avg < 60)
        .sort((a, b) => a[1] - b[1])
        .slice(0, 3)
        .map(([k]) => k);
      if (weak.length) return weak;
    }
  } catch { /* collection missing is fine */ }
  return [];
}

/** Convert a Mongo user doc into the shape the React table expects. */
async function toStudentRow(user, courseLookup, db, includeWeak = false) {
  const enrolledCourses = (user.enrolled_courses || []).map(cid => {
    const c = courseLookup[String(cid)];
    return c ? pickLocalized(c.title, 'en') : String(cid);
  });
  const row = {
    _id: String(user._id),
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    grade: user.grade || '',
    village: user.village || '',
    language: user.language || 'en',
    points: user.points || 0,
    streak_days: user.streak_days || 0,
    badges: user.badges || [],
    enrolled_count: (user.enrolled_courses || []).length,
    completed_count: (user.completed_courses || []).length,
    enrolled_courses: enrolledCourses,
    progress_percent: computeProgressPercent(user),
    created_at: user.created_at,
  };
  if (includeWeak) row.weak_subjects = await deriveWeakSubjects(db, user._id);
  return row;
}

async function buildCourseLookup(db) {
  const courses = await db.collection('courses').find({}).toArray();
  const lookup = {};
  for (const c of courses) lookup[String(c._id)] = c;
  return lookup;
}

// ---- endpoints --------------------------------------------------------

/** GET /api/students  — list with search/filter/sort/pagination */
exports.listStudents = async (req, res) => {
  const db = getDb();
  const {
    search = '', course = '', grade = '', performance = '',
    sort = 'points_desc', page = '1', limit = '50',
  } = req.query;

  const q = {};
  if (search) {
    q.$or = [
      { name:  { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }
  if (grade) q.grade = grade;
  if (course) {
    // course filter accepts either a course _id or the english title slug
    q.enrolled_courses = course;
  }
  if (performance === 'high') q.points = { $gte: 500 };
  else if (performance === 'mid') q.points = { $gte: 100, $lt: 500 };
  else if (performance === 'low') q.points = { $lt: 100 };

  let sortSpec = { points: -1 };
  if (sort === 'points_asc')  sortSpec = { points: 1 };
  if (sort === 'name_asc')    sortSpec = { name: 1 };
  if (sort === 'name_desc')   sortSpec = { name: -1 };
  if (sort === 'streak_desc') sortSpec = { streak_days: -1 };
  if (sort === 'recent')      sortSpec = { created_at: -1 };

  const pageNum  = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));
  const skip = (pageNum - 1) * limitNum;

  const total = await db.collection('users').countDocuments(q);
  const cursor = db.collection('users').find(q, {
    projection: { password: 0, point_log: 0 }
  }).sort(sortSpec).skip(skip).limit(limitNum);
  const users = await cursor.toArray();

  const courseLookup = await buildCourseLookup(db);
  const all = await db.collection('users').find({}, {
    projection: { points: 1 }
  }).sort({ points: -1 }).toArray();
  const rankMap = {};
  all.forEach((u, i) => { rankMap[String(u._id)] = i + 1; });

  const rows = await Promise.all(users.map(async u => {
    const r = await toStudentRow(u, courseLookup, db, false);
    r.rank = rankMap[String(u._id)] || null;
    return r;
  }));
  return res.json({ total, page: pageNum, limit: limitNum, students: rows });
};

/** GET /api/students/:id  — full profile */
exports.getStudent = async (req, res) => {
  const db = getDb();
  const oid = safeObjectId(req.params.id);
  if (!oid) return res.status(400).json({ error: 'Invalid student ID' });

  const user = await db.collection('users').findOne({ _id: oid }, {
    projection: { password: 0 }
  });
  if (!user) return res.status(404).json({ error: 'Student not found' });

  const courseLookup = await buildCourseLookup(db);

  // Test history — try test_submissions, fallback to point_log entries.
  let history = [];
  try {
    history = await db.collection('test_submissions').find({
      user_id: String(user._id)
    }).sort({ created_at: -1 }).limit(20).toArray();
    history = history.map(h => ({
      _id: String(h._id),
      test_id: String(h.test_id || ''),
      title: h.title || h.subject || 'Test',
      score: h.score || 0,
      max_score: h.max_score || 100,
      percent: Math.round((h.score / (h.max_score || 1)) * 100),
      submitted_at: h.created_at || h.submitted_at,
    }));
  } catch { history = []; }
  if (!history.length) {
    history = (user.point_log || [])
      .filter(p => p.reason && /test|quiz/i.test(p.reason))
      .slice(-20)
      .map((p, i) => ({
        _id: `pl-${i}`,
        title: p.reason,
        score: p.amount || 0,
        max_score: 100,
        percent: Math.min(100, p.amount || 0),
        submitted_at: p.timestamp,
      }));
  }

  // Point trend for chart (last 30 entries).
  const trend = (user.point_log || []).slice(-30).map((p, i) => ({
    idx: i + 1,
    points: p.amount || 0,
    reason: p.reason || '',
    timestamp: p.timestamp,
  }));

  // Rank.
  const all = await db.collection('users').find({}, { projection: { points: 1 } })
    .sort({ points: -1 }).toArray();
  const rank = all.findIndex(u => String(u._id) === String(user._id)) + 1 || null;

  const row = await toStudentRow(user, courseLookup, db, true);
  row.rank = rank;

  return res.json({
    student: row,
    test_history: history,
    point_trend: trend,
  });
};

exports._helpers = { buildCourseLookup, pickLocalized, computeProgressPercent };
