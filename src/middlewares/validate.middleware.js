const BadRequestError = require("../errors/badRequestError");

// Validate request body with Joi schema
const validateMiddleware = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const messages = error.details.map((detail) => detail.message).join(", ");
    throw new BadRequestError(`Validation échouée: ${messages}`);
  }
  next();
};

module.exports = validateMiddleware;
