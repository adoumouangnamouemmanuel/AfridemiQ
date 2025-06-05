const express = require("express");
const router = express.Router();
const subjectController = require("../../controllers/learning/subject.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const validateMiddleware = require("../../middlewares/validate.middleware");
const { apiLimiter } = require("../../middlewares/rate.limit.middleware");
const {
  createSubjectSchema,
  updateSubjectSchema,
  getSubjectsSchema,
  addExamToSubjectSchema,
  rateSubjectSchema,
  bulkCreateSchema,
  bulkUpdateSchema,
  bulkDeleteSchema,
  compareSubjectsSchema,
} = require("../../schemas/learning/subject.schema");

// Apply rate limiting to all routes
router.use(apiLimiter);

// Public routes
router.get(
  "/",
  validateMiddleware(getSubjectsSchema),
  subjectController.getSubjects
);
router.get("/search", subjectController.advancedSearch);
router.get("/search/suggestions", subjectController.getSearchSuggestions);
router.get("/search/trending", subjectController.getTrendingSearches);
router.get("/analytics", subjectController.getSubjectAnalytics);
router.get("/trending", subjectController.getTrendingSubjects);
router.get("/series/:series", subjectController.getSubjectsBySeries);
router.get("/export", subjectController.exportSubjects);
router.get("/:id", subjectController.getSubjectById);

// Protected routes (require authentication)
router.use(authMiddleware);

// Student routes (authenticated users)
router.post(
  "/:id/rate",
  validateMiddleware(rateSubjectSchema),
  subjectController.rateSubject
);
router.post(
  "/compare",
  validateMiddleware(compareSubjectsSchema),
  subjectController.compareSubjects
);

// Teacher and Admin routes
router.post(
  "/",
  roleMiddleware(["teacher", "admin"]),
  validateMiddleware(createSubjectSchema),
  subjectController.createSubject
);

router.put(
  "/:id",
  roleMiddleware(["teacher", "admin"]),
  validateMiddleware(updateSubjectSchema),
  subjectController.updateSubject
);

router.delete(
  "/:id",
  roleMiddleware(["teacher", "admin"]),
  subjectController.deleteSubject
);

router.post(
  "/:id/exams",
  roleMiddleware(["teacher", "admin"]),
  validateMiddleware(addExamToSubjectSchema),
  subjectController.addExamToSubject
);

router.delete(
  "/:id/exams/:examId",
  roleMiddleware(["teacher", "admin"]),
  subjectController.removeExamFromSubject
);

// Bulk operations (teacher and admin)
router.post(
  "/bulk/create",
  roleMiddleware(["teacher", "admin"]),
  validateMiddleware(bulkCreateSchema),
  subjectController.bulkCreateSubjects
);

router.put(
  "/bulk/update",
  roleMiddleware(["teacher", "admin"]),
  validateMiddleware(bulkUpdateSchema),
  subjectController.bulkUpdateSubjects
);

router.delete(
  "/bulk/delete",
  roleMiddleware(["teacher", "admin"]),
  validateMiddleware(bulkDeleteSchema),
  subjectController.bulkDeleteSubjects
);

router.post(
  "/bulk/import",
  roleMiddleware(["teacher", "admin"]),
  subjectController.importSubjects
);

module.exports = router;