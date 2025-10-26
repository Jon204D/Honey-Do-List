// server.js - Main server file for the Task Management API

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require("./routes/userRoutes");
const inviteRoutes = require('./routes/inviteRoutes.js');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Environment Variables
const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || 'localhost';
const CLIENT_ORIGIN = process.env.FRONTEND_BASE_URL || 'http://localhost:3000';
const BACKEND_BASE_URL = `http://${HOST}${PORT ? `:${PORT}` : ''}`;

// ─── Connect to DB ──────
connectDB();
console.log("🔧 ENV CHECK:");
console.log("HOST:", process.env.HOST);
console.log("PORT:", process.env.PORT);
console.log("FRONTEND_BASE_URL:", process.env.FRONTEND_BASE_URL);
console.log("BACKEND_BASE_URL:", BACKEND_BASE_URL);

// ─── CORS Configuration ───────
const allowedOrigins = [
  CLIENT_ORIGIN,
  'http://localhost:3000',
  'http://localhost:5173', // Vite dev server (if you use it)
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
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

app.use(cors(corsOptions));

// ─── Middlewares ──────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ──────
app.use('/api/tasks', taskRoutes);
app.use("/api/users", userRoutes);
app.use('/api/invites', inviteRoutes);
app.use('/api/users', userRoutes);

// ─── Base Route ───────
app.get('/', (req, res) => {
  res.json({ 
    message: '✅ Task Management API is running',
    port: PORT,
    timestamp: new Date().toISOString()
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
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ─── Start Server ───
app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
  console.log(`\n${'='.repeat(50)}`);
  console.log(`🚀 Server running at ${BACKEND_BASE_URL}`);
  console.log(`📡 CORS enabled for: ${allowedOrigins.join(', ')}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`${'='.repeat(50)}\n`);
});