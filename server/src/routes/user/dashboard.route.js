const express = require("express");
const router = express.Router();
const dashboardController = require("../../controllers/user/dashboard.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const validateMiddleware = require("../../middlewares/validate.middleware");
const { apiLimiter } = require("../../middlewares/rate.limit.middleware");
const {
  updateUpcomingExamsSchema,
  addRecentQuizSchema,
  updateRecommendedTopicsSchema,
  updateStreakSchema,
  addNotificationSchema,
} = require("../../schemas/user/dashboard.schema");

// Apply rate limiting to all routes
router.use(apiLimiter);

// All dashboard routes require authentication
router.use(authMiddleware);

// Get user dashboard
router.get("/", dashboardController.getDashboard);

// Get dashboard statistics
router.get("/statistics", dashboardController.getStatistics);

// Update upcoming exams
router.put(
  "/exams",
  validateMiddleware(updateUpcomingExamsSchema),
  dashboardController.updateUpcomingExams
);

// Add recent quiz
router.post(
  "/quiz",
  validateMiddleware(addRecentQuizSchema),
  dashboardController.addRecentQuiz
);

// Update recommended topics
router.put(
  "/recommendations",
  validateMiddleware(updateRecommendedTopicsSchema),
  dashboardController.updateRecommendedTopics
);

// Update study streak
router.put(
  "/streak",
  validateMiddleware(updateStreakSchema),
  dashboardController.updateStreak
);

// Add notification
router.post(
  "/notification",
  validateMiddleware(addNotificationSchema),
  dashboardController.addNotification
);

// Remove notification
router.delete(
  "/notification/:notificationId",
  dashboardController.removeNotification
);

// Clear old data
router.delete("/clear-old-data", dashboardController.clearOldData);

module.exports = router;