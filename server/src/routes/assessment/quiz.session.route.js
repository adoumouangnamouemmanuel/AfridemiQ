const express = require("express");
const quizSessionController = require("../../controllers/assessment/quiz.session.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
// const roleMiddleware = require("../../middlewares/role.middleware");
const validateMiddleware = require("../../middlewares/validate.middleware");
const {
  createSessionSchema,
  submitAnswerSchema,
  navigateSchema,
  syncSessionSchema,
} = require("../../schemas/assessment/quiz.session.schema");

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Session management
router.post(
  "/",
  validateMiddleware(createSessionSchema),
  quizSessionController.createSession
);
router.get("/active", quizSessionController.getUserActiveSessions);
router.get("/history", quizSessionController.getUserSessionHistory);

// Session operations
router.get("/:sessionId", quizSessionController.getSession);
router.post("/:sessionId/start", quizSessionController.startSession);
router.post("/:sessionId/pause", quizSessionController.pauseSession);
router.post("/:sessionId/resume", quizSessionController.resumeSession);
router.post("/:sessionId/complete", quizSessionController.completeSession);

// Question operations
router.post(
  "/:sessionId/answer",
  validateMiddleware(submitAnswerSchema),
  quizSessionController.submitAnswer
);
router.post(
  "/:sessionId/navigate",
  validateMiddleware(navigateSchema),
  quizSessionController.navigateToQuestion
);
router.post(
  "/:sessionId/flag/:questionId",
  quizSessionController.toggleQuestionFlag
);
router.post("/:sessionId/skip/:questionId", quizSessionController.skipQuestion);

// Sync operations
router.post(
  "/:sessionId/sync",
  validateMiddleware(syncSessionSchema),
  quizSessionController.syncSession
);

// Admin operations
router.post(
  "/admin/cleanup-expired",
  quizSessionController.cleanupExpiredSessions
);
router.delete("/admin/cleanup-old", quizSessionController.deleteOldSessions);

module.exports = router;