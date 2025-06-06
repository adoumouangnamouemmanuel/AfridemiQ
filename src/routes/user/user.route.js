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
const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  updatePreferencesSchema,
  updateProgressSchema,
  addFriendSchema,
  verifyPhoneSchema,
  phoneVerificationSchema,
  updateSubscriptionSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
  refreshTokenSchema,
  searchUsersSchema,
  updateSocialProfileSchema,
} = require("../../schemas/user/user.schema");

// Apply rate limiting to all routes
router.use(apiLimiter);

// Public routes with stricter rate limiting for auth endpoints
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

// Protected routes
router.use(authMiddleware);

// User routes
router.get("/profile", userController.getProfile);
router.put(
  "/profile",
  validateMiddleware(updateProfileSchema),
  userController.updateProfile
);
router.delete("/profile", userController.deleteUser);
router.put(
  "/preferences",
  validateMiddleware(updatePreferencesSchema),
  userController.updatePreferences
);
router.put(
  "/progress",
  validateMiddleware(updateProgressSchema),
  userController.updateProgress
);
router.post(
  "/add-friend",
  validateMiddleware(addFriendSchema),
  userController.addFriend
);
router.delete(
  "/friend",
  validateMiddleware(addFriendSchema),
  userController.removeFriend
);
router.post(
  "/verify-phone",
  validateMiddleware(verifyPhoneSchema),
  userController.verifyPhone
);
router.post(
  "/request-phone-verification",
  validateMiddleware(phoneVerificationSchema),
  userController.requestPhoneVerification
);
router.put(
  "/subscription",
  validateMiddleware(updateSubscriptionSchema),
  userController.updateSubscription
);
router.get(
  "/search",
  validateMiddleware(searchUsersSchema),
  userController.searchUsers
);
router.put(
  "/social-profile",
  validateMiddleware(updateSocialProfileSchema),
  userController.updateSocialProfile
);
router.get("/:id", userController.getUserById);
router.post("/logout", userController.logOut);

// Friend management routes
router.post("/friends/:friendId", authMiddleware, userController.addFriend);
router.delete("/friends/:friendId", authMiddleware, userController.removeFriend);
router.post("/block/:friendId", authMiddleware, userController.blockFriend);
router.delete("/block/:friendId", authMiddleware, userController.unblockFriend);

// Admin routes
router.get("/", roleMiddleware(["admin"]), userController.getAllUsers);

module.exports = router;