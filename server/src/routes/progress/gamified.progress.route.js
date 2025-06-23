const express = require("express");
const router = express.Router();
const gamifiedProgressController = require("../../controllers/progress/gamified.progress.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const validateMiddleware = require("../../middlewares/validate.middleware");
const { apiLimiter } = require("../../middlewares/rate.limit.middleware");
const {
  updateMilestoneSchema,
} = require("../../schemas/progress/gamified.progress.schema");

// Apply rate limiting to all routes
router.use(apiLimiter);

// Public routes
router.get("/leaderboard", gamifiedProgressController.getLeaderboard);
router.get("/statistics", gamifiedProgressController.getStatistics);

// User routes (authentication required)
router.get("/", authMiddleware, gamifiedProgressController.getUserProgress);
router.get(
  "/:subjectId",
  authMiddleware,
  gamifiedProgressController.getProgress
);

router.put(
  "/:subjectId/milestone/:milestoneId",
  authMiddleware,
  validateMiddleware(updateMilestoneSchema),
  gamifiedProgressController.updateMilestone
);

module.exports = router;