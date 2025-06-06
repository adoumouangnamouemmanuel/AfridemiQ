const express = require("express");
const quizController = require("../../controllers/assessment/quiz.controller");
const { authenticate } = require("../../middlewares/auth.middleware");
const { validateRequest } = require("../../middlewares/validation.middleware");
const {
  createQuizSchema,
  updateQuizSchema,
  getQuizzesSchema,
  bulkUpdateQuizzesSchema,
} = require("../../schemas/assessment/quiz.schema");

const router = express.Router();

// Public routes
router.get("/popular", quizController.getPopularQuizzes);

// Protected routes
router.use(authenticate);

// Quiz CRUD operations
router.post("/", validateRequest(createQuizSchema), quizController.createQuiz);
router.get(
  "/",
  validateRequest(getQuizzesSchema, "query"),
  quizController.getAllQuizzes
);
router.get("/my-quizzes", quizController.getMyQuizzes);
router.get("/subject/:subjectId", quizController.getQuizzesBySubject);
router.get("/:id", quizController.getQuizById);
router.put(
  "/:id",
  validateRequest(updateQuizSchema),
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
  validateRequest(bulkUpdateQuizzesSchema),
  quizController.bulkUpdateQuizzes
);

module.exports = router;