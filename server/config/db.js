const mongoose = require('mongoose');

module.exports = async function connectDB() {
  const uri = process.env.DB_URI;
  if (!uri) {
    console.warn('DB_URI not set in .env');
    return;
  }
  try {
    await mongoose.connect(uri, { });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};
