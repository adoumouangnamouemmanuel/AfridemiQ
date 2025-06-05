/**
 * Simple in-memory token blacklist
 * In production, use Redis or another distributed cache
 */
class TokenBlacklist {
  constructor() {
    this.blacklistedTokens = new Map();

    // Clean up expired tokens every hour
    setInterval(() => this.cleanupExpiredTokens(), 60 * 60 * 1000);
  }

  /**
   * Add a token to the blacklist
   * @param {string} token - The token to blacklist
   * @param {number} expiryTimestamp - When the token expires (in ms)
   */
  addToBlacklist(token, expiryTimestamp) {
    // Store only the first 10 chars of the token as a key (for memory efficiency)
    // along with the expiry timestamp
    const tokenKey = token.substring(0, 10);
    this.blacklistedTokens.set(tokenKey, expiryTimestamp);
  }

  /**
   * Check if a token is blacklisted
   * @param {string} token - The token to check
   * @returns {boolean} True if blacklisted
   */
  isBlacklisted(token) {
    const tokenKey = token.substring(0, 10);
    return this.blacklistedTokens.has(tokenKey);
  }

  /**
   * Remove expired tokens from the blacklist
   */
  cleanupExpiredTokens() {
    const now = Date.now();
    for (const [token, expiry] of this.blacklistedTokens.entries()) {
      if (expiry < now) {
        this.blacklistedTokens.delete(token);
      }
    }
  }
}

// Singleton instance
const tokenBlacklist = new TokenBlacklist();

module.exports = tokenBlacklist;