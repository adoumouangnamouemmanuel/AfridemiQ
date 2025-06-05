const { StatusCodes } = require("http-status-codes");
const CustomError = require("./customError");

class BadRequestError extends CustomError {
  constructor(message) {
    super(message, StatusCodes.BAD_REQUEST);
  }
}

module.exports = BadRequestError;
