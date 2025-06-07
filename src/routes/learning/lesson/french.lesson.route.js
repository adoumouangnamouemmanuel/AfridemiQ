const express = require("express");
const router = express.Router();
const lessonController = require("../../../controllers/learning/lesson/french.lesson.controller");
const authMiddleware = require("../../../middleware/auth.middleware");
const roleMiddleware = require("../../../middleware/role.middleware");
const validateMiddleware = require("../../../middleware/validate.middleware");
const { apiLimiter } = require("../../../middleware/rate.limit.middleware");
const {
  frenchLessonSchema,
  updateFrenchLessonSchema,
} = require("../schemas/learning/lesson/french.lesson.schema");
const {
  addFeedbackSchema,
  getLessonSchema,
} = require("../schemas/learning/lesson/lesson.schema");

router.use(apiLimiter);
router.use(authMiddleware);

// French lesson routes
router.post(
  "/",
  validateMiddleware(frenchLessonSchema),
  lessonController.createLesson
);
router.get(
  "/",
  validateMiddleware(getLessonSchema, "query"),
  lessonController.getLessons
);

// Individual lesson routes
router.get("/:id", lessonController.getLessonById);
router.put(
  "/:id",
  validateMiddleware(updateFrenchLessonSchema),
  lessonController.updateLesson
);
router.delete("/:id", lessonController.deleteLesson);
router.post(
  "/:id/feedback",
  validateMiddleware(addFeedbackSchema),
  lessonController.addFeedback
);

// Admin routes
router.get(
  "/admin/lessons",
  roleMiddleware(["admin"]),
  validateMiddleware(getLessonSchema, "query"),
  lessonController.getLessons
);

module.exports = router;