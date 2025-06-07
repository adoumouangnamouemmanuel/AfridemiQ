const express = require("express");
const router = express.Router();
const adaptiveLearningController = require("../../controllers/learning/adaptive.learning.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const validateMiddleware = require("../../middlewares/validate.middleware");
const { apiLimiter } = require("../../middlewares/rate.limit.middleware");
const {
  createAdaptiveLearningSchema,
  updateAdaptiveLearningSchema,
  getAdaptiveLearningSchema,
} = require("../../schemas/learning/adaptive.learning.schema");

// Apply rate limiting
router.use(apiLimiter);

// Protected routes
router.use(authMiddleware);

// Get profile by user ID
router.get(
  "/user/:userId",
  validateMiddleware(getAdaptiveLearningSchema),
  adaptiveLearningController.getAdaptiveLearningByUserId
);

// Create profile (teacher/admin)
router.post(
  "/",
  roleMiddleware(["teacher", "admin"]),
  validateMiddleware(createAdaptiveLearningSchema),
  adaptiveLearningController.createAdaptiveLearning
);

// Update profile (teacher/admin)
router.put(
  "/user/:userId",
  roleMiddleware(["teacher", "admin"]),
  validateMiddleware(updateAdaptiveLearningSchema),
  adaptiveLearningController.updateAdaptiveLearning
);

// Adjust difficulty (user)
router.post(
  "/user/:userId/adjust",
  validateMiddleware({
    score: Joi.number().min(0).max(100).optional(),
    timeSpent: Joi.number().min(0).optional(),
    accuracy: Joi.number().min(0).max(100).optional(),
    completionRate: Joi.number().min(0).max(100).optional(),
  }),
  adaptiveLearningController.adjustDifficulty
);

// Get all profiles (admin)
router.get(
  "/",
  roleMiddleware(["admin"]),
  validateMiddleware(getAdaptiveLearningSchema),
  adaptiveLearningController.getAllAdaptiveLearning
);

module.exports = router;