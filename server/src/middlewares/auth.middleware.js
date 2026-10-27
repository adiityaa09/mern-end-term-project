const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

/**
 * Authentication guard middleware.
 * Verifies JWT from httpOnly cookie or Authorization Bearer header,
 * checks database existence, and binds authenticated user to req.user.
 */
const authenticate = asyncHandler(async (req, res, next) => {
  let token = null;

  // 1. Check httpOnly cookie first (primary browser storage)
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. Fall back to Authorization Bearer header (for API / Postman / Mobile clients)
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw ApiError.unauthorized('Authentication required. No token provided.');
  }

  // 3. Verify JWT token signature and expiration
  let decoded;
  try {
    decoded = jwt.verify(token, env.jwt.secret);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Session expired. Please log in again.');
    }
    throw ApiError.unauthorized('Invalid authentication token.');
  }

  // 4. Validate that the user still exists in the database
  const user = await User.findById(decoded.id).select('-password');
  if (!user) {
    throw ApiError.unauthorized('The user belonging to this token no longer exists.');
  }

  // 5. Attach user object to request
  req.user = user;
  next();
});

module.exports = authenticate;
