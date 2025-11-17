require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');
const inviteRoutes = require('./routes/inviteRoutes.js');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Environment Variables
const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || 'localhost';
// FRONTEND_BASE_URL should be the full origin used by your frontend deployment (https://...)
const CLIENT_ORIGIN = process.env.FRONTEND_BASE_URL || 'http://localhost:3000';
// Prefer an explicit BACKEND_BASE_URL env if available; otherwise build a local URL for logs only
const BACKEND_BASE_URL =
  (process.env.BACKEND_BASE_URL && String(process.env.BACKEND_BASE_URL).replace(/\/+$/, '')) ||
  `http://${HOST}${PORT ? `:${PORT}` : ''}`;

// ─── Connect to DB ──────
connectDB();
console.log('🔧 ENV CHECK:');
console.log('HOST:', process.env.HOST);
console.log('PORT:', process.env.PORT);
console.log('FRONTEND_BASE_URL:', process.env.FRONTEND_BASE_URL);
console.log('BACKEND_BASE_URL:', BACKEND_BASE_URL);

// ---------------------------
// Helpful middleware: normalize repeated slashes in incoming URL
// This prevents issues where a client accidentally sends '//' in the path
// and ensures downstream CORS/routing sees a single-slash path.
// ---------------------------
function normalizeSlashes(req, res, next) {
  try {
    const orig = req.originalUrl || req.url || '';
    const normalized = orig.replace(/\/{2,}/g, '/');
    if (normalized !== orig) {
      // Update url values that downstream routing/CORS will see
      req.url = normalized;
      req.originalUrl = normalized;
      console.log('Normalized URL', { before: orig, after: normalized });
    }
  } catch (e) {
    console.warn('normalizeSlashes error', e);
  }
  next();
}

// ---------------------------
// Early OPTIONS logging for debugging preflight problems
// ---------------------------
function logOptions(req, res, next) {
  if (req.method === 'OPTIONS') {
    console.log('PRELIGHT:', {
      originalUrl: req.originalUrl,
      path: req.path,
      method: req.method,
      headers: {
        origin: req.headers.origin,
        acrm: req.headers['access-control-request-method'],
        acrh: req.headers['access-control-request-headers'],
      },
    });
  }
  next();
}

// ─── CORS Configuration ───────
const allowedOrigins = [
  CLIENT_ORIGIN,
  'http://localhost:3000',
  'http://localhost:5173', // Vite dev server (if used)
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow non-browser tools
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
};

// ─── Middlewares (order matters) ──────
app.use(normalizeSlashes);
app.use(logOptions);

// Apply CORS middleware globally
app.use(cors(corsOptions));

// Instead of app.options('*' or '/*') (which failed due to path-to-regexp parsing),
// use an explicit OPTIONS handler that does not register a problematic path pattern.
// This will respond to any preflight after normalizeSlashes has run.
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    // run cors middleware for this request to set appropriate headers
    return cors(corsOptions)(req, res, () => {
      // End preflight with 204 No Content
      res.status(204).end();
    });
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ──────
app.use('/api/tasks', taskRoutes);
app.use('/api/invites', inviteRoutes);
app.use('/api/users', userRoutes);

// ─── Base Route ───────
app.get('/', (req, res) => {
  res.json({
    message: '✅ Task Management API is running',
    port: PORT,
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 Catch ────────
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// ─── Error Handler ──────
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  if (err.status === 404) {
    return res.status(404).json({ message: 'Endpoint Not Found' });
  }
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ─── Start Server ───
app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
  console.log(`${'='.repeat(50)}`);
  console.log(`🚀 Server running at ${BACKEND_BASE_URL}`);
  console.log(`📡 CORS enabled for: ${allowedOrigins.join(', ')}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`${'='.repeat(50)}\n`);
});