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
const { authenticate } = require("../../middlewares/auth.middleware");
const { validateRequest } = require("../../middlewares/validation.middleware");
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
  validateRequest(getAssessmentsSchema, "query"),
  getPublishedAssessments
);
router.get(
  "/subject/:subjectId",
  validateRequest(getAssessmentsSchema, "query"),
  getAssessmentsBySubject
);

// Protected routes
router.use(authenticate);

// CRUD operations
router.post("/", validateRequest(createAssessmentSchema), createAssessment);
router.get("/", validateRequest(getAssessmentsSchema, "query"), getAssessments);
router.get("/:assessmentId", getAssessmentById);
router.put(
  "/:assessmentId",
  validateRequest(updateAssessmentSchema),
  updateAssessment
);
router.delete("/:assessmentId", deleteAssessment);

// Special operations
router.patch("/:assessmentId/publish", publishAssessment);
router.get("/:assessmentId/analytics", getAssessmentAnalytics);

// Bulk operations
router.patch(
  "/bulk/update",
  validateRequest(bulkUpdateAssessmentsSchema),
  bulkUpdateAssessments
);
router.delete(
  "/bulk/delete",
  validateRequest(bulkDeleteAssessmentsSchema),
  bulkDeleteAssessments
);

module.exports = router;