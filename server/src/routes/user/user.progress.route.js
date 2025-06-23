const express = require("express");
const router = express.Router();
const userProgressController = require("../../controllers/user/user.progress.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const validateMiddleware = require("../../middlewares/validate.middleware");
const { apiLimiter } = require("../../middlewares/rate.limit.middleware");
const {
  completeLessonSchema,
  updateLessonProgressSchema,
  enrollInCourseSchema,
  updateLearningGoalsSchema,
  getProgressQuerySchema,
} = require("../../schemas/user/user.progress.schema");

// Apply rate limiting to all routes
router.use(apiLimiter);

// User routes (authentication required)
router.get(
  "/",
  authMiddleware,
  validateMiddleware(getProgressQuerySchema, "query"),
  userProgressController.getUserProgress
);

router.get(
  "/statistics",
  authMiddleware,
  userProgressController.getProgressStatistics
);

// Lesson progress routes
router.post(
  "/lessons/:lessonId/start",
  authMiddleware,
  userProgressController.startLesson
);

router.post(
  "/lessons/:lessonId/complete",
  authMiddleware,
  validateMiddleware(completeLessonSchema),
  userProgressController.completeLesson
);

router.put(
  "/lessons/:lessonId",
  authMiddleware,
  validateMiddleware(updateLessonProgressSchema),
  userProgressController.updateLessonProgress
);

router.get(
  "/lessons/:lessonId",
  authMiddleware,
  userProgressController.getLessonProgress
);

// Course progress routes
router.post(
  "/courses/:courseId/enroll",
  authMiddleware,
  validateMiddleware(enrollInCourseSchema),
  userProgressController.enrollInCourse
);

router.put(
  "/courses/:courseId",
  authMiddleware,
  userProgressController.updateCourseProgress
);

router.get(
  "/courses/:courseId",
  authMiddleware,
  userProgressController.getCourseProgress
);

// Learning goals routes
router.put(
  "/learning-goals",
  authMiddleware,
  validateMiddleware(updateLearningGoalsSchema),
  userProgressController.updateLearningGoals
);

// Streak management
router.put("/streak", authMiddleware, userProgressController.updateStreak);

// Admin routes
router.get(
  "/admin/all",
  authMiddleware,
  roleMiddleware(["admin"]),
  validateMiddleware(getProgressQuerySchema, "query"),
  userProgressController.getAllUsersProgress
);

router.get(
  "/admin/user/:userId",
  authMiddleware,
  roleMiddleware(["admin"]),
  userProgressController.getUserProgressById
);

router.delete(
  "/admin/user/:userId/reset",
  authMiddleware,
  roleMiddleware(["admin"]),
  userProgressController.resetUserProgress
);

module.exports = router;
