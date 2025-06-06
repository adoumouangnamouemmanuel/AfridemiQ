const express = require("express");
const router = express.Router();
const topicProgressController = require("../../controllers/progress/topic.progress.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const validateMiddleware = require("../../middlewares/validate.middleware");
const { apiLimiter } = require("../../middlewares/rate.limit.middleware");
const {
  recordPracticeSessionSchema,
  updateAreasOfFocusSchema,
} = require("../../schemas/progress/topic.progress.schema");

// Apply rate limiting to all routes
router.use(apiLimiter);

// All routes require authentication
router.use(authMiddleware);

// Get user's topic progress (with filtering)
router.get("/", topicProgressController.getUserTopicProgress);

// Get user's overall progress statistics
router.get("/statistics", topicProgressController.getUserProgressStatistics);

// Get specific topic progress
router.get("/:topicId", topicProgressController.getTopicProgress);

// Get topic analytics
router.get("/:topicId/analytics", topicProgressController.getTopicAnalytics);

// Record practice session
router.post(
  "/:topicId/session",
  validateMiddleware(recordPracticeSessionSchema),
  topicProgressController.recordPracticeSession
);

// Update areas of focus
router.put(
  "/:topicId/areas",
  validateMiddleware(updateAreasOfFocusSchema),
  topicProgressController.updateAreasOfFocus
);

// Delete topic progress
router.delete("/:topicId", topicProgressController.deleteTopicProgress);

module.exports = router;