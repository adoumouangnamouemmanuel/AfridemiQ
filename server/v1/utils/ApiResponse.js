/**
 * Standard API Response class for consistent response formatting
 */
class ApiResponse {
  /**
   * Create a standardized API response
   * @param {number} statusCode - HTTP status code
   * @param {any} data - Response data
   * @param {string} message - Response message
   */
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

module.exports = { ApiResponse };