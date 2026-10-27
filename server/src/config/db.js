const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.mongoUri, {
      autoIndex: true // Ensure compound indexes are built in development
    });

    logger.success(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    logger.error(`MongoDB Connection Error: ${error.message}`);
    // If running in development without MongoDB running, log a helpful tip
    logger.warn('Tip: Ensure MongoDB service is running locally or provide a valid MONGODB_URI in server/.env');
    // We do not forcibly exit if running tests or mocking DB
    if (env.nodeEnv === 'production') {
      process.exit(1);
    }
    return null;
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB connection lost. Reconnecting...');
});

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB connection event error: ${err.message}`);
});

module.exports = connectDB;
