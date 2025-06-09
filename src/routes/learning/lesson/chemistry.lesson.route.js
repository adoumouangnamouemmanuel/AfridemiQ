const express = require("express");
const router = express.Router();
const lessonController = require("../../../controllers/learning/lesson/chemistry.lesson.controller");
const authMiddleware = require("../../../middlewares/auth.middleware");
const roleMiddleware = require("../../../middlewares/role.middleware");
const validateMiddleware = require("../../../middlewares/validate.middleware");
const { apiLimiter } = require("../../../middlewares/rate.limit.middleware");
const {
  chemistryLessonSchema,
  updateChemistryLessonSchema,
} = require("../../../schemas/learning/lesson/chemistry.lesson.schema");
const {
  addFeedbackSchema,
  getLessonSchema,
} = require("../../../schemas/learning/lesson/lesson.schema");

router.use(apiLimiter);
router.use(authMiddleware);

// Chemistry lesson operations
router.post(
  "/",
  validateMiddleware(chemistryLessonSchema),
  lessonController.createLesson
);
router.get(
  "/",
  validateMiddleware(getLessonSchema, "query"),
  lessonController.getLessons
);

// Individual lesson operations
router.get("/:id", lessonController.getLessonById);
router.put(
  "/:id",
  validateMiddleware(updateChemistryLessonSchema),
  lessonController.updateLesson
);
router.delete("/:id", lessonController.deleteLesson);
router.post(
  "/:id/feedback",
  validateMiddleware(addFeedbackSchema),
  lessonController.addFeedback
);

// Admin operations
router.get(
  "/admin/lessons",
  roleMiddleware(["admin"]),
  validateMiddleware(getLessonSchema, "query"),
  lessonController.getLessons
);

module.exports = router;
