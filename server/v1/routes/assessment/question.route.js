const express = require("express");
const questionController = require("../../controllers/assessment/question.controller");
const validateMiddleware = require("../../middlewares/validate.middleware");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const utf8Middleware = require("../../middlewares/utf8.middleware");
const { apiLimiter } = require("../../middlewares/rate.limit.middleware");

const {
  createQuestionSchema,
  updateQuestionSchema,
  getQuestionsQuerySchema,
} = require("../../schemas/assessment/question.schema");

const router = express.Router();

// Apply UTF-8 middleware to all routes
router.use(utf8Middleware);

// Apply rate limiting
router.use(apiLimiter);

// =============== PUBLIC ROUTES ===============

// Get all questions with filtering and pagination
router.get(
  "/",
  validateMiddleware(getQuestionsQuerySchema, "query"),
  questionController.getQuestions
);

// Get question by ID
router.get("/:id", questionController.getQuestionById);

// Get questions by subject
router.get("/subject/:subjectId", questionController.getQuestionsBySubject);

// Get questions by topic
router.get("/topic/:topicId", questionController.getQuestionsByTopic);

// Get random questions
router.get("/random/list", questionController.getRandomQuestions);

// Search questions
router.get("/search/query", questionController.searchQuestions);

// =============== PROTECTED ROUTES (Teacher/Admin) ===============

// Create new question
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["teacher", "admin"]),
  validateMiddleware(createQuestionSchema, "body"),
  questionController.createQuestion
);

// Update question
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["teacher", "admin"]),
  validateMiddleware(updateQuestionSchema, "body"),
  questionController.updateQuestion
);

// Delete question (soft delete)
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  questionController.deleteQuestion
);

// Update question stats
router.post(
  "/:id/stats",
  authMiddleware,
  questionController.updateQuestionStats
);

// Check answer
router.post("/:id/check", authMiddleware, questionController.checkAnswer);

module.exports = router;
