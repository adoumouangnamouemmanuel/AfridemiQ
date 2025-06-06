const { StatusCodes } = require("http-status-codes");
const userService = require("../../services/user/user.service");
const jwt = require("jsonwebtoken");
const tokenBlacklist = require("../../services/token.blacklist.service");

// Register a new user
const register = async (req, res) => {
  const { user, token } = await userService.register(req.body);
  res.status(StatusCodes.CREATED).json({
    message: "Utilisateur créé avec succès",
    data: { user, token },
  });
};

// Login user
const login = async (req, res) => {
  const { user, token, refreshToken } = await userService.login(req.body);
  res.status(StatusCodes.OK).json({
    message: "Connexion réussie",
    data: { user, token, refreshToken },
  });
};

// Get user profile
const getProfile = async (req, res) => {
  const user = await userService.getProfile(req.user.userId); // Changed from _id to userId
  res.status(StatusCodes.OK).json({
    message: "Profil récupéré avec succès",
    data: user,
  });
};

// Update user profile
const updateProfile = async (req, res) => {
  const user = await userService.updateProfile(req.user.userId, req.body); // Changed from _id to userId
  res.status(StatusCodes.OK).json({
    message: "Profil mis à jour avec succès",
    data: user,
  });
};

// Delete user
const deleteUser = async (req, res) => {
  await userService.deleteUser(req.user.userId); // Changed from _id to userId
  res.status(StatusCodes.OK).json({
    message: "Utilisateur supprimé avec succès",
  });
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  const { users, count } = await userService.getAllUsers(req.query);
  res.status(StatusCodes.OK).json({
    message: "Liste des utilisateurs récupérée",
    data: { users, total: count },
  });
};

// Update preferences
const updatePreferences = async (req, res) => {
  const user = await userService.updatePreferences(req.user.userId, req.body); // Changed from _id to userId
  res.status(StatusCodes.OK).json({
    message: "Préférences mises à jour",
    data: user,
  });
};

// Update progress
const updateProgress = async (req, res) => {
  const user = await userService.updateProgress(req.user.userId, req.body); // Changed from _id to userId
  res.status(StatusCodes.OK).json({
    message: "Progrès mis à jour",
    data: user,
  });
};

// Add friend
const addFriend = async (req, res) => {
  const user = await userService.addFriend(req.user.userId, req.params.friendId);
  res.status(StatusCodes.OK).json({
    message: "Ami ajouté avec succès",
    data: user,
  });
};

// Remove friend
const removeFriend = async (req, res) => {
  const user = await userService.removeFriend(
    req.user.userId,
    req.params.friendId
  );
  res.status(StatusCodes.OK).json({
    message: "Ami supprimé avec succès",
    data: user,
  });
};

// Verify phone
const verifyPhone = async (req, res) => {
  const user = await userService.verifyPhone(req.user.userId, req.body.code); // Changed from _id to userId
  res.status(StatusCodes.OK).json({
    message: "Téléphone vérifié avec succès",
    data: user,
  });
};

// Request phone verification code
const requestPhoneVerification = async (req, res) => {
  await userService.requestPhoneVerification(
    req.user.userId, // Changed from _id to userId
    req.body.phoneNumber
  );
  res.status(StatusCodes.OK).json({
    message: "Code de vérification envoyé",
  });
};

// Update subscription
const updateSubscription = async (req, res) => {
  const user = await userService.updateSubscription(req.user.userId, req.body); // Changed from _id to userId
  res.status(StatusCodes.OK).json({
    message: "Abonnement mis à jour",
    data: user,
  });
};

// Get user by ID
const getUserById = async (req, res) => {
  const user = await userService.getUserById(req.params.id, req.user);
  res.status(StatusCodes.OK).json({
    message: "Utilisateur récupéré avec succès",
    data: user,
  });
};

// Log out user
const logOut = async (req, res) => {
  try {
    // Get the token from the authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];

      // Verify the token to get its expiry
      const decoded = jwt.decode(token);
      if (decoded && decoded.exp) {
        // Add token to blacklist until it expires
        const expiryMs = decoded.exp * 1000; // Convert to milliseconds
        tokenBlacklist.addToBlacklist(token, expiryMs);
      }
    }

    // Update user's tokenVersion to invalidate all existing tokens
    await userService.logOut(req.user.userId);

    logger.info(`User logged out: ${req.user.userId}`);

    res.status(StatusCodes.OK).json({
      message: "Déconnexion réussie",
    });
  } catch (error) {
    logger.error("Logout error", error, { userId: req.user.userId });
    throw error;
  }
};

// Request password reset
const requestPasswordReset = async (req, res) => {
  await userService.requestPasswordReset(req.body.email);
  res.status(StatusCodes.OK).json({
    message: "Lien de réinitialisation envoyé",
  });
};

// Reset password
const resetPassword = async (req, res) => {
  await userService.resetPassword(req.body.token, req.body.password);
  res.status(StatusCodes.OK).json({
    message: "Mot de passe réinitialisé avec succès",
  });
};

// Refresh token
const refreshToken = async (req, res) => {
  const { token } = await userService.refreshToken(req.body.refreshToken);
  res.status(StatusCodes.OK).json({
    message: "Token rafraîchi avec succès",
    data: { token },
  });
};

// Search users
const searchUsers = async (req, res) => {
  const { users, count } = await userService.searchUsers(req.query, req.user);
  res.status(StatusCodes.OK).json({
    message: "Utilisateurs trouvés",
    data: { users, total: count },
  });
};

// Update social profile
const updateSocialProfile = async (req, res) => {
  const user = await userService.updateSocialProfile(req.user.userId, req.body); // Changed from _id to userId
  res.status(StatusCodes.OK).json({
    message: "Profil social mis à jour",
    data: user,
  });
};

// Block friend
const blockFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user.userId;

    const user = await userService.blockFriend(userId, friendId);
    res.status(StatusCodes.OK).json({
      message: "Utilisateur bloqué avec succès",
      data: user
    });
  } catch (error) {
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      status: "error",
      code: error.name
    });
  }
};

// Unblock friend
const unblockFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user.userId;

    const user = await userService.unblockFriend(userId, friendId);
    res.status(StatusCodes.OK).json({
      message: "Utilisateur débloqué avec succès",
      data: user
    });
  } catch (error) {
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      status: "error",
      code: error.name
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  deleteUser,
  getAllUsers,
  updatePreferences,
  updateProgress,
  addFriend,
  removeFriend,
  verifyPhone,
  requestPhoneVerification,
  updateSubscription,
  getUserById,
  logOut,
  requestPasswordReset,
  resetPassword,
  refreshToken,
  searchUsers,
  updateSocialProfile,
  blockFriend,
  unblockFriend,
};
