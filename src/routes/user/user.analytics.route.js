const express = require("express");
const router = express.Router();
const userAnalyticsController = require("../controllers/user/userAnalytics.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const validateMiddleware = require("../../middlewares/validate.middleware");
const { apiLimiter } = require("../../middlewares/rate.limit.middleware");
const {
  addDailyStatsSchema,
  updateSubjectStatsSchema,
  updateLearningPatternsSchema,
  updateMasterySchema,
  updateEfficiencySchema,
} = require("../schemas/user/userAnalytics.schema");

// Apply rate limiting to all routes
router.use(apiLimiter);

// User routes (authentication required)
router.get("/", authMiddleware, userAnalyticsController.getUserAnalytics);
router.get(
  "/dashboard",
  authMiddleware,
  userAnalyticsController.getDashboardData
);
router.get(
  "/report",
  authMiddleware,
  userAnalyticsController.getDetailedReport
);
router.get(
  "/recommendations",
  authMiddleware,
  userAnalyticsController.generateRecommendations
);

router.post(
  "/daily-stats",
  authMiddleware,
  validateMiddleware(addDailyStatsSchema),
  userAnalyticsController.addDailyStats
);

router.put(
  "/subject-stats/:subjectId",
  authMiddleware,
  validateMiddleware(updateSubjectStatsSchema),
  userAnalyticsController.updateSubjectStats
);

router.put(
  "/learning-patterns",
  authMiddleware,
  validateMiddleware(updateLearningPatternsSchema),
  userAnalyticsController.updateLearningPatterns
);

router.put(
  "/mastery/:subjectId",
  authMiddleware,
  validateMiddleware(updateMasterySchema),
  userAnalyticsController.updateMastery
);

router.put(
  "/efficiency",
  authMiddleware,
  validateMiddleware(updateEfficiencySchema),
  userAnalyticsController.updateEfficiency
);

// Admin routes
router.get(
  "/admin/all",
  authMiddleware,
  roleMiddleware(["admin"]),
  userAnalyticsController.getAllUsersAnalytics
);

router.get(
  "/admin/statistics",
  authMiddleware,
  roleMiddleware(["admin"]),
  userAnalyticsController.getSystemStatistics
);

router.get(
  "/admin/user/:userId",
  authMiddleware,
  roleMiddleware(["admin"]),
  userAnalyticsController.getUserAnalyticsById
);

module.exports = router;