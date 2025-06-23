const ForbiddenError = require("../errors/forbiddenError");
const createLogger = require("../services/logging.service");

const logger = createLogger("RateLimitMiddleware");
/**
 * Middleware to restrict access based on user roles
 * @param {Array} allowedRoles - Array of roles that are allowed to access the route
 * @returns {Function} Express middleware function
 */
// Restrict access to specific roles
const roleMiddleware = (allowedRoles) => (req, res, next) => {
  try {
    if (!allowedRoles.includes(req.user.role)) {
      logger.warn(
        `Forbidden access attempt by user ${req.user.userId} with role ${req.user.role} on ${req.path}`
      );
      throw new ForbiddenError(ERROR_MESSAGES.FORBIDDEN_ACCESS);
    }
    next();
  } catch (error) {
    logger.error(`Role middleware error: ${error.message}`, {
      userId: req.user.userId,
      path: req.path,
      method: req.method,
    });
    next(error);
  }
};

module.exports = roleMiddleware;
