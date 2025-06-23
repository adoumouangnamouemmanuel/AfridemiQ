const BadRequestError = require("../errors/badRequestError");
const createLogger = require("../services/logging.service");

const logger = createLogger("ValidateMiddleware");

const validateMiddleware =
  (schema, source = "body") =>
  (req, res, next) => {
    try {
      const data = req[source];
      const { error } = schema.validate(data, { abortEarly: false });
      if (error) {
        const messages = error.details.reduce((acc, detail) => {
          acc[detail.path.join(".")] = detail.message;
          return acc;
        }, {});
        logger.warn(
          `Validation failed for ${source}: ${JSON.stringify(messages)}`,
          {
            path: req.path,
            method: req.method,
          }
        );
        throw new BadRequestError("Validation échouée", messages);
      }
      next();
    } catch (error) {
      logger.error(`Validation middleware error: ${error.message}`, {
        path: req.path,
        method: req.method,
      });
      next(error);
    }
  };

module.exports = validateMiddleware;
