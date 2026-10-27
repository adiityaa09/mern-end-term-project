const rateLimit = require('express-rate-limit');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

/**
 * Strict rate limiter for authentication routes to mitigate brute force & credential stuffing
 */
const authRateLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs, // Default: 15 minutes
  max: env.rateLimit.maxAuth, // Default: 20 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(
      new ApiError(
        429,
        'Too many authentication requests from this IP. Please try again after 15 minutes.'
      )
    );
  }
});

module.exports = {
  authRateLimiter
};
