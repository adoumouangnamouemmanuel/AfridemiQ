const jwt = require("jsonwebtoken");
const UnauthorizedError = require("../errors/unauthorizedError");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Token d'authentification manquant");
    }

    const token = authHeader.split(" ")[1];

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined!");
      throw new UnauthorizedError("Erreur de configuration d'authentification");
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);

      // Set both _id and userId for backward compatibility
      req.user = {
        _id: payload.userId,
        userId: payload.userId,
        role: payload.role,
      };

      next();
    } catch (jwtError) {
      if (jwtError.name === "TokenExpiredError") {
        throw new UnauthorizedError("Token expiré");
      } else {
        throw new UnauthorizedError("Token d'authentification invalide");
      }
    }
  } catch (error) {
    next(error);
  }
};

module.exports = authMiddleware;