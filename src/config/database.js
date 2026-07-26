const mongoose = require('mongoose');
const { MONGODB_URI } = require('./env');
const logger = require('./logger');

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    logger.info('✅ MongoDB connected');
  } catch (err) {
    logger.error(`❌ MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};
module.exports = connectDB;
