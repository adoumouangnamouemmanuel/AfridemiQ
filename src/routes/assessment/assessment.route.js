const express = require("express");
const {
  createAssessment,
  getAssessmentById,
  getAssessments,
  updateAssessment,
  deleteAssessment,
  getAssessmentsBySubject,
  getPublishedAssessments,
  publishAssessment,
  getAssessmentAnalytics,
  bulkUpdateAssessments,
  bulkDeleteAssessments,
} = require("../../controllers/assessment/assessment.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const validateMiddleware = require("../../middlewares/validate.middleware");
const {
  createAssessmentSchema,
  updateAssessmentSchema,
  getAssessmentsSchema,
  bulkUpdateAssessmentsSchema,
  bulkDeleteAssessmentsSchema,
} = require("../../schemas/assessment/assessment.schema");

const router = express.Router();

// Public routes
router.get(
  "/published",
  validateMiddleware(getAssessmentsSchema, "query"),
  getPublishedAssessments
);
router.get(
  "/subject/:subjectId",
  validateMiddleware(getAssessmentsSchema, "query"),
  getAssessmentsBySubject
);

// Protected routes
router.use(authMiddleware);

// CRUD operations
router.post("/", validateMiddleware(createAssessmentSchema), createAssessment);
router.get("/", validateMiddleware(getAssessmentsSchema, "query"), getAssessments);
router.get("/:assessmentId", getAssessmentById);
router.put(
  "/:assessmentId",
  validateMiddleware(updateAssessmentSchema),
  updateAssessment
);
router.delete("/:assessmentId", deleteAssessment);

// Special operations
router.patch("/:assessmentId/publish", publishAssessment);
router.get("/:assessmentId/analytics", getAssessmentAnalytics);

// Bulk operations
router.patch(
  "/bulk/update",
  validateMiddleware(bulkUpdateAssessmentsSchema),
  bulkUpdateAssessments
);
router.delete(
  "/bulk/delete",
  validateMiddleware(bulkDeleteAssessmentsSchema),
  bulkDeleteAssessments
);

module.exports = router;