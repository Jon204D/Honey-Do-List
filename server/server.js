// server.js - Main server file for the Task Management API

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('../config/db');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require("./routes/userRoutes");
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Environment Variables
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'http://localhost';
const PROD_STATUS = process.env.IN_PROD || false;
const CLIENT_ORIGIN = process.env.ClientHost;
const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL;

// Define allowed origins
const allowedOrigins = [CLIENT_ORIGIN];

// CORS Configuration
const corsOptions = {
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Cache-Control', 'X-Requested-With', 'Custom-Header'],
  credentials: true, // allow cookies from frontend if needed
};

// Middleware
connectDB();                           // Connect to MongoDB
app.use(cors(corsOptions));           // CORS
app.use(express.json());              // Parse JSON bodies
app.use(cookieParser());              // Parse cookies

// Extra control
app.use((req, res, next) => {
  if (allowedOrigins.includes(req.headers.origin)) {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  next();
});

// Routes
app.use('/api/tasks', taskRoutes);
app.use("/api/users", userRoutes);

app.get('/', (req, res) => {
  if (PROD_STATUS === 'true') {
    res.send(`The server is running successfully.<br/>Server URL: ${BACKEND_BASE_URL}`);
  } else {
    res.send(`The server is running successfully.<br/>Port: ${PORT}<br/>Server URL: ${BACKEND_BASE_URL}`);
  }
});

// 404 Handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// General Error Handler
app.use((err, req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', allowedOrigins.join(','));
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (err.status === 404) {
    return res.redirect(`${HOST}/PageNotFound`);
  }

  res.status(err.status || 500).send(err.message || 'Internal Server Error');
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at ${HOST}:${PORT}`);
});