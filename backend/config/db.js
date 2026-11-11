const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/project1');
    console.log(`MongoDB Connected: ${conn.connection.host} | Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    console.log('⚠️ Make sure your MongoDB service is running (or configure MONGO_URI in .env).');
  }
};

module.exports = connectDB;
