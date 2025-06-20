const express = require("express");
const router = express.Router();
const userController = require("../../controllers/user/user.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const validateMiddleware = require("../../middlewares/validate.middleware");
const {
  authLimiter,
  apiLimiter,
} = require("../../middlewares/rate.limit.middleware");

// Import simplified MVP schemas
const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  updatePersonalInfoSchema,
  updateNotificationsSchema,
  onboardingSchema,
  checkOnboardingSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
  changePasswordSchema,
  refreshTokenSchema,
  searchUsersSchema,
} = require("../../schemas/user/user.schema");

// Apply rate limiting to all routes
router.use(apiLimiter);

// =============== PUBLIC ROUTES (AUTH) ===============
router.post(
  "/register",
  authLimiter,
  validateMiddleware(registerSchema),
  userController.register
);

router.post(
  "/login",
  authLimiter,
  validateMiddleware(loginSchema),
  userController.login
);

router.post(
  "/request-password-reset",
  authLimiter,
  validateMiddleware(passwordResetRequestSchema),
  userController.requestPasswordReset
);

router.post(
  "/reset-password",
  authLimiter,
  validateMiddleware(passwordResetSchema),
  userController.resetPassword
);

router.post(
  "/refresh-token",
  validateMiddleware(refreshTokenSchema),
  userController.refreshToken
);

// =============== PROTECTED ROUTES ===============
router.use(authMiddleware);

// Core profile routes
router.get("/profile", userController.getProfile);
router.put(
  "/profile",
  validateMiddleware(updateProfileSchema),
  userController.updateProfile
);
router.delete("/profile", userController.deleteUser);
router.post("/logout", userController.logOut);

// Onboarding routes
router.post(
  "/onboarding",
  validateMiddleware(onboardingSchema),
  userController.completeOnboarding
);
router.get("/onboarding/status", userController.checkOnboardingStatus);

// Personal info and notifications
router.put(
  "/personal-info",
  validateMiddleware(updatePersonalInfoSchema),
  userController.updatePersonalInfo
);
router.put(
  "/notifications",
  validateMiddleware(updateNotificationsSchema),
  userController.updateNotifications
);

// Password management
router.put(
  "/change-password",
  validateMiddleware(changePasswordSchema),
  userController.changePassword
);

// User search and discovery
router.get(
  "/search",
  validateMiddleware(searchUsersSchema),
  userController.searchUsers
);

// Get user by ID
router.get("/:id", userController.getUserById);

router.post("/logout", userController.logOut);

// Friend management routes
router.post("/friends/:friendId", userController.addFriend);
router.delete("/friends/:friendId", userController.removeFriend);
router.post("/block/:friendId", userController.blockFriend);
router.delete("/block/:friendId", userController.unblockFriend);

// Preferences routes
router.put(
  "/preferences",
  validateMiddleware(updateAllPreferencesSchema),
  userController.updateAllPreferences
);

router.patch(
  "/preferences/:type",
  validateMiddleware(updatePreferenceTypeSchema),
  userController.updatePreferenceType
);

router.patch(
  "/preferences",
  validateMiddleware(updateMultiplePreferencesSchema),
  userController.updateMultiplePreferences
);

// New routes for modular profile updates
// Update bio
router.put(
  "/profile/bio",
  authMiddleware,
  validateMiddleware(updateBioSchema),
  userController.updateBio
);

// Update personal information
router.put(
  "/profile/personal-info",
  authMiddleware,
  validateMiddleware(updatePersonalInfoSchema),
  userController.updatePersonalInfo
);

// Update education information
router.put(
  "/profile/education",
  authMiddleware,
  validateMiddleware(updateEducationSchema),
  userController.updateEducation
);

// Update exam preparation
router.put(
  "/profile/exam-preparation",
  authMiddleware,
  validateMiddleware(updateExamPreparationSchema),
  userController.updateExamPreparation
);

// Define allowed preference keys
const ALLOWED_PREFERENCE_KEYS = [
  "notifications.general",
  "notifications.dailyReminderTime",
  "notifications.challengeNotifications",
  "notifications.progressUpdates",
  "darkMode",
  "fontSize",
  "preferredContentFormat",
  "enableHints",
  "autoPlayAudio",
  "showStepSolutions",
  "leaderboardVisibility",
  "allowFriendRequests",
  "multilingualSupport",
  "studyField",
  "targetUniversity",
  "studyHours",
  "favoriteSubjects",
  "careerGoal",
];

// Update a single preference using URL parameters with custom key-value validation
router.patch(
  "/preference/:key/:value",
  authMiddleware,
  validateKeyValueMiddleware(ALLOWED_PREFERENCE_KEYS), // ✅ Uses custom middleware instead of Joi
  userController.updateSinglePreference
);

// Admin routes
router.get("/", roleMiddleware(["admin"]), userController.getAllUsers);

module.exports = router;