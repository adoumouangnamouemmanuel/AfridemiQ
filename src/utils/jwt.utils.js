const jwt = require("jsonwebtoken");

/**
 * Generate JWT access token
 * @param {Object} payload - The payload to encode in the token
 * @returns {string} The generated JWT token
 */

// const expiration = process.env.NODE_ENV === "production" ? "1d" : "1h";

const expiration = "1h"; // Default expiration time for access tokens
const generateToken = (payload) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not defined");
  }
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: expiration,
  });
};

/**
 * Generate JWT refresh token
 * @param {Object} payload - The payload to encode in the token
 * @returns {string} The generated refresh token
 */
const generateRefreshToken = (payload) => {
  if (
    !process.env.JWT_REFRESH_SECRET ||
    process.env.JWT_REFRESH_SECRET === process.env.JWT_SECRET
  ) {
    console.warn(
      "WARNING: Using same secret for access and refresh tokens or JWT_REFRESH_SECRET not defined"
    );
  }

  // Use a different secret for refresh tokens if available, otherwise fall back to JWT_SECRET
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

  return jwt.sign(payload, secret, { expiresIn: "7d" });
};

/**
 * Verify a JWT token
 * @param {string} token - The token to verify
 * @param {boolean} isRefresh - Whether this is a refresh token
 * @returns {Object} The decoded token payload
 */
const verifyToken = (token, isRefresh = false) => {
  const secret =
    isRefresh && process.env.JWT_REFRESH_SECRET
      ? process.env.JWT_REFRESH_SECRET
      : process.env.JWT_SECRET;

  return jwt.verify(token, secret);
};

module.exports = { generateToken, generateRefreshToken, verifyToken };
