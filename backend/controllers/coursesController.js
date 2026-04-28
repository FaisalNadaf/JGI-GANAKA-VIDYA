const { getDb } = require('../config/db');
const { _helpers } = require('./studentsController');

/** GET /api/courses  — flat list of {_id, title, category} for dropdowns. */
exports.list = async (req, res) => {
  const db = getDb();
  const courses = await db.collection('courses').find({}).toArray();
  const out = courses.map(c => ({
    _id: String(c._id),
    title: _helpers.pickLocalized(c.title, 'en'),
    category: c.category || 'General',
    free: !!c.free,
    lesson_count: (c.lessons || []).length,
  }));
  return res.json({ courses: out });
};
