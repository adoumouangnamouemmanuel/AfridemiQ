const express = require("express");
const router = express.Router();
const leaderboardEntryController = require("../../controllers/progress/leaderboard.entry.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const validateMiddleware = require("../../middlewares/validate.middleware");
const { apiLimiter } = require("../../middlewares/rate.limit.middleware");
const {
  updateRankSchema,
} = require("../../schemas/progress/leaderboard.entry.schema");

// Apply rate limiting to all routes
router.use(apiLimiter);

// Public routes
router.get("/global", leaderboardEntryController.getGlobalLeaderboard);
router.get(
  "/national/:country",
  leaderboardEntryController.getNationalLeaderboard
);
router.get(
  "/regional/:region",
  leaderboardEntryController.getRegionalLeaderboard
);
router.get("/statistics", leaderboardEntryController.getStatistics);

// User routes (authentication required)
router.get("/my-rank", authMiddleware, leaderboardEntryController.getUserRank);
router.put(
  "/my-rank",
  authMiddleware,
  validateMiddleware(updateRankSchema),
  leaderboardEntryController.updateRank
);

// Admin routes
router.post(
  "/recalculate",
  authMiddleware,
  roleMiddleware(["admin"]),
  leaderboardEntryController.recalculateRanks
);

module.exports = router;