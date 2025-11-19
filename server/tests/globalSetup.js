// tests/globalSetup.js - Runs once before all tests to drop test DB early
// This prevents race conditions between model index creation and test data insertion

const mongoose = require('mongoose');
require('dotenv').config();

module.exports = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/honey-do-list-test';
  
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoUri);
    console.log('✓ Global setup: Connected to MongoDB');
    
    // Drop the test database to ensure clean state
    await mongoose.connection.dropDatabase();
    console.log('✓ Global setup: Test database dropped');
    
    // Close the connection
    await mongoose.disconnect();
    console.log('✓ Global setup: Disconnected from MongoDB');
  } catch (error) {
    console.error('✗ Global setup error:', error.message);
    // Don't fail the test run if DB doesn't exist yet
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
};
