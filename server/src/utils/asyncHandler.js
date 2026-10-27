/**
 * Higher-order wrapper catching asynchronous exceptions and forwarding to next(err)
 * Eliminates repetitive try-catch blocks in Express controllers
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

module.exports = asyncHandler;
