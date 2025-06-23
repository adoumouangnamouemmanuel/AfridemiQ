const express = require("express");
const quizController = require("../../controllers/assessment/quiz.controller");
const validateMiddleware = require("../../middlewares/validate.middleware");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const utf8Middleware = require("../../middlewares/utf8.middleware");
const { apiLimiter } = require("../../middlewares/rate.limit.middleware");

const {
  createQuizSchema,
  updateQuizSchema,
  getQuizzesQuerySchema,
} = require("../../schemas/assessment/quiz.schema");

const router = express.Router();

// Apply UTF-8 middleware to all routes
router.use(utf8Middleware);

// Apply rate limiting
router.use(apiLimiter);

// =============== PUBLIC ROUTES ===============

// Get all quizzes with filtering and pagination
router.get(
  "/",
  validateMiddleware(getQuizzesQuerySchema, "query"),
  quizController.getQuizzes
);

// Get quiz by ID
router.get("/:id", quizController.getQuizById);

// Get popular quizzes
router.get("/popular/list", quizController.getPopularQuizzes);

// Get quizzes by subject
router.get("/subject/:subjectId", quizController.getQuizzesBySubject);

// Get quizzes by topic
router.get("/topic/:topicId", quizController.getQuizzesByTopic);

// Get quizzes by education level and exam type
router.get(
  "/education/:educationLevel/exam/:examType",
  quizController.getQuizzesByEducationAndExam
);

// Search quizzes
router.get("/search/query", quizController.searchQuizzes);

// =============== PROTECTED ROUTES (Teacher/Admin) ===============

// Create new quiz
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["teacher", "admin"]),
  validateMiddleware(createQuizSchema, "body"),
  quizController.createQuiz
);

// Update quiz
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["teacher", "admin"]),
  validateMiddleware(updateQuizSchema, "body"),
  quizController.updateQuiz
);

// Delete quiz (soft delete)
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  quizController.deleteQuiz
);

// Update quiz stats
router.post("/:id/stats", authMiddleware, quizController.updateQuizStats);

module.exports = router;
