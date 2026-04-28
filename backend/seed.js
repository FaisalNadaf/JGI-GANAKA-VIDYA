/**
 * seed.js — populate the institute-portal–owned collections.
 *
 *   institute_admins  : login accounts (email / password)
 *   workshops         : sample workshops + seminars + mentorship sessions
 *   schools           : local schools and colleges
 *
 * Run:  node seed.js
 *
 * IMPORTANT: this is non-destructive — re-running it only inserts what's
 * missing (matched by email/name). If you want a clean reseed, drop the
 * three collections first.
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connect, getDb, close } = require('./config/db');

async function ensureAdmin(db, email, payload) {
  const existing = await db.collection('institute_admins').findOne({ email });
  if (existing) {
    console.log(`  · admin exists, skipped: ${email}`);
    return existing;
  }
  const hash = await bcrypt.hash(payload.password, 10);
  const doc = {
    name: payload.name,
    email,
    password: hash,
    role: payload.role || 'admin',
    institute_id: payload.institute_id || null,
    institute_name: payload.institute_name || null,
    created_at: new Date(),
  };
  const r = await db.collection('institute_admins').insertOne(doc);
  console.log(`  ✓ admin created: ${email}  (password: ${payload.password})`);
  return { ...doc, _id: r.insertedId };
}

async function ensureSchool(db, name, payload) {
  const existing = await db.collection('schools').findOne({ name });
  if (existing) {
    console.log(`  · school exists, skipped: ${name}`);
    return existing;
  }
  const doc = { name, ...payload, created_at: new Date() };
  const r = await db.collection('schools').insertOne(doc);
  console.log(`  ✓ school created: ${name}`);
  return { ...doc, _id: r.insertedId };
}

async function ensureWorkshop(db, title, payload) {
  const existing = await db.collection('workshops').findOne({ title });
  if (existing) {
    console.log(`  · workshop exists, skipped: ${title}`);
    return existing;
  }
  const doc = { title, ...payload, created_at: new Date() };
  const r = await db.collection('workshops').insertOne(doc);
  console.log(`  ✓ workshop created: ${title}`);
  return { ...doc, _id: r.insertedId };
}

async function lookupInstitute(db, namePattern) {
  try {
    const all = await db.collection('institutes').find({}).toArray();
    const match = all.find(i => {
      const n = (i.name && (i.name.en || i.name)) || '';
      return String(n).toLowerCase().includes(namePattern.toLowerCase());
    });
    if (!match) return null;
    return {
      _id: String(match._id),
      name: (match.name && (match.name.en || match.name)) || namePattern,
    };
  } catch { return null; }
}

(async () => {
  await connect();
  const db = getDb();

  console.log('\nSeeding institute_admins ...');
  const pw  = await lookupInstitute(db, 'Physics');
  const aak = await lookupInstitute(db, 'Aakash');
  const byju = await lookupInstitute(db, 'Byju');

  const adminPW = await ensureAdmin(db, 'admin@pw.in', {
    name: 'PW Admin (Patna)', password: 'admin1234', role: 'admin',
    institute_id: pw?._id || null, institute_name: pw?.name || 'Physics Wallah',
  });
  await ensureAdmin(db, 'admin@aakash.in', {
    name: 'Aakash Admin (Pune)', password: 'admin1234', role: 'admin',
    institute_id: aak?._id || null, institute_name: aak?.name || 'Aakash Institute',
  });
  await ensureAdmin(db, 'admin@byjus.in', {
    name: "BYJU's Admin (Mysuru)", password: 'admin1234', role: 'admin',
    institute_id: byju?._id || null, institute_name: byju?.name || "BYJU's Tuition Centre",
  });

  console.log('\nSeeding schools ...');
  const school1 = await ensureSchool(db, 'Govt. High School, Bodh Gaya', {
    type: 'school', city: 'Bodh Gaya', state: 'Bihar',
    contact_name: 'Mrs. Sushma Devi', contact_phone: '+91-9876500011',
    contact_email: 'principal.ghs.bodhgaya@bih.gov.in',
    notes: 'Class 8-10, ~420 students',
  });
  const school2 = await ensureSchool(db, 'Sahyadri Vidyalaya, Pune', {
    type: 'school', city: 'Pune', state: 'Maharashtra',
    contact_name: 'Mr. Anil Patil', contact_phone: '+91-9876500022',
    contact_email: 'sahyadri.vid@pune.edu.in',
    notes: 'Marathi-medium, has dedicated science lab',
  });
  const college1 = await ensureSchool(db, 'Mysuru Government Degree College', {
    type: 'college', city: 'Mysuru', state: 'Karnataka',
    contact_name: 'Dr. Lakshmi Rao', contact_phone: '+91-9876500033',
    contact_email: 'principal@mgdc.kar.nic.in',
    notes: 'Hosts career fairs every February',
  });
  await ensureSchool(db, 'Hassan Polytechnic College', {
    type: 'college', city: 'Hassan', state: 'Karnataka',
    contact_name: 'Mr. Manju Gowda', contact_phone: '+91-9876500044',
    contact_email: 'admin@hassanpoly.edu.in',
    notes: 'Strong in IT-Skills uptake',
  });

  console.log('\nSeeding workshops ...');
  const today = new Date(); today.setHours(10, 0, 0, 0);
  const inDays = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return d; };

  await ensureWorkshop(db, 'JEE Foundation Crash Course', {
    description: 'Two-day crash course for Class 10 students preparing for JEE foundation.',
    type: 'workshop',
    date: inDays(7),
    location: 'Govt. High School, Bodh Gaya',
    school_id: String(school1._id),
    target_grades: ['Class 10', 'Class 11'],
    target_courses: [],
    invited_students: [],
    created_by: String(adminPW._id),
    institute_id: pw?._id || null,
  });

  await ensureWorkshop(db, 'NEET Strategy Seminar', {
    description: 'How to plan the last 6 months for NEET — by senior Aakash mentors.',
    type: 'seminar',
    date: inDays(14),
    location: 'Sahyadri Vidyalaya, Pune',
    school_id: String(school2._id),
    target_grades: ['Class 12', 'PUC-2'],
    target_courses: [],
    invited_students: [],
    created_by: String(adminPW._id),
    institute_id: aak?._id || null,
  });

  await ensureWorkshop(db, 'IT Career Mentorship — Cohort 1', {
    description: '6-week mentorship program covering web development, internships, and resume building.',
    type: 'mentorship',
    date: inDays(21),
    location: 'Mysuru Government Degree College',
    school_id: String(college1._id),
    target_grades: ['Degree-1', 'Degree-2', 'Degree-3'],
    target_courses: [],
    invited_students: [],
    created_by: String(adminPW._id),
    institute_id: byju?._id || null,
  });

  console.log('\n────────────────────────────────────────────');
  console.log('Seed complete. Login credentials:');
  console.log('  admin@pw.in       / admin1234');
  console.log('  admin@aakash.in   / admin1234');
  console.log('  admin@byjus.in    / admin1234');
  console.log('────────────────────────────────────────────\n');

  await close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
