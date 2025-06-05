const { StatusCodes } = require("http-status-codes");
const CustomError = require("./customError");

class ForbiddenError extends CustomError {
  constructor(message) {
    super(message, StatusCodes.FORBIDDEN);
  }
}

module.exports = ForbiddenError;