const express = require("express");
const router = express.Router();
const onboardingStatusController = require("../../controllers/user/onboarding.status.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const validateMiddleware = require("../../middlewares/validate.middleware");
const { apiLimiter } = require("../../middlewares/rate.limit.middleware");
const {
  completeStepSchema,
  updateCurrentStepSchema,
} = require("../../schemas/user/onboarding.status.schema");

// Apply rate limiting to all routes
router.use(apiLimiter);

// All routes require authentication
router.use(authMiddleware);

// Get onboarding status
router.get("/", onboardingStatusController.getOnboardingStatus);

// Get onboarding progress
router.get("/progress", onboardingStatusController.getOnboardingProgress);

// Get all onboarding steps
router.get("/steps", onboardingStatusController.getAllSteps);

// Complete a step
router.post(
  "/complete-step",
  validateMiddleware(completeStepSchema),
  onboardingStatusController.completeStep
);

// Update current step
router.put(
  "/current-step",
  validateMiddleware(updateCurrentStepSchema),
  onboardingStatusController.updateCurrentStep
);

// Reset onboarding
router.post("/reset", onboardingStatusController.resetOnboarding);

// Admin routes
router.get(
  "/admin/statistics",
  roleMiddleware(["admin"]),
  onboardingStatusController.getOnboardingStatistics
);

module.exports = router;