const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors/customError");

/**
 * Global error handling middleware
 */
const errorMiddleware = (err, req, res, next) => {
  // Log error for debugging (consider using a proper logging library)
  console.error(`[${new Date().toISOString()}] Error:`, {
    path: req.path,
    method: req.method,
    error: err.message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });

  // Handle known errors
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      message: err.message,
      status: "error",
      code: err.name,
    });
  }

  // Handle mongoose validation errors
  if (err.name === "ValidationError") {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: Object.values(err.errors)
        .map((e) => e.message)
        .join(", "),
      status: "error",
      code: "VALIDATION_ERROR",
    });
  }

  // Handle duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(StatusCodes.CONFLICT).json({
      message: `${field} existe déjà`,
      status: "error",
      code: "DUPLICATE_ERROR",
    });
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Token invalide",
      status: "error",
      code: "INVALID_TOKEN",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Token expiré",
      status: "error",
      code: "EXPIRED_TOKEN",
    });
  }

  // Default to 500 server error
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    message:
      process.env.NODE_ENV === "production"
        ? "Une erreur interne est survenue"
        : err.message,
    status: "error",
    code: "INTERNAL_ERROR",
  });
};

module.exports = errorMiddleware;
