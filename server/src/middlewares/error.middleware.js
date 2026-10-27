const ApiError = require('../utils/ApiError');
const env = require('../config/env');
const logger = require('../utils/logger');

/**
 * Centralized error-handling middleware.
 * Intercepts all operational errors, database anomalies, and uncaught exceptions.
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Log error stack for debugging
  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`, err.stack);

  // 1. If not an instance of ApiError, classify and normalize
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || (error.name === 'ValidationError' ? 400 : 500);
    let message = error.message || 'Internal Server Error';
    let errors = [];

    // MongoDB Duplicate Key Error (E11000)
    if (error.code === 11000) {
      const keys = Object.keys(error.keyValue || {});
      const field = keys.length ? keys.join(', ') : 'field';
      message = `Duplicate field value entered for: ${field}. Please use another value.`;
      error = new ApiError(409, message);
    }
    // Mongoose Validation Error
    else if (error.name === 'ValidationError') {
      errors = Object.values(error.errors || {}).map((val) => ({
        field: val.path,
        message: val.message
      }));
      message = 'Validation failed for one or more fields.';
      error = new ApiError(400, message, errors);
    }
    // Mongoose Invalid ObjectId (CastError)
    else if (error.name === 'CastError') {
      message = `Resource not found. Invalid identifier: ${error.value}`;
      error = new ApiError(400, message);
    }
    // JWT Authentication Errors
    else if (error.name === 'JsonWebTokenError') {
      message = 'Invalid authentication token. Please log in again.';
      error = new ApiError(401, message);
    } else if (error.name === 'TokenExpiredError') {
      message = 'Authentication token expired. Please log in again.';
      error = new ApiError(401, message);
    } else {
      error = new ApiError(statusCode, message, errors, err.stack);
    }
  }

  // 2. Structured JSON response contract
  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors && error.errors.length ? error.errors : undefined,
    ...(env.nodeEnv === 'development' && { stack: error.stack })
  };

  return res.status(error.statusCode).json(response);
};

module.exports = errorHandler;
