const express = require("express");
const exerciseController = require("../../controllers/assessment/exercise.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const validateMiddleware = require("../../middlewares/validate.middleware");
const {
  createExerciseSchema,
  updateExerciseSchema,
  exerciseQuerySchema,
  feedbackSchema,
  analyticsSchema,
  bulkCreateSchema,
  bulkUpdateSchema,
  bulkDeleteSchema,
  advancedSearchSchema,
} = require("../../schemas/assessment/exercise.schema");

const router = express.Router();

// Apply authentication to all routes
router.use(authMiddleware);

// Basic CRUD routes
router.post(
  "/",
  authMiddleware(["admin", "teacher"]),
  validateMiddleware(createExerciseSchema),
  exerciseController.createExercise
);

router.get(
  "/",
  validateMiddleware(exerciseQuerySchema, "query"),
  exerciseController.getAllExercises
);

router.get(
  "/statistics",
  authMiddleware(["admin", "teacher"]),
  exerciseController.getExerciseStatistics
);

router.get("/recommended", exerciseController.getRecommendedExercises);

router.post(
  "/search",
  validateMiddleware(advancedSearchSchema),
  exerciseController.advancedSearch
);

// Subject-specific routes
router.get("/math", exerciseController.getMathExercises);
router.get("/physics", exerciseController.getPhysicsExercises);
router.get("/chemistry", exerciseController.getChemistryExercises);
router.get("/biology", exerciseController.getBiologyExercises);
router.get("/french", exerciseController.getFrenchExercises);
router.get("/philosophy", exerciseController.getPhilosophyExercises);
router.get("/english", exerciseController.getEnglishExercises);
router.get("/history", exerciseController.getHistoryExercises);
router.get("/geography", exerciseController.getGeographyExercises);

// Bulk operations
router.post(
  "/bulk/create",
  authMiddleware(["admin", "teacher"]),
  validateMiddleware(bulkCreateSchema),
  exerciseController.bulkCreateExercises
);

router.patch(
  "/bulk/update",
  authMiddleware(["admin", "teacher"]),
  validateMiddleware(bulkUpdateSchema),
  exerciseController.bulkUpdateExercises
);

router.delete(
  "/bulk/delete",
  authMiddleware(["admin", "teacher"]),
  validateMiddleware(bulkDeleteSchema),
  exerciseController.bulkDeleteExercises
);

// Filter routes
router.get("/subject/:subjectId", exerciseController.getExercisesBySubject);

router.get("/topic/:topicId", exerciseController.getExercisesByTopic);

router.get(
  "/difficulty/:difficulty",
  exerciseController.getExercisesByDifficulty
);

// Individual exercise routes
router.get("/:id", exerciseController.getExerciseById);

router.patch(
  "/:id",
  authMiddleware(["admin", "teacher"]),
  validateMiddleware(updateExerciseSchema),
  exerciseController.updateExercise
);

router.delete(
  "/:id",
  authMiddleware(["admin", "teacher"]),
  exerciseController.deleteExercise
);

// Feedback and analytics routes
router.post(
  "/:id/feedback",
  validateMiddleware(feedbackSchema),
  exerciseController.addFeedback
);

router.post(
  "/:id/analytics",
  validateMiddleware(analyticsSchema),
  exerciseController.updateAnalytics
);

router.get(
  "/:id/analytics",
  authMiddleware(["admin", "teacher"]),
  exerciseController.getExerciseAnalytics
);

module.exports = router;
