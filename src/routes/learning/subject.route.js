const express = require("express");
const subjectController = require("../../controllers/learning/subject.controller");
const validateMiddleware = require("../../middlewares/validate.middleware");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const { apiLimiter } = require("../../middlewares/rate.limit.middleware");

const {
  createSubjectSchema,
  updateSubjectSchema,
  getSubjectsSchema,
  addExamToSubjectSchema,
  rateSubjectSchema,
  bulkCreateSchema,
  bulkUpdateSchema,
  compareSubjectsSchema,
} = require("../../schemas/learning/subject.schema");

const router = express.Router();

// Apply rate limiting to all routes
router.use(apiLimiter);

// Search and analytics routes (public)
router.get("/search", subjectController.advancedSearch);
router.get("/search/suggestions", subjectController.getSearchSuggestions);
router.get("/trending", subjectController.getTrendingSubjects);

// Public subject routes
router.get(
  "/series/:series",
  validateMiddleware(getSubjectsSchema, "query"),
  subjectController.getSubjectsBySeries
);
router.get("/:id", subjectController.getSubjectById);
router.get(
  "/",
  validateMiddleware(getSubjectsSchema, "query"),
  subjectController.getSubjects
);

// Analytics routes (require authentication)
router.get(
  "/analytics",
  authMiddleware,
  roleMiddleware(["teacher", "admin"]),
  subjectController.getSubjectAnalytics
);
router.get(
  "/:id/performance",
  authMiddleware,
  roleMiddleware(["teacher", "admin"]),
  subjectController.getSubjectPerformance
);

// Comparison route
router.post(
  "/compare",
  authMiddleware,
  validateMiddleware(compareSubjectsSchema),
  subjectController.compareSubjects
);

// Export route
router.get(
  "/export",
  authMiddleware,
  roleMiddleware(["teacher", "admin"]),
  subjectController.exportSubjects
);

// Bulk operations (require admin/teacher role)
router.post(
  "/bulk",
  authMiddleware,
  roleMiddleware(["teacher", "admin"]),
  validateMiddleware(bulkCreateSchema),
  subjectController.bulkCreateSubjects
);
router.put(
  "/bulk",
  authMiddleware,
  roleMiddleware(["teacher", "admin"]),
  validateMiddleware(bulkUpdateSchema),
  subjectController.bulkUpdateSubjects
);

// Subject CRUD operations
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["teacher", "admin"]),
  validateMiddleware(createSubjectSchema),
  subjectController.createSubject
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["teacher", "admin"]),
  validateMiddleware(updateSubjectSchema),
  subjectController.updateSubject
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["teacher", "admin"]),
  subjectController.deleteSubject
);

// Rating system
router.post(
  "/:id/rate",
  authMiddleware,
  validateMiddleware(rateSubjectSchema),
  subjectController.rateSubject
);

// Exam management
router.post(
  "/:id/exams",
  authMiddleware,
  roleMiddleware(["teacher", "admin"]),
  validateMiddleware(addExamToSubjectSchema),
  subjectController.addExamToSubject
);

router.delete(
  "/:id/exams/:examId",
  authMiddleware,
  roleMiddleware(["teacher", "admin"]),
  subjectController.removeExamFromSubject
);

module.exports = router;
