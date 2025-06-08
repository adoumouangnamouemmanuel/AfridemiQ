// UTF-8 encoding middleware to handle French characters properly

const utf8Middleware = (req, res, next) => {
  // Set response headers for UTF-8
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  next();
};

module.exports = utf8Middleware;
