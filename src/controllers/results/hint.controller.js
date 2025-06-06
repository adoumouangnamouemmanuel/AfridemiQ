const hintUsageService = require("../../services/results/hint.service");
const { asyncHandler } = require("../../utils/asyncHandler");
const { ApiError } = require("../../utils/ApiError");

class HintUsageController {
  // Record hint usage
  recordHintUsage = asyncHandler(async (req, res) => {
    const hintData = {
      ...req.body,
      userId: req.user.id,
      deviceInfo: {
        platform: req.headers["x-platform"] || req.body.platform,
        browser: req.headers["user-agent"],
        screenSize: req.body.screenSize,
      },
    };

    const result = await hintUsageService.recordHintUsage(hintData);
    res.status(result.statusCode).json(result);
  });

  // Get hint usage by ID
  getHintUsageById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await hintUsageService.getHintUsageById(id);
    res.status(result.statusCode).json(result);
  });

  // Get user's hint usage history
  getUserHintUsage = asyncHandler(async (req, res) => {
    const userId = req.params.userId || req.user.id;

    // Users can only access their own data unless they're admin
    if (userId !== req.user.id && req.user.role !== "admin") {
      throw new ApiError(403, "Access denied");
    }

    const options = {
      page: Number.parseInt(req.query.page) || 1,
      limit: Number.parseInt(req.query.limit) || 20,
      questionId: req.query.questionId,
      quizId: req.query.quizId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      hintType: req.query.hintType,
    };

    const result = await hintUsageService.getUserHintUsage(userId, options);
    res.status(result.statusCode).json(result);
  });

  // Get current user's hint usage
  getMyHintUsage = asyncHandler(async (req, res) => {
    const options = {
      page: Number.parseInt(req.query.page) || 1,
      limit: Number.parseInt(req.query.limit) || 20,
      questionId: req.query.questionId,
      quizId: req.query.quizId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      hintType: req.query.hintType,
    };

    const result = await hintUsageService.getUserHintUsage(
      req.user.id,
      options
    );
    res.status(result.statusCode).json(result);
  });

  // Get question hint statistics
  getQuestionHintStats = asyncHandler(async (req, res) => {
    const { questionId } = req.params;
    const result = await hintUsageService.getQuestionHintStats(questionId);
    res.status(result.statusCode).json(result);
  });

  // Get user hint analytics
  getUserHintAnalytics = asyncHandler(async (req, res) => {
    const userId = req.params.userId || req.user.id;

    // Users can only access their own analytics unless they're admin
    if (userId !== req.user.id && req.user.role !== "admin") {
      throw new ApiError(403, "Access denied");
    }

    const result = await hintUsageService.getUserHintAnalytics(userId);
    res.status(result.statusCode).json(result);
  });

  // Get my hint analytics
  getMyHintAnalytics = asyncHandler(async (req, res) => {
    const result = await hintUsageService.getUserHintAnalytics(req.user.id);
    res.status(result.statusCode).json(result);
  });

  // Get questions needing better hints (admin only)
  getQuestionsNeedingBetterHints = asyncHandler(async (req, res) => {
    if (req.user.role !== "admin") {
      throw new ApiError(403, "Only administrators can access this endpoint");
    }

    const result = await hintUsageService.getQuestionsNeedingBetterHints();
    res.status(result.statusCode).json(result);
  });

  // Update hint usage
  updateHintUsage = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if user owns the hint usage record or is admin
    const hintUsage = await hintUsageService.getHintUsageById(id);
    if (
      hintUsage.data.userId._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      throw new ApiError(
        403,
        "Not authorized to update this hint usage record"
      );
    }

    const result = await hintUsageService.updateHintUsage(id, req.body);
    res.status(result.statusCode).json(result);
  });

  // Delete hint usage record
  deleteHintUsage = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if user owns the hint usage record or is admin
    const hintUsage = await hintUsageService.getHintUsageById(id);
    if (
      hintUsage.data.userId._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      throw new ApiError(
        403,
        "Not authorized to delete this hint usage record"
      );
    }

    const result = await hintUsageService.deleteHintUsage(id);
    res.status(result.statusCode).json(result);
  });

  // Get hint usage summary (admin only)
  getHintUsageSummary = asyncHandler(async (req, res) => {
    if (req.user.role !== "admin") {
      throw new ApiError(403, "Only administrators can access this endpoint");
    }

    const options = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      groupBy: req.query.groupBy || "day",
    };

    const result = await hintUsageService.getHintUsageSummary(options);
    res.status(result.statusCode).json(result);
  });

  // Bulk delete hint usages (admin only)
  bulkDeleteHintUsages = asyncHandler(async (req, res) => {
    if (req.user.role !== "admin") {
      throw new ApiError(
        403,
        "Only administrators can perform bulk operations"
      );
    }

    const { hintUsageIds } = req.body;

    if (!Array.isArray(hintUsageIds) || hintUsageIds.length === 0) {
      throw new ApiError(400, "Hint usage IDs array is required");
    }

    const result = await hintUsageService.bulkDeleteHintUsages(hintUsageIds);
    res.status(result.statusCode).json(result);
  });
}

module.exports = new HintUsageController();