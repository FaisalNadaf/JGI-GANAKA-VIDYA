const { ObjectId } = require('mongodb');
const { getDb } = require('../config/db');

function safeOid(id) { try { return new ObjectId(id); } catch { return null; } }

exports.list = async (req, res) => {
  const db = getDb();
  const items = await db.collection('schools').find({}).sort({ name: 1 }).toArray();
  const ids = items.map(s => String(s._id));
  let workshopCounts = {};
  try {
    const ws = await db.collection('workshops').aggregate([
      { $match: { school_id: { $in: ids } } },
      { $group: { _id: '$school_id', count: { $sum: 1 } } }
    ]).toArray();
    for (const x of ws) workshopCounts[x._id] = x.count;
  } catch {}
  const out = items.map(s => ({
    _id: String(s._id),
    name: s.name,
    type: s.type || 'school',
    city: s.city,
    state: s.state,
    contact_name: s.contact_name || '',
    contact_phone: s.contact_phone || '',
    contact_email: s.contact_email || '',
    notes: s.notes || '',
    workshop_count: workshopCounts[String(s._id)] || 0,
    created_at: s.created_at,
  }));
  return res.json({ schools: out });
};

exports.create = async (req, res) => {
  const db = getDb();
  const { name, type, city, state, contact_name, contact_phone, contact_email, notes } = req.body || {};
  if (!name || !city) return res.status(400).json({ error: 'Name and city are required' });
  const doc = {
    name: String(name).trim(),
    type: ['school', 'college'].includes(type) ? type : 'school',
    city: String(city).trim(),
    state: state || '',
    contact_name: contact_name || '',
    contact_phone: contact_phone || '',
    contact_email: contact_email || '',
    notes: notes || '',
    created_at: new Date(),
  };
  const r = await db.collection('schools').insertOne(doc);
  doc._id = String(r.insertedId);
  return res.status(201).json({ school: doc });
};

exports.update = async (req, res) => {
  const db = getDb();
  const oid = safeOid(req.params.id);
  if (!oid) return res.status(400).json({ error: 'Invalid id' });
  const update = {};
  for (const k of ['name', 'type', 'city', 'state', 'contact_name', 'contact_phone', 'contact_email', 'notes']) {
    if (req.body[k] !== undefined) update[k] = req.body[k];
  }
  await db.collection('schools').updateOne({ _id: oid }, { $set: update });
  const s = await db.collection('schools').findOne({ _id: oid });
  return res.json({ school: { ...s, _id: String(s._id) } });
};

exports.remove = async (req, res) => {
  const db = getDb();
  const oid = safeOid(req.params.id);
  if (!oid) return res.status(400).json({ error: 'Invalid id' });
  await db.collection('schools').deleteOne({ _id: oid });
  return res.json({ ok: true });
};
