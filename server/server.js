// server/server.js

const express = require('express');
const dotenv = require('dotenv');
const connectDB = require("../config/db"); // accesses new folder for DB connection logic
const taskRoutes = require('./routes/taskRoutes');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables from .env.template (rename to .env in production)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// initializes DB connection, echoes in /config/db.js
connectDB();

// Middleware
app.use(express.json()); // Parse JSON request bodies

// Routes
app.use('/api/tasks', taskRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Honey Do List API is running...');
});

// Error Handler (should come AFTER all routes)
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});