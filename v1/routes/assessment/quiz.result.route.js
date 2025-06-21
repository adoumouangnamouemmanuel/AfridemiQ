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
router.use(authMiddleware);

router.get("/:id", quizResultController.getQuizResultById);

router.get(
  "/",
  validateMiddleware(getQuizResultSchema),
  quizResultController.getQuizResults
);

router.post(
  "/",
  validateMiddleware(createQuizResultSchema),
  quizResultController.createQuizResult
);

router.put(
  "/:id",
  validateMiddleware(updateQuizResultSchema),
  quizResultController.updateQuizResult
);

router.delete(
  "/:id",
  roleMiddleware(["admin"]),
  quizResultController.deleteQuizResult
);

module.exports = router;
