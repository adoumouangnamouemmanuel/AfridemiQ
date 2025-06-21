const express = require("express");
const subjectController = require("../../controllers/learning/subject.controller");
const validateMiddleware = require("../../middlewares/validate.middleware");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const utf8Middleware = require("../../middlewares/utf8.middleware");
const { apiLimiter } = require("../../middlewares/rate.limit.middleware");

const {
  createSubjectSchema,
  updateSubjectSchema,
  getSubjectsQuerySchema,
} = require("../../schemas/learning/subject.schema");

const router = express.Router();

// Apply UTF-8 middleware to all routes
router.use(utf8Middleware);

// Apply rate limiting
router.use(apiLimiter);

// =============== PUBLIC ROUTES ===============

// Get all subjects with filtering and pagination
router.get(
  "/",
  validateMiddleware(getSubjectsQuerySchema, "query"),
  subjectController.getSubjects
);

// Get subject by ID
router.get("/:id", subjectController.getSubjectById);

// Get featured subjects
router.get("/featured/list", subjectController.getFeaturedSubjects);

// Export route - BEFORE /:id route
router.get(
  "/export",
  authMiddleware,
  roleMiddleware(["teacher", "admin"]),
  subjectController.exportSubjects
);

// Bulk operations (require admin/teacher role) - BEFORE /:id route
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

// Comparison route - BEFORE /:id route
router.post(
  "/compare",
  authMiddleware,
  validateMiddleware(compareSubjectsSchema),
  subjectController.compareSubjects
);

// Subject CRUD operations
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["teacher", "admin"]),
  validateMiddleware(createSubjectSchema),
  subjectController.createSubject
);

// Public subject routes with series parameter
router.get(
  "/series/:series",
  validateMiddleware(getSubjectsSchema),
  subjectController.getSubjectsBySeries
);

// Dynamic ID routes - AFTER all static routes
router.get(
  "/:id/performance",
  authMiddleware,
  roleMiddleware(["teacher", "admin"]),
  subjectController.getSubjectPerformance
);

router.get("/:id", subjectController.getSubjectById);

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

// General subjects route - LAST
router.get(
  "/",
  validateMiddleware(getSubjectsSchema),
  subjectController.getSubjects
);

module.exports = router;
