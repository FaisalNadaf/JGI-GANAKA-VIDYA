// Singleton MongoDB connection. Native driver, no Mongoose, because the
// existing collections (users, courses, tests) are owned by the Python
// backend and we don't want to fight schema validation.
const { MongoClient } = require('mongodb');

let client = null;
let db = null;

async function connect() {
  if (db) return db;
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
  const dbName = process.env.DB_NAME || 'atmanirbhar';
  client = new MongoClient(uri, { ignoreUndefined: true });
  await client.connect();
  db = client.db(dbName);
  console.log(`✓ MongoDB connected → ${uri} / ${dbName}`);
  return db;
}

function getDb() {
  if (!db) throw new Error('Database not initialized — call connect() first.');
  return db;
}

async function close() {
  if (client) await client.close();
  client = null;
  db = null;
}

module.exports = { connect, getDb, close };
