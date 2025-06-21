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

// Protected routes
router.use(authMiddleware);

// Quiz CRUD operations
router.post(
  "/",
  validateMiddleware(createQuizSchema),
  quizController.createQuiz
);
router.get(
  "/",
  validateMiddleware(getQuizzesSchema, "query"),
  quizController.getAllQuizzes
);
router.get("/my-quizzes", quizController.getMyQuizzes);
router.get("/subject/:subjectId", quizController.getQuizzesBySubject);
router.get("/:id", quizController.getQuizById);
router.put(
  "/:id",
  validateMiddleware(updateQuizSchema),
  quizController.updateQuiz
);
router.delete("/:id", quizController.deleteQuiz);

// Quiz management
router.get("/:id/eligibility", quizController.checkQuizEligibility);
router.get("/:id/statistics", quizController.getQuizStatistics);
router.post("/:id/update-analytics", quizController.updateQuizAnalytics);

// Bulk operations
router.post(
  "/bulk/update",
  validateMiddleware(bulkUpdateQuizzesSchema),
  quizController.bulkUpdateQuizzes
);

module.exports = router;
