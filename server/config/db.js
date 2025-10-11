// server/config/db.js

const mongoose = require('mongoose');


const connectDB = async (mongoURI) => {
  try {
    await mongoose.connect(mongoURI); 
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;