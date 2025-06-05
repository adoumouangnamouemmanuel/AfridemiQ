const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors/customError");

// Handle errors globally
const errorMiddleware = (err, req, res, next) => {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      message: err.message,
      status: "error",
    });
  }
  console.error(err);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    message: "Une erreur interne est survenue",
    status: "error",
  });
};

module.exports = errorMiddleware;
