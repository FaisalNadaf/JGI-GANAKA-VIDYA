require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { connect } = require('./config/db');

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProd = NODE_ENV === 'production';

// Fail fast in production if a real JWT secret wasn't supplied — silent
// fallback to 'dev-secret' would let anyone forge tokens.
if (isProd) {
  const s = process.env.JWT_SECRET;
  if (!s || s === 'dev-secret' || s === 'change-me-to-a-long-random-string') {
    console.error('FATAL: JWT_SECRET must be set to a strong random value in production.');
    process.exit(1);
  }
  if (!process.env.MONGO_URI) {
    console.error('FATAL: MONGO_URI must be set in production.');
    process.exit(1);
  }
}

// CORS_ORIGIN supports a comma-separated list. Trailing slashes are stripped
// so '"https://app.netlify.app/"' matches the browser-sent Origin header
// (which never has a trailing slash). Use '*' to allow all (dev only).
const allowedOrigins = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map(s => s.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: false,
};

const app = express();
app.set('trust proxy', 1);
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(isProd ? 'combined' : 'dev'));

// Routes
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/dashboard',    require('./routes/dashboard'));
app.use('/api/students',     require('./routes/students'));
app.use('/api/leaderboard',  require('./routes/leaderboard'));
app.use('/api/workshops',    require('./routes/workshops'));
app.use('/api/schools',      require('./routes/schools'));
app.use('/api/courses',      require('./routes/courses'));

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'institute-portal' }));
app.get('/',           (_req, res) => res.json({ service: 'Institute Portal API', see: '/api/health' }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

const PORT = parseInt(process.env.PORT, 10) || 5050;

connect()
  .then(() => app.listen(PORT, () => console.log(`Institute Portal API listening on :${PORT} (${NODE_ENV})`)))
  .catch(err => {
    console.error('Failed to start:', err);
    process.exit(1);
  });
