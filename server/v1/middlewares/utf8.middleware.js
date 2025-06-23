const createLogger = require("../services/logging.service");

const logger = createLogger("UTF8Middleware");

const utf8Middleware = (req, res, next) => {
  // Set UTF-8 response headers for all requests
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  // Handle incoming request encoding
  if (req.body && typeof req.body === "object") {
    // Ensure all string fields in request body are properly encoded
    req.body = JSON.parse(JSON.stringify(req.body));
  }

  logger.debug(`Setting UTF-8 headers for ${req.method} ${req.path}`);
  next();
};

module.exports = utf8Middleware;
