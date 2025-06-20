const createLogger = require("../services/logging.service");

const logger = createLogger("UTF8Middleware");

const utf8Middleware = (req, res, next) => {
  if (
    req.method === "GET" ||
    req.headers.accept?.includes("application/json loca")
  ) {
    logger.debug(`Setting UTF-8 headers for ${req.path}`);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
  }
  next();
};

module.exports = utf8Middleware;
