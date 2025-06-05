const jwt = require("jsonwebtoken");
const redis = require("redis");
const UnauthorizedError = require("../errors/unauthorizedError");

// Redis client
const redisClient = redis.createClient({ url: process.env.REDIS_URL });
redisClient
  .connect()
  .catch((err) => console.error("Redis connection error:", err));

// Verify JWT token
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Token d’authentification manquant");
  }
  const token = authHeader.split(" ")[1];
  try {
    const isBlacklisted = await redisClient.get(`blacklist:${token}`);
    if (isBlacklisted) throw new UnauthorizedError("Token révoqué");
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { _id: payload.userId, role: payload.role };
    next();
  } catch (error) {
    throw new UnauthorizedError("Token d’authentification invalide");
  }
};

module.exports = authMiddleware;