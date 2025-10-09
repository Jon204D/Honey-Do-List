// configs the database MongoDB
const mongoose = require("mongoose");
const mongoURI = process.env.MONGO_URI


const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, { // references the varaible URI for local .env
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1); // exits if DB connection fails
  }
};

module.exports = connectDB;