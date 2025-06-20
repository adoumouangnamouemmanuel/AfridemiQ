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

// =============== ADMIN ROUTES ===============
router.get("/", roleMiddleware(["admin"]), userController.getAllUsers);

module.exports = router;