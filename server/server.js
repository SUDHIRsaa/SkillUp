const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Load env: try root .env, then fallback to server/.env
let envLoaded = dotenv.config({ path: path.join(__dirname, '..', '.env') });
if (!process.env.DB_URI) {
  const alt = dotenv.config();
  if (!envLoaded.parsed && alt.parsed) envLoaded = alt;
}
if (envLoaded?.parsed) {
  console.log('Env loaded');
}

const app = express();

// Middleware
app.use(helmet());
// Explicit CORS config to allow Authorization and common headers for preflight
app.use(cors({ origin: true, credentials: true, allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'] }));
// allow larger payloads (5mb) for note transfer/upload metadata
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(require('./middleware/maintenance'));

// Provider logging (Gemini-only)
const llmProvider = (process.env.LLM_PROVIDER || 'gemini').toLowerCase();
console.log('[server] LLM_PROVIDER =', llmProvider);
if (process.env.GEMINI_API_KEY) console.log('[server] GEMINI_API_KEY is present'); else console.log('[server] GEMINI_API_KEY not present');
console.log('[server] GEMINI_MODEL =', process.env.GEMINI_MODEL || '(not set, using default)');

// Quick sanity-check: warn if any configured key looks like a GitHub token (common mistake)
const anyKey = process.env.GEMINI_API_KEY || '';
if (anyKey && (/^github_pat_|^ghp_/i).test(anyKey)) {
  console.warn('[server] WARNING: Detected a GitHub token-like string in environment variables. GitHub tokens will not work with OpenAI/Gemini APIs. Please set the proper LLM API key as instructed and restart the server.');
}

// DB
connectDB();

// Routes
app.get('/api/health', (req, res) => res.json({ ok: true, service: 'skillup-server' }));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/questions', require('./routes/questionRoutes'));
app.use('/api/coding', require('./routes/codingRoutes'));
app.use('/api/performance', require('./routes/performanceRoutes'));
app.use('/api/leaderboard', require('./routes/leaderboardRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/tools', require('./routes/toolsRoutes'));

// Dev-only helpers (seed DB) - enabled only outside production
if ((process.env.NODE_ENV || 'development') !== 'production') {
  try {
    app.use('/api/dev', require('./routes/devRoutes'));
    console.log('[server] dev routes mounted at /api/dev');
  } catch (e) {
    console.warn('[server] failed to mount dev routes', e?.message || e);
  }
}

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Another process is listening on this port.`);
    console.error(`Find the process with: netstat -ano | findstr :${PORT}`);
    console.error(`Then stop it (PowerShell): Stop-Process -Id <PID> -Force  OR taskkill /PID <PID> /F`);
  } else {
    console.error('Server error', err);
  }
  // Exit with non-zero so external supervisors know the start failed
  process.exit(1);
});
