const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const { getDb } = require('../config/db');

function signToken(adminId) {
  return jwt.sign(
    { sub: String(adminId) },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    const db = getDb();
    let admin = null;
    try {
      admin = await db.collection('institute_admins').findOne({ _id: new ObjectId(payload.sub) });
    } catch {
      admin = null;
    }
    if (!admin) return res.status(401).json({ error: 'Account not found' });
    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { signToken, requireAuth };
