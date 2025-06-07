const express = require("express");
const router = express.Router();
const quizResultController = require("../../controllers/results/quiz.result.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const validateMiddleware = require("../../middlewares/validate.middleware");
const { apiLimiter } = require("../../middlewares/rate.limit.middleware");
const {
  createQuizResultSchema,
  updateQuizResultSchema,
  getQuizResultSchema,
} = require("../../schemas/results/quiz.result.schema");

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