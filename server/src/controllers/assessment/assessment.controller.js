const assessmentService = require("../../services/assessment/assessment/assessment.service");
const { ApiError } = require("../../utils/ApiError");
const { ApiResponse } = require("../../utils/ApiResponse");
const { asyncHandler } = require("../../utils/asyncHandler");

// Create assessment
const createAssessment = asyncHandler(async (req, res) => {
  const assessmentData = {
    ...req.body,
    creatorId: req.user._id,
  };

  const assessment = await assessmentService.createAssessment(assessmentData);

  res
    .status(201)
    .json(new ApiResponse(201, assessment, "Assessment created successfully"));
});

// Get assessment by ID
const getAssessmentById = asyncHandler(async (req, res) => {
  const { assessmentId } = req.params;

  const assessment = await assessmentService.getAssessmentById(assessmentId);

  res
    .status(200)
    .json(
      new ApiResponse(200, assessment, "Assessment retrieved successfully")
    );
});

// Get all assessments
const getAssessments = asyncHandler(async (req, res) => {
  const filters = {
    search: req.query.search,
    subjectId: req.query.subjectId,
    level: req.query.level,
    format: req.query.format,
    difficulty: req.query.difficulty,
    status: req.query.status,
    premiumOnly: req.query.premiumOnly,
    creatorId: req.query.creatorId,
  };

  const options = {
    page: Number.parseInt(req.query.page) || 1,
    limit: Number.parseInt(req.query.limit) || 10,
    sortBy: req.query.sortBy || "createdAt",
    sortOrder: req.query.sortOrder || "desc",
  };

  const result = await assessmentService.getAssessments(filters, options);

  res
    .status(200)
    .json(new ApiResponse(200, result, "Assessments retrieved successfully"));
});

// Update assessment
const updateAssessment = asyncHandler(async (req, res) => {
  const { assessmentId } = req.params;

  const assessment = await assessmentService.updateAssessment(
    assessmentId,
    req.body
  );

  res
    .status(200)
    .json(new ApiResponse(200, assessment, "Assessment updated successfully"));
});

// Delete assessment
const deleteAssessment = asyncHandler(async (req, res) => {
  const { assessmentId } = req.params;

  const result = await assessmentService.deleteAssessment(assessmentId);

  res
    .status(200)
    .json(new ApiResponse(200, result, "Assessment deleted successfully"));
});

// Get assessments by subject
const getAssessmentsBySubject = asyncHandler(async (req, res) => {
  const { subjectId } = req.params;
  const options = {
    format: req.query.format,
    level: req.query.level,
    difficulty: req.query.difficulty,
  };

  const assessments = await assessmentService.getAssessmentsBySubject(
    subjectId,
    options
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        assessments,
        "Subject assessments retrieved successfully"
      )
    );
});

// Get published assessments
const getPublishedAssessments = asyncHandler(async (req, res) => {
  const filters = {
    subjectId: req.query.subjectId,
    level: req.query.level,
    format: req.query.format,
    premiumOnly: req.query.premiumOnly,
  };

  const assessments = await assessmentService.getPublishedAssessments(filters);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        assessments,
        "Published assessments retrieved successfully"
      )
    );
});

// Publish assessment
const publishAssessment = asyncHandler(async (req, res) => {
  const { assessmentId } = req.params;

  const assessment = await assessmentService.publishAssessment(assessmentId);

  res
    .status(200)
    .json(
      new ApiResponse(200, assessment, "Assessment published successfully")
    );
});

// Get assessment analytics
const getAssessmentAnalytics = asyncHandler(async (req, res) => {
  const { assessmentId } = req.params;

  const analytics = await assessmentService.getAssessmentAnalytics(
    assessmentId
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        analytics,
        "Assessment analytics retrieved successfully"
      )
    );
});

// Bulk update assessments
const bulkUpdateAssessments = asyncHandler(async (req, res) => {
  const { assessmentIds, updateData } = req.body;

  if (
    !assessmentIds ||
    !Array.isArray(assessmentIds) ||
    assessmentIds.length === 0
  ) {
    throw new ApiError(400, "Assessment IDs array is required");
  }

  const result = await assessmentService.bulkUpdateAssessments(
    assessmentIds,
    updateData
  );

  res
    .status(200)
    .json(new ApiResponse(200, result, "Assessments updated successfully"));
});

// Bulk delete assessments
const bulkDeleteAssessments = asyncHandler(async (req, res) => {
  const { assessmentIds } = req.body;

  if (
    !assessmentIds ||
    !Array.isArray(assessmentIds) ||
    assessmentIds.length === 0
  ) {
    throw new ApiError(400, "Assessment IDs array is required");
  }

  const result = await assessmentService.bulkDeleteAssessments(assessmentIds);

  res
    .status(200)
    .json(new ApiResponse(200, result, "Assessments deleted successfully"));
});

module.exports = {
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
};