const express = require("express");
const router = express.Router();
const missionController = require("../../controllers/progress/mission.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const validateMiddleware = require("../../middlewares/validate.middleware");
const { apiLimiter } = require("../../middlewares/rate.limit.middleware");
const {
  createMissionSchema,
  updateMissionSchema,
  updateProgressSchema,
} = require("../../schemas/progress/mission.schema");

// Apply rate limiting to all routes
router.use(apiLimiter);

// Public routes
router.get("/", missionController.getMissions);
router.get("/daily", missionController.getDailyMissions);
router.get("/weekly", missionController.getWeeklyMissions);
router.get("/statistics", missionController.getStatistics);
router.get("/:id", missionController.getMissionById);

// User routes (authentication required)
router.put(
  "/:id/progress",
  authMiddleware,
  validateMiddleware(updateProgressSchema),
  missionController.updateProgress
);

// Admin routes
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["admin"]),
  validateMiddleware(createMissionSchema),
  missionController.createMission
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  validateMiddleware(updateMissionSchema),
  missionController.updateMission
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  missionController.deleteMission
);

router.post(
  "/cleanup",
  authMiddleware,
  roleMiddleware(["admin"]),
  missionController.cleanupExpiredMissions
);

module.exports = router;