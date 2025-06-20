const BadRequestError = require("../errors/badRequestError");

/**
 * Middleware to validate key-value parameters for preference updates
 * @param {Array<string>} allowedKeys - Array of allowed preference keys
 * @returns {function} Express middleware function
 */
const validateKeyValueMiddleware = (allowedKeys) => {
  return (req, res, next) => {
    try {
      const { key, value } = req.params;

      console.log("🔍 KEY_VALUE_VALIDATION: Validating params:", {
        key,
        value,
      });

      // Validate key presence
      if (!key || key.trim() === "") {
        throw new BadRequestError("La clé de préférence est requise");
      }

      // Validate value presence
      if (value === undefined || value === null) {
        throw new BadRequestError("La valeur de préférence est requise");
      }

      // Validate key against allowed list
      if (!allowedKeys.includes(key.trim())) {
        throw new BadRequestError(
          `Clé de préférence invalide: ${key}. Les clés autorisées sont: ${allowedKeys.join(
            ", "
          )}`
        );
      }

      console.log("✅ KEY_VALUE_VALIDATION: Validation successful");
      next();
    } catch (error) {
      console.error(
        "❌ KEY_VALUE_VALIDATION: Validation failed:",
        error.message
      );
      next(error);
    }
  };
};

module.exports = validateKeyValueMiddleware;
