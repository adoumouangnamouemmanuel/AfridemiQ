const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors/customError");
const createLogger = require("../logging.service");

const logger = createLogger("ErrorMiddleware");

const errorMiddleware = (err, req, res, next) => {
  const userId = req.user?.userId || "anonymous";
  const errorContext = {
    path: req.path,
    method: req.method,
    userId,
    error: err.message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  };

  logger.error(`[${new Date().toISOString()}] Error:`, errorContext);

  const errorResponse = {
    success: false,
    status: "error",
    message:
      process.env.NODE_ENV === "production"
        ? "Une erreur interne est survenue"
        : err.message,
    code: "INTERNAL_ERROR",
  };

  // Map known error types to specific responses
  const errorMap = {
    CustomError: () => ({
      statusCode: err.statusCode,
      message: err.message,
      code: err.name,
    }),
    ValidationError: () => ({
      statusCode: StatusCodes.BAD_REQUEST,
      message: Object.values(err.errors)
        .map((e) => e.message)
        .join(", "),
      code: "VALIDATION_ERROR",
    }),
    11000: () => ({
      statusCode: StatusCodes.CONFLICT,
      message: `${Object.keys(err.keyValue)[0]} existe déjà`,
      code: "DUPLICATE_ERROR",
    }),
    JsonWebTokenError: () => ({
      statusCode: StatusCodes.UNAUTHORIZED,
      message: "Token invalide",
      code: "INVALID_TOKEN",
    }),
    TokenExpiredError: () => ({
      statusCode: StatusCodes.UNAUTHORIZED,
      message: "Token expiré",
      code: "EXPIRED_TOKEN",
    }),
  };

  const errorHandler = errorMap[err.name] || errorMap[err.code];
  if (errorHandler) {
    const { statusCode, message, code } = errorHandler();
    errorResponse.message = message;
    errorResponse.code = code;
    return res.status(statusCode).json(errorResponse);
  }

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
};

module.exports = errorMiddleware;
