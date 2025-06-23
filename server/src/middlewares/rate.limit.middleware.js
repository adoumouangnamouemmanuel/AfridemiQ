const rateLimit = require("express-rate-limit");
const createLogger = require("../services/logging.service");

const logger = createLogger("RateLimitMiddleware");

/**
 * Create a rate limiter middleware
 * @param {Object} options - Rate limiting options
 * @returns {Function} Express middleware
 */
const createRateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
      message: "Trop de requêtes, veuillez réessayer plus tard",
      status: "error",
      code: "RATE_LIMIT_EXCEEDED",
    },
    keyGenerator: (req) => {
      // Use user ID for authenticated users, fallback to IP
      return req.user?.userId || req.ip;
    },
  };

  // Validate options
  if (
    options.message &&
    (!options.message.message ||
      !options.message.status ||
      !options.message.code)
  ) {
    throw new Error("Invalid message configuration in rate limiter options");
  }

  const limiter = rateLimit({
    ...defaultOptions,
    ...options,
    handler: (req, res, next, optionsUsed) => {
      logger.warn(
        `Rate limit exceeded for ${req.user?.userId || req.ip} on ${req.path}`
      );
      res.status(429).json(optionsUsed.message);
    },
  });

  return limiter;
};

// Authentication rate limiter (more strict)
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per 15 minutes
  message: {
    message: "Trop de tentatives de connexion, veuillez réessayer plus tard",
    status: "error",
    code: "AUTH_RATE_LIMIT_EXCEEDED",
  },
});

// General API rate limiter
const apiLimiter = createRateLimiter();

module.exports = {
  authLimiter,
  apiLimiter,
};
