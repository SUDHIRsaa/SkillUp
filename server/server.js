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


const app = express();

// Middleware
app.use(helmet());
// Explicit CORS config to allow Authorization and common headers for preflight
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  // include Cache-Control (and any other common headers) so preflight accepts requests from the client
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With', 'Cache-Control']
}));
// Extra preflight middleware: ensure Access-Control-Allow-Headers contains Cache-Control
app.use((req, res, next) => {
  // mirror origin for credentials-enabled CORS
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With, Cache-Control');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
// allow larger payloads (5mb) for note transfer/upload metadata
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(require('./middleware/maintenance'));

// LLM support disabled
if ((process.env.NODE_ENV || 'development') !== 'production') 

// DB
connectDB();

// Routes
app.get('/api/health', (req, res) => res.json({ ok: true, service: 'skillup-server' }));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/questions', require('./routes/questionRoutes'));
app.use('/api/performance', require('./routes/performanceRoutes'));
app.use('/api/leaderboard', require('./routes/leaderboardRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/tools', require('./routes/toolsRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// Dev-only helpers (seed DB) - enabled only outside production
if ((process.env.NODE_ENV || 'development') !== 'production') {
  try {
    app.use('/api/dev', require('./routes/devRoutes'));
    
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
const server = app.listen(PORT, () => {
  if ((process.env.NODE_ENV || 'development') !== 'production') console.log(`Server running on port ${PORT}`);
});

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
