const express = require("express");
const quizController = require("../../controllers/assessment/quiz.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
// const roleMiddleware = require("../../middlewares/role.middleware");
const validateMiddleware = require("../../middlewares/validate.middleware");
// const { apiLimiter } = require("../../middlewares/rate.limit.middleware");
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
router.use(authMiddleware);

// Quiz CRUD operations
router.post("/", validateMiddleware(createQuizSchema), quizController.createQuiz);
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