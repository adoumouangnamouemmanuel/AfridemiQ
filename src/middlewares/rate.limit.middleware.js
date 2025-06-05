const rateLimit = require("express-rate-limit");

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
  };

  return rateLimit({
    ...defaultOptions,
    ...options,
  });
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
