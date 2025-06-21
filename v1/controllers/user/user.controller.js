const { StatusCodes } = require("http-status-codes");
const userService = require("../../services/user/user.service");
const jwt = require("jsonwebtoken");
const tokenBlacklist = require("../../services/token.blacklist.service");
const createLogger = require("../../services/logging.service");

const logger = createLogger("UserController");

// =============== CORE AUTH (KEEP 100% INTACT) ===============

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
  try {
    // TODO: Remove detailed logging before production
    console.log("🌐 CONTROLLER: Login request received for:", req.body.email);

    const { user, token, refreshToken } = await userService.login(req.body);

    // TODO: Remove detailed logging before production
    console.log("✅ CONTROLLER: Login successful for user:", user._id);

    res.status(StatusCodes.OK).json({
      message: "Connexion réussie",
      data: { user, token, refreshToken },
    });
  } catch (error) {
    // TODO: Remove detailed logging before production
    console.error("❌ CONTROLLER: Login failed:", error.message);
    throw error;
  }
};

// =============== PROFILE MANAGEMENT ===============

// Get user profile
const getProfile = async (req, res) => {
  const user = await userService.getProfile(req.user.userId);
  res.status(StatusCodes.OK).json({
    message: "Profil récupéré avec succès",
    data: user,
  });
};

// Update user profile
const updateProfile = async (req, res) => {
  const user = await userService.updateProfile(req.user.userId, req.body);
  res.status(StatusCodes.OK).json({
    message: "Profil mis à jour avec succès",
    data: user,
  });
};

// Update personal information
const updatePersonalInfo = async (req, res) => {
  const user = await userService.updatePersonalInfo(req.user.userId, req.body);
  res.status(StatusCodes.OK).json({
    message: "Informations personnelles mises à jour avec succès",
    data: user,
  });
};

// Delete user
const deleteUser = async (req, res) => {
  await userService.deleteUser(req.user.userId);
  res.status(StatusCodes.OK).json({
    message: "Utilisateur supprimé avec succès",
  });
};

// =============== ONBOARDING ===============

// Complete onboarding process
const completeOnboarding = async (req, res) => {
  const user = await userService.completeOnboarding(req.user.userId, req.body);
  res.status(StatusCodes.OK).json({
    message: "Inscription complétée avec succès",
    data: user,
  });
};

// Check onboarding status
const checkOnboardingStatus = async (req, res) => {
  const status = await userService.checkOnboardingStatus(req.user.userId);
  res.status(StatusCodes.OK).json({
    message: "Statut d'inscription récupéré",
    data: status,
  });
};

// =============== PASSWORD MANAGEMENT ===============

// Change password
const changePassword = async (req, res) => {
  await userService.changePassword(req.user.userId, req.body);
  res.status(StatusCodes.OK).json({
    message: "Mot de passe modifié avec succès",
  });
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

// =============== TOKEN MANAGEMENT ===============

// Refresh token
const refreshToken = async (req, res) => {
  try {
    // TODO: Remove detailed logging before production
    console.log("🔄 CONTROLLER: Token refresh request received");

    const { token } = await userService.refreshToken(req.body.refreshToken);

    // TODO: Remove detailed logging before production
    console.log("✅ CONTROLLER: Token refresh successful");

    res.status(StatusCodes.OK).json({
      message: "Token rafraîchi avec succès",
      data: { token },
    });
  } catch (error) {
    // TODO: Remove detailed logging before production
    console.error("❌ CONTROLLER: Token refresh failed:", error.message);
    throw error;
  }
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

// =============== USER SEARCH & DISCOVERY ===============

// Search users
const searchUsers = async (req, res) => {
  try {
    const {
      search,
      page = 1,
      limit = 10,
      country,
      examType,
      educationLevel,
    } = req.query;

    if (!search) {
      return res.status(400).json({
        success: false,
        message: "Le terme de recherche est requis",
      });
    }

    const result = await userService.searchUsers(
      search,
      Number.parseInt(page),
      Number.parseInt(limit),
      { country, examType, educationLevel }
    );

    res.json({
      success: true,
      data: {
        users: result.users,
        pagination: {
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
          hasMore: result.page < result.totalPages,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la recherche des utilisateurs",
      error: error.message,
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  const user = await userService.getUserById(req.params.id, req.user);
  res.status(StatusCodes.OK).json({
    message: "Utilisateur récupéré avec succès",
    data: user,
  });
};

// =============== ADMIN ROUTES ===============

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  const { users, count } = await userService.getAllUsers(req.query);
  res.status(StatusCodes.OK).json({
    message: "Liste des utilisateurs récupérée",
    data: { users, total: count },
  });
};

module.exports = {
  // Core auth (100% intact)
  register,
  login,

  // Profile management
  getProfile,
  updateProfile,
  updatePersonalInfo,
  deleteUser,

  // Onboarding
  completeOnboarding,
  checkOnboardingStatus,

  // Password management
  changePassword,
  requestPasswordReset,
  resetPassword,

  // Token management
  refreshToken,
  logOut,

  // User search & discovery
  searchUsers,
  getUserById,

  // Admin
  getAllUsers,
};
