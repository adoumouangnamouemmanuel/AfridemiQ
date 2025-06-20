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

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  const { users, count } = await userService.getAllUsers(req.query);
  res.status(StatusCodes.OK).json({
    message: "Liste des utilisateurs récupérée",
    data: { users, total: count },
  });
};

// Update all preferences
const updateAllPreferences = async (req, res) => {
  try {
    const user = await userService.updateAllPreferences(
      req.user.userId,
      req.body
    );
    res.status(StatusCodes.OK).json({
      message: "Préférences mises à jour avec succès",
      data: user,
    });
  } catch (error) {
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      status: "error",
      code: error.name,
    });
  }
};

// Update specific preference type
const updatePreferenceType = async (req, res) => {
  try {
    const { type } = req.params;
    const user = await userService.updatePreferenceType(
      req.user.userId,
      type,
      req.body
    );
    res.status(StatusCodes.OK).json({
      message: "Préférences mises à jour avec succès",
      data: user,
    });
  } catch (error) {
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      status: "error",
      code: error.name,
    });
  }
};

// Update multiple preference types
const updateMultiplePreferences = async (req, res) => {
  try {
    const user = await userService.updateMultiplePreferences(
      req.user.userId,
      req.body
    );
    res.status(StatusCodes.OK).json({
      message: "Préférences mises à jour avec succès",
      data: user,
    });
  } catch (error) {
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      status: "error",
      code: error.name,
    });
  }
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
  const user = await userService.addFriend(
    req.user.userId,
    req.params.friendId
  );
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

// Search users
const searchUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    if (!search) {
      return res.status(400).json({
        success: false,
        message: "Le terme de recherche est requis",
      });
    }

    const result = await userService.searchUsers(
      search,
      Number.parseInt(page),
      Number.parseInt(limit)
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
      data: user,
    });
  } catch (error) {
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      status: "error",
      code: error.name,
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
      data: user,
    });
  } catch (error) {
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      status: "error",
      code: error.name,
    });
  }
};

// Updates the user's bio
// @route PUT /api/users/profile/bio
// @access Private
async function updateBio(req, res, next) {
  try {
    const userId = req.user.userId;
    const bioData = req.body;

    logger.info(`Updating bio for user ${userId}`);
    // TODO: Remove console.log before production
    console.log(`CONTROLLER: Updating bio for user ${userId}`);

    const updatedUser = await userService.updateBio(userId, bioData);

    res.status(StatusCodes.OK).json({
      message: "Biographie mise à jour avec succès",
      data: updatedUser,
    });
  } catch (error) {
    logger.error(`Error updating bio: ${error.message}`);
    next(error);
  }
}

// Updates the user's personal information
// @route PUT /api/users/profile/personal-info
// @access Private
async function updatePersonalInfo(req, res, next) {
  try {
    const userId = req.user.userId;
    const personalInfoData = req.body;

    logger.info(`Updating personal info for user ${userId}`);
    // TODO: Remove console.log before production
    console.log(`CONTROLLER: Updating personal info for user ${userId}`);

    const updatedUser = await userService.updatePersonalInfo(
      userId,
      personalInfoData
    );

    res.status(StatusCodes.OK).json({
      message: "Informations personnelles mises à jour avec succès",
      data: updatedUser,
    });
  } catch (error) {
    logger.error(`Error updating personal info: ${error.message}`);
    next(error);
  }
}

// Updates the user's education information
// @route PUT /api/users/profile/education
// @access Private
async function updateEducation(req, res, next) {
  try {
    const userId = req.user.userId;
    const educationData = req.body;

    logger.info(`Updating education info for user ${userId}`);
    // TODO: Remove console.log before production
    console.log(`CONTROLLER: Updating education info for user ${userId}`);

    const updatedUser = await userService.updateEducation(
      userId,
      educationData
    );

    res.status(StatusCodes.OK).json({
      message: "Informations éducatives mises à jour avec succès",
      data: updatedUser,
    });
  } catch (error) {
    logger.error(`Error updating education info: ${error.message}`);
    next(error);
  }
}

// Updates the user's exam preparation information
// @route PUT /api/users/profile/exam-preparation
// @access Private
async function updateExamPreparation(req, res, next) {
  try {
    const userId = req.user.userId;
    const examPrepData = req.body;

    logger.info(`Updating exam preparation for user ${userId}`);
    // TODO: Remove console.log before production
    console.log(`CONTROLLER: Updating exam preparation for user ${userId}`);

    const updatedUser = await userService.updateExamPreparation(
      userId,
      examPrepData
    );

    res.status(StatusCodes.OK).json({
      message: "Préparation à l'examen mise à jour avec succès",
      data: updatedUser,
    });
  } catch (error) {
    logger.error(`Error updating exam preparation: ${error.message}`);
    next(error);
  }
}

// Updates a single user preference using URL parameters
// @route PATCH /api/users/preferences/:key/:value
// @access Private
// Validation is handled by middleware with updateSinglePreferenceSchema
async function updateSinglePreference(req, res, next) {
  try {
    const userId = req.user.userId;
    const { key, value } = req.params;

    console.log(
      `🎯 CONTROLLER: User ${userId} updating preference "${key}" to: ${value}`
    );

    // Convert string value to appropriate type
    let convertedValue;
    if (value === "true") {
      convertedValue = true;
    } else if (value === "false") {
      convertedValue = false;
    } else if (!isNaN(value) && value !== "") {
      convertedValue = Number(value);
    } else {
      convertedValue = decodeURIComponent(value);
    }

    console.log(
      `🎯 CONTROLLER: Converted value:`,
      convertedValue,
      typeof convertedValue
    );

    // Call service (validation already done by middleware)
    const updatedUser = await userService.updateSinglePreference(
      userId,
      key.trim(),
      convertedValue
    );

    console.log(
      `✅ CONTROLLER: Preference update successful for user ${userId}`
    );

    res.status(StatusCodes.OK).json({
      message: "Préférence mise à jour avec succès",
      data: updatedUser,
    });
  } catch (error) {
    console.error(`❌ CONTROLLER: Error in updateSinglePreference:`, error);
    logger.error(`Error updating preference: ${error.message}`);
    next(error);
  }
}

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  deleteUser,
  getAllUsers,
  updateAllPreferences,
  updatePreferenceType,
  updateMultiplePreferences,
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
  updateBio,
  updatePersonalInfo,
  updateEducation,
  updateExamPreparation,
  updateSinglePreference, // ✅ Only this method, updatePreferenceByParams removed
};