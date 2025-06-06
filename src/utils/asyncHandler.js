/**
 * Async handler to wrap async route handlers for error handling
 * Eliminates the need for try/catch blocks in route handlers
 *
 * @param {Function} requestHandler - Async route handler function
 * @returns {Function} Express middleware function
 */
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

module.exports = { asyncHandler };
