const bcrypt = require('bcryptjs');
const { getDb } = require('../config/db');
const { signToken } = require('../middleware/auth');

function publicAdmin(admin) {
  if (!admin) return null;
  return {
    _id: String(admin._id),
    name: admin.name,
    email: admin.email,
    role: admin.role,
    institute_id: admin.institute_id || null,
    institute_name: admin.institute_name || null,
    created_at: admin.created_at,
  };
}

exports.login = async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const db = getDb();
  const admin = await db.collection('institute_admins').findOne({ email: String(email).toLowerCase() });
  if (!admin) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, admin.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const token = signToken(admin._id);
  return res.json({ token, admin: publicAdmin(admin) });
};

exports.me = async (req, res) => {
  return res.json({ admin: publicAdmin(req.admin) });
};
