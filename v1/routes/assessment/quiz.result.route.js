const express = require("express");
const quizResultController = require("../../controllers/results/quiz.result.controller");
const validateMiddleware = require("../../middlewares/validate.middleware");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const utf8Middleware = require("../../middlewares/utf8.middleware");
const { apiLimiter } = require("../../middlewares/rate.limit.middleware");

const {
  createQuizResultSchema,
  updateQuizResultSchema,
  getQuizResultsQuerySchema,
} = require("../../schemas/assessment/quiz.result.schema");

const router = express.Router();

// Apply UTF-8 middleware to all routes
router.use(utf8Middleware);

// Apply rate limiting
router.use(apiLimiter);

// Apply authentication to all routes
router.use(authMiddleware);

// =============== QUIZ RESULT ROUTES ===============

// Get all quiz results with filtering and pagination
router.get(
  "/",
  validateMiddleware(getQuizResultsQuerySchema, "query"),
  quizResultController.getQuizResults
);

// Get quiz result by ID
router.get("/:id", quizResultController.getQuizResultById);

// Get user's quiz results
router.get("/user/:userId", quizResultController.getUserQuizResults);

// Get results for a specific quiz
router.get("/quiz/:quizId", quizResultController.getQuizResults);

// Get user's best score for a quiz
router.get(
  "/user/:userId/quiz/:quizId/best",
  quizResultController.getUserBestScore
);

// Get user's attempt count for a quiz
router.get(
  "/user/:userId/quiz/:quizId/attempts",
  quizResultController.getUserAttemptCount
);

// Get user's average score
router.get("/user/:userId/average", quizResultController.getUserAverageScore);

// Create new quiz result
router.post(
  "/",
  validateMiddleware(createQuizResultSchema, "body"),
  quizResultController.createQuizResult
);

// Update quiz result
router.put(
  "/:id",
  validateMiddleware(updateQuizResultSchema, "body"),
  quizResultController.updateQuizResult
);

// Delete quiz result (admin only)
router.delete(
  "/:id",
  roleMiddleware(["admin"]),
  quizResultController.deleteQuizResult
);

module.exports = router;
