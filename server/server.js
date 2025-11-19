// server.js - Honey-Do-List backend entrypoint
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
const CLIENT_ORIGIN = process.env.FRONTEND_BASE_URL || 'http://localhost:3000';
const BACKEND_BASE_URL =
  (process.env.BACKEND_BASE_URL && String(process.env.BACKEND_BASE_URL).replace(/\/+$/, '')) ||
  `http://${HOST}${PORT ? `:${PORT}` : ''}`;

// Connect to DB
connectDB();

console.log('🔧 ENV CHECK:');
console.log('HOST:', process.env.HOST || 'localhost');
console.log('PORT:', process.env.PORT || 5001);
console.log('FRONTEND_BASE_URL:', process.env.FRONTEND_BASE_URL || 'http://localhost:3000');
console.log('BACKEND_BASE_URL:', BACKEND_BASE_URL);
console.log('MONGO_URI:', process.env.MONGO_URI ? '✅ Set' : '❌ Missing');

// Normalize repeated slashes in incoming URL
function normalizeSlashes(req, res, next) {
  try {
    const orig = req.originalUrl || req.url || '';
    const normalized = orig.replace(/\/{2,}/g, '/');
    if (normalized !== orig) {
      req.url = normalized;
      req.originalUrl = normalized;
    }
  } catch (e) {
    console.warn('normalizeSlashes error', e);
  }
  next();
}

// CORS Configuration
const allowedOrigins = [
  CLIENT_ORIGIN,
  'http://localhost:3000',
  'http://localhost:5173', // Vite dev server
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (Postman, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('⚠️  CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
};

// Middlewares (order matters!)
app.use(normalizeSlashes);
app.use(cors(corsOptions));

// Handle preflight requests
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return cors(corsOptions)(req, res, () => {
      res.status(204).end();
    });
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (helpful for debugging)
app.use((req, res, next) => {
  //console.log(`📨 ${req.method} ${req.path} - Origin: ${req.get('origin') || 'none'}`);
  next();
});

// Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/invites', inviteRoutes);
app.use('/api/users', userRoutes);

// Base Route
app.get('/', (req, res) => {
  res.json({
    message: '✅ Task Management API is running',
    port: PORT,
    timestamp: new Date().toISOString(),
  });
});

// 404 Catch
app.use((req, res, next) => {
  console.log('❌ 404 Not Found:', req.method, req.path);
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  if (err.status === 404) {
    return res.status(404).json({ message: 'Endpoint Not Found' });
  }
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ Server listening on port ${PORT}`);
  console.log(`🚀 Server running at ${BACKEND_BASE_URL}`);
  console.log(`📡 CORS enabled for: ${allowedOrigins.join(', ')}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`${'='.repeat(60)}\n`);
});