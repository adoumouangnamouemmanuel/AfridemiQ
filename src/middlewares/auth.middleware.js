const jwt = require("jsonwebtoken");
const UnauthorizedError = require("../errors/unauthorizedError");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Missing or invalid authorization header");
      throw new UnauthorizedError("Token d'authentification manquant");
    }

    const token = authHeader.split(" ")[1];
    console.log("Extracted token:", token.substring(0, 20) + "...");

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined!");
      throw new UnauthorizedError("Configuration error");
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded payload:", payload);

    req.user = {
      _id: payload.userId,
      userId: payload.userId,
      role: payload.role,
    };

    console.log("User set in request:", req.user);
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    if (error.name === "JsonWebTokenError") {
      throw new UnauthorizedError("Token d'authentification invalide");
    } else if (error.name === "TokenExpiredError") {
      throw new UnauthorizedError("Token expiré");
    } else {
      throw new UnauthorizedError("Token d'authentification invalide");
    }
  }
};

module.exports = authMiddleware;