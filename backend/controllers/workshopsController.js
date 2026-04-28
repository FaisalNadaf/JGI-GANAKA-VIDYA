const { ObjectId } = require('mongodb');
const { getDb } = require('../config/db');

function safeOid(id) { try { return new ObjectId(id); } catch { return null; } }

/** GET /api/workshops */
exports.list = async (req, res) => {
  const db = getDb();
  const items = await db.collection('workshops').find({}).sort({ date: 1 }).toArray();

  // hydrate school name + invitee count
  const schoolIds = items.map(w => safeOid(w.school_id)).filter(Boolean);
  const schools = schoolIds.length
    ? await db.collection('schools').find({ _id: { $in: schoolIds } }).toArray()
    : [];
  const schoolMap = {};
  for (const s of schools) schoolMap[String(s._id)] = s;

  const out = items.map(w => ({
    _id: String(w._id),
    title: w.title,
    description: w.description,
    type: w.type,
    date: w.date,
    location: w.location,
    school_id: w.school_id || null,
    school_name: w.school_id ? (schoolMap[w.school_id]?.name || '') : '',
    target_grades: w.target_grades || [],
    target_courses: w.target_courses || [],
    invited_count: (w.invited_students || []).length,
    institute_id: w.institute_id,
    created_at: w.created_at,
  }));
  return res.json({ workshops: out });
};

/** POST /api/workshops */
exports.create = async (req, res) => {
  const db = getDb();
  const { title, description, type, date, location, school_id, target_grades, target_courses } = req.body || {};
  if (!title || !date) return res.status(400).json({ error: 'Title and date are required' });

  const doc = {
    title: String(title).trim(),
    description: description || '',
    type: ['workshop', 'seminar', 'mentorship'].includes(type) ? type : 'workshop',
    date: new Date(date),
    location: location || '',
    school_id: school_id || null,
    target_grades: Array.isArray(target_grades) ? target_grades : [],
    target_courses: Array.isArray(target_courses) ? target_courses : [],
    invited_students: [],
    created_by: String(req.admin._id),
    institute_id: req.admin.institute_id || null,
    created_at: new Date(),
  };
  const result = await db.collection('workshops').insertOne(doc);
  doc._id = String(result.insertedId);
  return res.status(201).json({ workshop: doc });
};

/** PUT /api/workshops/:id */
exports.update = async (req, res) => {
  const db = getDb();
  const oid = safeOid(req.params.id);
  if (!oid) return res.status(400).json({ error: 'Invalid id' });
  const update = {};
  for (const k of ['title', 'description', 'type', 'location', 'school_id']) {
    if (req.body[k] !== undefined) update[k] = req.body[k];
  }
  if (req.body.date) update.date = new Date(req.body.date);
  if (Array.isArray(req.body.target_grades))  update.target_grades  = req.body.target_grades;
  if (Array.isArray(req.body.target_courses)) update.target_courses = req.body.target_courses;
  await db.collection('workshops').updateOne({ _id: oid }, { $set: update });
  const w = await db.collection('workshops').findOne({ _id: oid });
  return res.json({ workshop: { ...w, _id: String(w._id) } });
};

/** DELETE /api/workshops/:id */
exports.remove = async (req, res) => {
  const db = getDb();
  const oid = safeOid(req.params.id);
  if (!oid) return res.status(400).json({ error: 'Invalid id' });
  await db.collection('workshops').deleteOne({ _id: oid });
  return res.json({ ok: true });
};

/** POST /api/workshops/:id/invite — auto-invite based on target filters */
exports.invite = async (req, res) => {
  const db = getDb();
  const oid = safeOid(req.params.id);
  if (!oid) return res.status(400).json({ error: 'Invalid id' });

  const w = await db.collection('workshops').findOne({ _id: oid });
  if (!w) return res.status(404).json({ error: 'Workshop not found' });

  const q = {};
  if (Array.isArray(w.target_grades) && w.target_grades.length) {
    q.grade = { $in: w.target_grades };
  }
  if (Array.isArray(w.target_courses) && w.target_courses.length) {
    q.enrolled_courses = { $in: w.target_courses };
  }
  // Allow caller to override with a manual student_ids list.
  let invited = [];
  if (Array.isArray(req.body?.student_ids) && req.body.student_ids.length) {
    invited = req.body.student_ids.map(String);
  } else {
    const students = await db.collection('users').find(q, { projection: { _id: 1 } }).toArray();
    invited = students.map(u => String(u._id));
  }

  await db.collection('workshops').updateOne(
    { _id: oid },
    { $set: { invited_students: invited } }
  );

  // Notification log (mock) — write into a `notifications` collection.
  const notifs = invited.map(uid => ({
    user_id: uid,
    type: 'workshop_invite',
    workshop_id: String(oid),
    title: w.title,
    message: `You've been invited to "${w.title}" on ${new Date(w.date).toDateString()}`,
    read: false,
    created_at: new Date(),
  }));
  if (notifs.length) {
    try { await db.collection('notifications').insertMany(notifs); } catch { /* ignore */ }
  }

  return res.json({ invited_count: invited.length });
};
