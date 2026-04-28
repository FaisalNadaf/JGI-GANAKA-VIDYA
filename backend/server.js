require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { connect } = require('./config/db');

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || true, credentials: false }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

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

// Centralised error handler so async throws don't crash the process.
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

const PORT = parseInt(process.env.PORT, 10) || 5050;

connect()
  .then(() => app.listen(PORT, () => console.log(`✓ Institute Portal API on http://localhost:${PORT}`)))
  .catch(err => {
    console.error('Failed to start:', err);
    process.exit(1);
  });
