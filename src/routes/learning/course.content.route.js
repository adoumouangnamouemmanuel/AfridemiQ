const express = require("express");
const router = express.Router();
const courseContentController = require("../../controllers/learning/course.content.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const validateMiddleware = require("../../middlewares/validate.middleware");
const { apiLimiter } = require("../../middlewares/rate.limit.middleware");
const {
  createCourseContentSchema,
  updateCourseContentSchema,
  updateProgressTrackingSchema,
  bulkCreateCourseContentsSchema,
} = require("../../schemas/learning/course.content.schema");

// Apply rate limiting to all routes
router.use(apiLimiter);

// Public routes
router.get("/", courseContentController.getAllCourseContents);
router.get("/search", courseContentController.searchCourseContents);
router.get("/statistics", courseContentController.getCourseContentStatistics);
router.get("/difficulty-levels", courseContentController.getDifficultyLevels);
router.get(
  "/subject/:subjectId",
  courseContentController.getCourseContentsBySubject
);
router.get("/exam/:examId", courseContentController.getCourseContentsByExam);
router.get("/:id", courseContentController.getCourseContentById);

// User routes (authentication required)
router.put(
  "/:id/progress",
  authMiddleware,
  validateMiddleware(updateProgressTrackingSchema),
  courseContentController.updateProgressTracking
);

// Admin routes (authentication + admin role required)
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["admin"]),
  validateMiddleware(createCourseContentSchema),
  courseContentController.createCourseContent
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  validateMiddleware(updateCourseContentSchema),
  courseContentController.updateCourseContent
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  courseContentController.deleteCourseContent
);

router.post(
  "/bulk/create",
  authMiddleware,
  roleMiddleware(["admin"]),
  validateMiddleware(bulkCreateCourseContentsSchema),
  courseContentController.bulkCreateCourseContents
);

module.exports = router;