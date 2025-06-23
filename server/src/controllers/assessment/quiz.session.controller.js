const quizSessionService = require("../../services/assessment/quizSession/quiz.session.service");
const { asyncHandler } = require("../../utils/asyncHandler");
const { ApiError } = require("../../utils/ApiError");

class QuizSessionController {
  // Create new quiz session
  createSession = asyncHandler(async (req, res) => {
    const { quizId } = req.body;
    const userId = req.user.id;
    const deviceInfo = {
      platform: req.headers["x-platform"] || req.body.platform,
      browser: req.headers["user-agent"],
      userAgent: req.headers["user-agent"],
      screenResolution: req.body.screenResolution,
      isOnline: req.body.isOnline !== false,
    };

    const result = await quizSessionService.createSession(
      userId,
      quizId,
      deviceInfo
    );
    res.status(result.statusCode).json(result);
  });

  // Start quiz session
  startSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const result = await quizSessionService.startSession(sessionId, userId);
    res.status(result.statusCode).json(result);
  });

  // Get session details
  getSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const result = await quizSessionService.getSession(sessionId, userId);
    res.status(result.statusCode).json(result);
  });

  // Submit answer
  submitAnswer = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const { questionId, selectedAnswer } = req.body;
    const userId = req.user.id;

    if (!questionId || selectedAnswer === undefined) {
      throw new ApiError(400, "Question ID and selected answer are required");
    }

    const result = await quizSessionService.submitAnswer(
      sessionId,
      userId,
      questionId,
      selectedAnswer
    );
    res.status(result.statusCode).json(result);
  });

  // Toggle question flag
  toggleQuestionFlag = asyncHandler(async (req, res) => {
    const { sessionId, questionId } = req.params;
    const userId = req.user.id;

    const result = await quizSessionService.toggleQuestionFlag(
      sessionId,
      userId,
      questionId
    );
    res.status(result.statusCode).json(result);
  });

  // Skip question
  skipQuestion = asyncHandler(async (req, res) => {
    const { sessionId, questionId } = req.params;
    const userId = req.user.id;

    const result = await quizSessionService.skipQuestion(
      sessionId,
      userId,
      questionId
    );
    res.status(result.statusCode).json(result);
  });

  // Navigate to question
  navigateToQuestion = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const { questionIndex } = req.body;
    const userId = req.user.id;

    if (questionIndex === undefined || questionIndex < 0) {
      throw new ApiError(400, "Valid question index is required");
    }

    const result = await quizSessionService.navigateToQuestion(
      sessionId,
      userId,
      questionIndex
    );
    res.status(result.statusCode).json(result);
  });

  // Pause session
  pauseSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const result = await quizSessionService.pauseSession(sessionId, userId);
    res.status(result.statusCode).json(result);
  });

  // Resume session
  resumeSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const result = await quizSessionService.resumeSession(sessionId, userId);
    res.status(result.statusCode).json(result);
  });

  // Complete session
  completeSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const result = await quizSessionService.completeSession(sessionId, userId);
    res.status(result.statusCode).json(result);
  });

  // Get user's active sessions
  getUserActiveSessions = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const result = await quizSessionService.getUserActiveSessions(userId);
    res.status(result.statusCode).json(result);
  });

  // Get session history
  getUserSessionHistory = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const options = {
      page: Number.parseInt(req.query.page) || 1,
      limit: Number.parseInt(req.query.limit) || 10,
      status: req.query.status,
      quizId: req.query.quizId,
    };

    const result = await quizSessionService.getUserSessionHistory(
      userId,
      options
    );
    res.status(result.statusCode).json(result);
  });

  // Sync session data
  syncSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const userId = req.user.id;
    const syncData = req.body;

    const result = await quizSessionService.syncSession(
      sessionId,
      userId,
      syncData
    );
    res.status(result.statusCode).json(result);
  });

  // Admin: Cleanup expired sessions
  cleanupExpiredSessions = asyncHandler(async (req, res) => {
    // Only admin can perform cleanup
    if (req.user.role !== "admin") {
      throw new ApiError(
        403,
        "Only administrators can perform cleanup operations"
      );
    }

    const result = await quizSessionService.cleanupExpiredSessions();
    res.status(result.statusCode).json(result);
  });

  // Admin: Delete old sessions
  deleteOldSessions = asyncHandler(async (req, res) => {
    // Only admin can perform cleanup
    if (req.user.role !== "admin") {
      throw new ApiError(
        403,
        "Only administrators can perform cleanup operations"
      );
    }

    const daysOld = Number.parseInt(req.query.daysOld) || 30;
    const result = await quizSessionService.deleteOldSessions(daysOld);
    res.status(result.statusCode).json(result);
  });
}

module.exports = new QuizSessionController();