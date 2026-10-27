const app = require('./src/app');
const env = require('./src/config/env');
const connectDB = require('./src/config/db');
const logger = require('./src/utils/logger');
const { initReminderCron } = require('./src/jobs/reminderCron');
const mongoose = require('mongoose');

// Handle uncaught exceptions synchronously
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`, err.stack);
  process.exit(1);
});

let server;

const startServer = async () => {
  // Connect to Database
  await connectDB();

  // Start HTTP Listener
  server = app.listen(env.port, () => {
    logger.success(`🚀 Server running in [${env.nodeEnv}] mode on http://localhost:${env.port}`);
    logger.info(`Health check: http://localhost:${env.port}/api/v1/health`);

    // Initialize scheduled jobs
    initReminderCron();
  });
};

// Graceful shutdown handling
const shutdown = (signal) => {
  logger.warn(`${signal} received. Initiating graceful shutdown...`);
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed.');
      try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed.');
      } catch (err) {
        logger.error(`Error closing MongoDB: ${err.message}`);
      }
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Unhandled Promise Rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

startServer();
