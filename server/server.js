// server.js - Main server file for the Task Management API


require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require("./routes/userRoutes");
const inviteRoutes = require('./routes/inviteRoutes.js');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Environment Variables
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'http://localhost';
const PROD_STATUS = process.env.IN_PROD || false;
const CLIENT_ORIGIN = process.env.CLIENT_HOST; 
const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL;
const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || 'localhost';
const CLIENT_ORIGIN = process.env.FRONTEND_BASE_URL || 'http://localhost:3000';
const BACKEND_BASE_URL = `http://${HOST}${PORT ? `:${PORT}` : ''}`;

// ─── Connect to DB ──────
connectDB();

// ─── CORS Configuration ───────
const allowedOrigins = [
  CLIENT_ORIGIN,
  'http://localhost:3000',
  'http://localhost:5173', // Vite dev server (if you use it)
];

const corsOptions = {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Cache-Control', 'X-Requested-With', 'Custom-Header'],
    credentials: true, // allow cookies from frontend if needed
};

// Middleware
connectDB();                           // Connect to MongoDB
app.use(cors(corsOptions));            // CORS
app.use(express.json());               // Parse JSON bodies
app.use(cookieParser());               // Parse cookies

// Extra control
app.use((req, res, next) => {
    if (allowedOrigins.includes(req.headers.origin)) {
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
        res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }
    next();
});
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
<<<<<<< HEAD
app.use("/api/users", userRoutes);
app.use('/api/invites', inviteRoutes); 
=======
app.use('/api/users', userRoutes);
>>>>>>> 5c15a63c9d962e9f10b9093c1b3168c074a5f5cf

// ─── Base Route ───────
app.get('/', (req, res) => {
<<<<<<< HEAD
    if (PROD_STATUS === 'true') {
        res.send(`The server is running successfully.<br/>Server URL: ${BACKEND_BASE_URL}`);
    } else {
        res.send(`The server is running successfully.<br/>Port: ${PORT}<br/>Server URL: ${BACKEND_BASE_URL}`);
    }
=======
  res.json({ 
    message: '✅ Task Management API is running',
    port: PORT,
    timestamp: new Date().toISOString()
  });
>>>>>>> 5c15a63c9d962e9f10b9093c1b3168c074a5f5cf
});

// ─── 404 Catch ────────
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// ─── Error Handler ──────
app.use((err, req, res, next) => {
<<<<<<< HEAD
    res.setHeader('Access-Control-Allow-Origin', allowedOrigins.join(','));
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (err.status === 404) {
        return res.redirect(`${HOST}/PageNotFound`);
    }

    res.status(err.status || 500).send(err.message || 'Internal Server Error');
});

// Start Server
app.listen(PORT, 'localhost', () => {
    console.log(`Server running at ${HOST}:${PORT}`);
=======
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
  console.log(`\n${'='.repeat(50)}`);
  console.log(`🚀 Server running at ${BACKEND_BASE_URL}`);
  console.log(`📡 CORS enabled for: ${allowedOrigins.join(', ')}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`${'='.repeat(50)}\n`);
>>>>>>> 5c15a63c9d962e9f10b9093c1b3168c074a5f5cf
});