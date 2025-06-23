const quizService = require("../../services/assessment/quiz/quiz.service");
const { asyncHandler } = require("../../utils/asyncHandler");
const { ApiError } = require("../../utils/ApiError");

class QuizController {
  // Create quiz
  createQuiz = asyncHandler(async (req, res) => {
    const quizData = {
      ...req.body,
      createdBy: req.user.id,
    };

    const result = await quizService.createQuiz(quizData);
    res.status(result.statusCode).json(result);
  });

  // Get all quizzes
  getAllQuizzes = asyncHandler(async (req, res) => {
    const options = {
      page: Number.parseInt(req.query.page) || 1,
      limit: Number.parseInt(req.query.limit) || 10,
      sortBy: req.query.sortBy || "createdAt",
      sortOrder: req.query.sortOrder || "desc",
      search: req.query.search,
      subjectId: req.query.subjectId,
      level: req.query.level,
      difficulty: req.query.difficulty,
      premiumOnly: req.query.premiumOnly === "true",
      isActive: req.query.isActive !== "false",
    };

    const result = await quizService.getAllQuizzes({}, options);
    res.status(result.statusCode).json(result);
  });

  // Get quiz by ID
  getQuizById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const includeQuestions = req.query.includeQuestions === "true";

    const result = await quizService.getQuizById(id, includeQuestions);
    res.status(result.statusCode).json(result);
  });

  // Update quiz
  updateQuiz = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if user owns the quiz or is admin
    const quiz = await quizService.getQuizById(id);
    if (
      quiz.data.createdBy._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      throw new ApiError(403, "Not authorized to update this quiz");
    }

    const result = await quizService.updateQuiz(id, req.body);
    res.status(result.statusCode).json(result);
  });

  // Delete quiz
  deleteQuiz = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if user owns the quiz or is admin
    const quiz = await quizService.getQuizById(id);
    if (
      quiz.data.createdBy._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      throw new ApiError(403, "Not authorized to delete this quiz");
    }

    const result = await quizService.deleteQuiz(id);
    res.status(result.statusCode).json(result);
  });

  // Get quizzes by subject
  getQuizzesBySubject = asyncHandler(async (req, res) => {
    const { subjectId } = req.params;
    const options = {
      page: Number.parseInt(req.query.page) || 1,
      limit: Number.parseInt(req.query.limit) || 10,
      sortBy: req.query.sortBy || "createdAt",
      sortOrder: req.query.sortOrder || "desc",
      level: req.query.level,
      difficulty: req.query.difficulty,
    };

    const result = await quizService.getQuizzesBySubject(subjectId, options);
    res.status(result.statusCode).json(result);
  });

  // Get popular quizzes
  getPopularQuizzes = asyncHandler(async (req, res) => {
    const limit = Number.parseInt(req.query.limit) || 10;
    const result = await quizService.getPopularQuizzes(limit);
    res.status(result.statusCode).json(result);
  });

  // Check quiz eligibility
  checkQuizEligibility = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await quizService.canUserTakeQuiz(id, userId);
    res.status(result.statusCode).json(result);
  });

  // Get quiz statistics
  getQuizStatistics = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if user owns the quiz or is admin
    const quiz = await quizService.getQuizById(id);
    if (
      quiz.data.createdBy._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      throw new ApiError(403, "Not authorized to view quiz statistics");
    }

    const result = await quizService.getQuizStatistics(id);
    res.status(result.statusCode).json(result);
  });

  // Update quiz analytics
  updateQuizAnalytics = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if user owns the quiz or is admin
    const quiz = await quizService.getQuizById(id);
    if (
      quiz.data.createdBy._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      throw new ApiError(403, "Not authorized to update quiz analytics");
    }

    const result = await quizService.updateQuizAnalytics(id);
    res.status(result.statusCode).json(result);
  });

  // Bulk update quizzes
  bulkUpdateQuizzes = asyncHandler(async (req, res) => {
    const { quizIds, updateData } = req.body;

    if (!Array.isArray(quizIds) || quizIds.length === 0) {
      throw new ApiError(400, "Quiz IDs array is required");
    }

    // Only admin can perform bulk operations
    if (req.user.role !== "admin") {
      throw new ApiError(
        403,
        "Only administrators can perform bulk operations"
      );
    }

    const result = await quizService.bulkUpdateQuizzes(quizIds, updateData);
    res.status(result.statusCode).json(result);
  });

  // Get my quizzes (created by current user)
  getMyQuizzes = asyncHandler(async (req, res) => {
    const filters = { createdBy: req.user.id };
    const options = {
      page: Number.parseInt(req.query.page) || 1,
      limit: Number.parseInt(req.query.limit) || 10,
      sortBy: req.query.sortBy || "createdAt",
      sortOrder: req.query.sortOrder || "desc",
      search: req.query.search,
      level: req.query.level,
      difficulty: req.query.difficulty,
    };

    const result = await quizService.getAllQuizzes(filters, options);
    res.status(result.statusCode).json(result);
  });
}

module.exports = new QuizController();