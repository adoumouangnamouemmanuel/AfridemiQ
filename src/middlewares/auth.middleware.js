const jwt = require("jsonwebtoken");
const UnauthorizedError = require("../errors/unauthorizedError");

// Verify JWT token
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Token d’authentification manquant");
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { _id: payload.userId, role: payload.role };
    next();
  } catch (error) {
    throw new UnauthorizedError("Token d’authentification invalide");
  }
};

module.exports = authMiddleware;