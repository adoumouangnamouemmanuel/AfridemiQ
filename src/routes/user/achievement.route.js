const express = require("express");
const router = express.Router();
const achievementController = require("../../controllers/user/achievement.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const validateMiddleware = require("../../middlewares/validate.middleware");
const { apiLimiter } = require("../../middlewares/rate.limit.middleware");
const {
  createAchievementSchema,
  updateProgressSchema,
  updateAchievementSchema,
} = require("../../schemas/user/achievement.schema");

// Apply rate limiting to all routes
router.use(apiLimiter);

// User routes (authentication required)
router.get("/", authMiddleware, achievementController.getUserAchievements);
router.get("/statistics", authMiddleware, achievementController.getStatistics);
router.get(
  "/recent",
  authMiddleware,
  achievementController.getRecentAchievements
);
router.get(
  "/subject/:subjectId",
  authMiddleware,
  achievementController.getAchievementsBySubject
);
router.get("/:id", authMiddleware, achievementController.getAchievementById);

router.put(
  "/:id/progress",
  authMiddleware,
  validateMiddleware(updateProgressSchema),
  achievementController.updateProgress
);

// Admin routes
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["admin"]),
  validateMiddleware(createAchievementSchema),
  achievementController.createAchievement
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  validateMiddleware(updateAchievementSchema),
  achievementController.updateAchievement
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  achievementController.deleteAchievement
);

module.exports = router;