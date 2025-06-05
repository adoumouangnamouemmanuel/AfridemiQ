const ForbiddenError = require("../errors/forbiddenError");

// Restrict access to specific roles
const roleMiddleware = (allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.user.role)) {
    throw new ForbiddenError("Accès non autorisé pour ce rôle");
  }
  next();
};

module.exports = roleMiddleware;
