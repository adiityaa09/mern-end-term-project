const ApiError = require('../utils/ApiError');

/**
 * Reusable request validation middleware powered by Zod
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @param {'body' | 'query' | 'params'} property - Request object property to validate
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[property]);

    if (!result.success) {
      const formattedErrors = result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message
      }));

      return next(ApiError.unprocessable('Validation Error', formattedErrors));
    }

    // Replace request data with parsed/sanitized value
    req[property] = result.data;
    next();
  };
};

module.exports = validate;
