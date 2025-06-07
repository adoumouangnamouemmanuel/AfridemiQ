const express = require("express");
const router = express.Router();
const exerciseController = require("../../controllers/assessment/exercise.controller");
const { asyncHandler } = require("../../utils/asyncHandler");
const validateMiddleware = require("../../middlewares/validate.middleware");
const {
  createExerciseSchema,
  updateExerciseSchema,
  bulkCreateExercisesSchema,
  bulkUpdateExercisesSchema,
  bulkDeleteExercisesSchema,
  addFeedbackSchema,
  updateAnalyticsSchema,
  advancedSearchSchema,
} = require("../../schemas/assessment/exercise.schema");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Basic CRUD routes
router.post(
  "/",
  roleMiddleware(["admin", "teacher"]),
  validateMiddleware(createExerciseSchema),
  asyncHandler(exerciseController.createExercise.bind(exerciseController))
);

router.get(
  "/",
  asyncHandler(exerciseController.getAllExercises.bind(exerciseController))
);

router.get(
  "/:id",
  asyncHandler(exerciseController.getExerciseById.bind(exerciseController))
);

router.put(
  "/:id",
  roleMiddleware(["admin", "teacher"]),
  validateMiddleware(updateExerciseSchema),
  asyncHandler(exerciseController.updateExercise.bind(exerciseController))
);

router.delete(
  "/:id",
  roleMiddleware(["admin", "teacher"]),
  asyncHandler(exerciseController.deleteExercise.bind(exerciseController))
);

// Subject-specific routes
router.get(
  "/subject/:subjectId",
  asyncHandler(exerciseController.getExercisesBySubject.bind(exerciseController))
);

router.get(
  "/topic/:topicId",
  asyncHandler(exerciseController.getExercisesByTopic.bind(exerciseController))
);

router.get(
  "/difficulty/:difficulty",
  asyncHandler(exerciseController.getExercisesByDifficulty.bind(exerciseController))
);

// Bulk operations
router.post(
  "/bulk/create",
  roleMiddleware(["admin", "teacher"]),
  validateMiddleware(bulkCreateExercisesSchema),
  asyncHandler(exerciseController.bulkCreateExercises.bind(exerciseController))
);

router.put(
  "/bulk/update",
  roleMiddleware(["admin", "teacher"]),
  validateMiddleware(bulkUpdateExercisesSchema),
  asyncHandler(exerciseController.bulkUpdateExercises.bind(exerciseController))
);

router.delete(
  "/bulk/delete",
  roleMiddleware(["admin", "teacher"]),
  validateMiddleware(bulkDeleteExercisesSchema),
  asyncHandler(exerciseController.bulkDeleteExercises.bind(exerciseController))
);

// Filter routes
router.post(
  "/search/advanced",
  validateMiddleware(advancedSearchSchema),
  asyncHandler(exerciseController.advancedSearch.bind(exerciseController))
);

router.get(
  "/statistics",
  roleMiddleware(["admin", "teacher"]),
  asyncHandler(exerciseController.getExerciseStatistics.bind(exerciseController))
);

// Individual exercise routes
router.post(
  "/:id/feedback",
  validateMiddleware(addFeedbackSchema),
  asyncHandler(exerciseController.addFeedback.bind(exerciseController))
);

router.put(
  "/:id/analytics",
  validateMiddleware(updateAnalyticsSchema),
  asyncHandler(exerciseController.updateAnalytics.bind(exerciseController))
);

router.get(
  "/:id/analytics",
  roleMiddleware(["admin", "teacher"]),
  asyncHandler(exerciseController.getExerciseAnalytics.bind(exerciseController))
);

router.get(
  "/recommended",
  asyncHandler(exerciseController.getRecommendedExercises.bind(exerciseController))
);

// Subject-specific exercise routes
router.get(
  "/subject/math",
  asyncHandler(exerciseController.getMathExercises.bind(exerciseController))
);

router.get(
  "/subject/physics",
  asyncHandler(exerciseController.getPhysicsExercises.bind(exerciseController))
);

router.get(
  "/subject/chemistry",
  asyncHandler(exerciseController.getChemistryExercises.bind(exerciseController))
);

router.get(
  "/subject/biology",
  asyncHandler(exerciseController.getBiologyExercises.bind(exerciseController))
);

router.get(
  "/subject/french",
  asyncHandler(exerciseController.getFrenchExercises.bind(exerciseController))
);

router.get(
  "/subject/philosophy",
  asyncHandler(exerciseController.getPhilosophyExercises.bind(exerciseController))
);

router.get(
  "/subject/english",
  asyncHandler(exerciseController.getEnglishExercises.bind(exerciseController))
);

router.get(
  "/subject/history",
  asyncHandler(exerciseController.getHistoryExercises.bind(exerciseController))
);

router.get(
  "/subject/geography",
  asyncHandler(exerciseController.getGeographyExercises.bind(exerciseController))
);

module.exports = router;
