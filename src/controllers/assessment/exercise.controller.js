const exerciseService = require("../../services/assessment/exercise/exercise.service");
const { asyncHandler } = require("../../utils/asyncHandler");
const { ApiError } = require("../../utils/ApiError");

class ExerciseController {
  // Create exercise
  createExercise = asyncHandler(async (req, res) => {
    const result = await exerciseService.createExercise(req.body, req.user.id);
    res.status(result.statusCode).json(result);
  });

  // Get all exercises
  getAllExercises = asyncHandler(async (req, res) => {
    const filters = {
      subjectId: req.query.subjectId,
      topicId: req.query.topicId,
      difficulty: req.query.difficulty,
      type: req.query.type,
      subjectType: req.query.subjectType,
      premiumOnly: req.query.premiumOnly === "true",
      createdBy: req.query.createdBy,
      tags: req.query.tags ? req.query.tags.split(",") : undefined,
      search: req.query.search,
    };

    const options = {
      page: Number.parseInt(req.query.page) || 1,
      limit: Number.parseInt(req.query.limit) || 10,
      sortBy: req.query.sortBy || "createdAt",
      sortOrder: req.query.sortOrder || "desc",
      populate: req.query.populate
        ? req.query.populate.split(",")
        : ["subjectId", "topicId"],
    };

    const result = await exerciseService.getAllExercises(filters, options);
    res.status(result.statusCode).json(result);
  });

  // Get exercise by ID
  getExerciseById = asyncHandler(async (req, res) => {
    const populate = req.query.populate
      ? req.query.populate.split(",")
      : ["subjectId", "topicId", "metadata.createdBy"];
    const result = await exerciseService.getExerciseById(
      req.params.id,
      populate
    );
    res.status(result.statusCode).json(result);
  });

  // Update exercise
  updateExercise = asyncHandler(async (req, res) => {
    const result = await exerciseService.updateExercise(
      req.params.id,
      req.body,
      req.user.id
    );
    res.status(result.statusCode).json(result);
  });

  // Delete exercise
  deleteExercise = asyncHandler(async (req, res) => {
    const result = await exerciseService.deleteExercise(
      req.params.id,
      req.user.id
    );
    res.status(result.statusCode).json(result);
  });

  // Get exercises by subject
  getExercisesBySubject = asyncHandler(async (req, res) => {
    const options = {
      page: Number.parseInt(req.query.page) || 1,
      limit: Number.parseInt(req.query.limit) || 10,
      sortBy: req.query.sortBy || "createdAt",
      sortOrder: req.query.sortOrder || "desc",
      populate: req.query.populate
        ? req.query.populate.split(",")
        : ["topicId"],
    };

    const result = await exerciseService.getExercisesBySubject(
      req.params.subjectId,
      options
    );
    res.status(result.statusCode).json(result);
  });

  // Get exercises by topic
  getExercisesByTopic = asyncHandler(async (req, res) => {
    const options = {
      page: Number.parseInt(req.query.page) || 1,
      limit: Number.parseInt(req.query.limit) || 10,
      sortBy: req.query.sortBy || "createdAt",
      sortOrder: req.query.sortOrder || "desc",
      populate: req.query.populate
        ? req.query.populate.split(",")
        : ["subjectId"],
    };

    const result = await exerciseService.getExercisesByTopic(
      req.params.topicId,
      options
    );
    res.status(result.statusCode).json(result);
  });

  // Get exercises by difficulty
  getExercisesByDifficulty = asyncHandler(async (req, res) => {
    const options = {
      page: Number.parseInt(req.query.page) || 1,
      limit: Number.parseInt(req.query.limit) || 10,
      sortBy: req.query.sortBy || "createdAt",
      sortOrder: req.query.sortOrder || "desc",
      populate: req.query.populate
        ? req.query.populate.split(",")
        : ["subjectId", "topicId"],
    };

    const result = await exerciseService.getExercisesByDifficulty(
      req.params.difficulty,
      options
    );
    res.status(result.statusCode).json(result);
  });

  // Add feedback
  addFeedback = asyncHandler(async (req, res) => {
    const { rating, comments } = req.body;

    if (!rating || rating < 0 || rating > 5) {
      throw new ApiError(400, "Rating must be between 0 and 5");
    }

    const result = await exerciseService.addFeedback(
      req.params.id,
      req.user.id,
      rating,
      comments
    );
    res.status(result.statusCode).json(result);
  });

  // Update analytics
  updateAnalytics = asyncHandler(async (req, res) => {
    const { score, timeSpent } = req.body;

    if (score === undefined || timeSpent === undefined) {
      throw new ApiError(400, "Score and timeSpent are required");
    }

    const result = await exerciseService.updateAnalytics(
      req.params.id,
      score,
      timeSpent
    );
    res.status(result.statusCode).json(result);
  });

  // Get exercise analytics
  getExerciseAnalytics = asyncHandler(async (req, res) => {
    const result = await exerciseService.getExerciseAnalytics(req.params.id);
    res.status(result.statusCode).json(result);
  });

  // Get recommended exercises
  getRecommendedExercises = asyncHandler(async (req, res) => {
    const options = {
      limit: Number.parseInt(req.query.limit) || 10,
      difficulty: req.query.difficulty,
      subjectId: req.query.subjectId,
      topicId: req.query.topicId,
    };

    const result = await exerciseService.getRecommendedExercises(
      req.user.id,
      options
    );
    res.status(result.statusCode).json(result);
  });

  // Bulk create exercises
  bulkCreateExercises = asyncHandler(async (req, res) => {
    if (!Array.isArray(req.body) || req.body.length === 0) {
      throw new ApiError(
        400,
        "Request body must be a non-empty array of exercises"
      );
    }

    const result = await exerciseService.bulkCreateExercises(
      req.body,
      req.user.id
    );
    res.status(result.statusCode).json(result);
  });

  // Bulk update exercises
  bulkUpdateExercises = asyncHandler(async (req, res) => {
    const { exerciseIds, updateData } = req.body;

    if (!Array.isArray(exerciseIds) || exerciseIds.length === 0) {
      throw new ApiError(400, "exerciseIds must be a non-empty array");
    }

    if (!updateData || typeof updateData !== "object") {
      throw new ApiError(400, "updateData is required and must be an object");
    }

    const result = await exerciseService.bulkUpdateExercises(
      exerciseIds,
      updateData,
      req.user.id
    );
    res.status(result.statusCode).json(result);
  });

  // Bulk delete exercises
  bulkDeleteExercises = asyncHandler(async (req, res) => {
    const { exerciseIds } = req.body;

    if (!Array.isArray(exerciseIds) || exerciseIds.length === 0) {
      throw new ApiError(400, "exerciseIds must be a non-empty array");
    }

    const result = await exerciseService.bulkDeleteExercises(
      exerciseIds,
      req.user.id
    );
    res.status(result.statusCode).json(result);
  });

  // Advanced search
  advancedSearch = asyncHandler(async (req, res) => {
    const searchCriteria = {
      keywords: req.body.keywords,
      subjects: req.body.subjects,
      topics: req.body.topics,
      difficulties: req.body.difficulties,
      types: req.body.types,
      tags: req.body.tags,
      dateRange: req.body.dateRange,
      ratingRange: req.body.ratingRange,
      premiumOnly: req.body.premiumOnly,
    };

    const options = {
      page: Number.parseInt(req.query.page) || 1,
      limit: Number.parseInt(req.query.limit) || 10,
      sortBy: req.query.sortBy || "relevance",
      sortOrder: req.query.sortOrder || "desc",
    };

    const result = await exerciseService.advancedSearch(
      searchCriteria,
      options
    );
    res.status(result.statusCode).json(result);
  });

  // Get exercise statistics
  getExerciseStatistics = asyncHandler(async (req, res) => {
    const filters = {
      subjectId: req.query.subjectId,
      topicId: req.query.topicId,
      dateRange:
        req.query.startDate && req.query.endDate
          ? {
              start: req.query.startDate,
              end: req.query.endDate,
            }
          : undefined,
    };

    const result = await exerciseService.getExerciseStatistics(filters);
    res.status(result.statusCode).json(result);
  });

  // Get subject-specific exercises
  getMathExercises = asyncHandler(async (req, res) => {
    const filters = { ...req.query, subjectType: "math" };
    const options = {
      page: Number.parseInt(req.query.page) || 1,
      limit: Number.parseInt(req.query.limit) || 10,
      populate: ["subjectId", "topicId"],
    };

    const result = await exerciseService.getAllExercises(filters, options);
    res.status(result.statusCode).json(result);
  });

  getPhysicsExercises = asyncHandler(async (req, res) => {
    const filters = { ...req.query, subjectType: "physics" };
    const options = {
      page: Number.parseInt(req.query.page) || 1,
      limit: Number.parseInt(req.query.limit) || 10,
      populate: ["subjectId", "topicId"],
    };

    const result = await exerciseService.getAllExercises(filters, options);
    res.status(result.statusCode).json(result);
  });

  getChemistryExercises = asyncHandler(async (req, res) => {
    const filters = { ...req.query, subjectType: "chemistry" };
    const options = {
      page: Number.parseInt(req.query.page) || 1,
      limit: Number.parseInt(req.query.limit) || 10,
      populate: ["subjectId", "topicId"],
    };

    const result = await exerciseService.getAllExercises(filters, options);
    res.status(result.statusCode).json(result);
  });

  getBiologyExercises = asyncHandler(async (req, res) => {
    const filters = { ...req.query, subjectType: "biology" };
    const options = {
      page: Number.parseInt(req.query.page) || 1,
      limit: Number.parseInt(req.query.limit) || 10,
      populate: ["subjectId", "topicId"],
    };

    const result = await exerciseService.getAllExercises(filters, options);
    res.status(result.statusCode).json(result);
  });

  getFrenchExercises = asyncHandler(async (req, res) => {
    const filters = { ...req.query, subjectType: "french" };
    const options = {
      page: Number.parseInt(req.query.page) || 1,
      limit: Number.parseInt(req.query.limit) || 10,
      populate: ["subjectId", "topicId"],
    };

    const result = await exerciseService.getAllExercises(filters, options);
    res.status(result.statusCode).json(result);
  });

  getPhilosophyExercises = asyncHandler(async (req, res) => {
    const filters = { ...req.query, subjectType: "philosophy" };
    const options = {
      page: Number.parseInt(req.query.page) || 1,
      limit: Number.parseInt(req.query.limit) || 10,
      populate: ["subjectId", "topicId"],
    };

    const result = await exerciseService.getAllExercises(filters, options);
    res.status(result.statusCode).json(result);
  });

  getEnglishExercises = asyncHandler(async (req, res) => {
    const filters = { ...req.query, subjectType: "english" };
    const options = {
      page: Number.parseInt(req.query.page) || 1,
      limit: Number.parseInt(req.query.limit) || 10,
      populate: ["subjectId", "topicId"],
    };

    const result = await exerciseService.getAllExercises(filters, options);
    res.status(result.statusCode).json(result);
  });

  getHistoryExercises = asyncHandler(async (req, res) => {
    const filters = { ...req.query, subjectType: "history" };
    const options = {
      page: Number.parseInt(req.query.page) || 1,
      limit: Number.parseInt(req.query.limit) || 10,
      populate: ["subjectId", "topicId"],
    };

    const result = await exerciseService.getAllExercises(filters, options);
    res.status(result.statusCode).json(result);
  });

  getGeographyExercises = asyncHandler(async (req, res) => {
    const filters = { ...req.query, subjectType: "geography" };
    const options = {
      page: Number.parseInt(req.query.page) || 1,
      limit: Number.parseInt(req.query.limit) || 10,
      populate: ["subjectId", "topicId"],
    };

    const result = await exerciseService.getAllExercises(filters, options);
    res.status(result.statusCode).json(result);
  });
}

module.exports = new ExerciseController();