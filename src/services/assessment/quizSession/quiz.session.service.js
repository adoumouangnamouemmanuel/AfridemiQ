const { QuizSession } = require("../../../models/assessment/quiz.session.model");
const { Quiz } = require("../../../models/assessment/quiz.model");
const { Question } = require("../../../models/assessment/question.model");
const { ApiError } = require("../../../utils/ApiError");
const { ApiResponse } = require("../../../utils/ApiResponse");
const createLogger = require("../../logging.service");

const logger = createLogger("QuizSessionService");

class QuizSessionService {
  // Create a new quiz session
  async createSession(userId, quizId, deviceInfo = {}) {
    try {
      // Check if quiz exists
      const quiz = await Quiz.findById(quizId).populate("questionIds");
      if (!quiz) {
        logger.warn(`Quiz not found for session creation: ${quizId}`);
        throw new ApiError(404, "Quiz not found");
      }

      // Check for existing active session
      const existingSession = await QuizSession.findOne({
        userId,
        quizId,
        status: { $in: ["in_progress", "paused"] },
      });

      if (existingSession) {
        logger.info(`Active session found for user ${userId} and quiz ${quizId}`);
        return new ApiResponse(200, existingSession, "Active session found");
      }

      // Create new session
      const sessionData = {
        userId,
        quizId,
        timeRemaining: quiz.timeLimit,
        answers: quiz.questionIds.map((questionId) => ({
          questionId,
          selectedAnswer: null,
          timeSpent: 0,
          flagged: false,
          skipped: false,
        })),
        deviceInfo: {
          ...deviceInfo,
          lastSync: new Date(),
        },
        status: "not_started",
      };

      const session = new QuizSession(sessionData);
      await session.save();

      await session.populate([
        {
          path: "quizId",
          select: "title timeLimit totalQuestions totalPoints",
        },
        { path: "userId", select: "name email" },
      ]);

      logger.info(`New quiz session created: ${session._id} for user ${userId} and quiz ${quizId}`);
      return new ApiResponse(201, session, "Quiz session created successfully");
    } catch (error) {
      logger.error(`Error creating quiz session for user ${userId} and quiz ${quizId}:`, error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Failed to create quiz session", error.message);
    }
  }

  // Start a quiz session
  async startSession(sessionId, userId) {
    try {
      const session = await QuizSession.findOne({
        sessionId,
        userId,
        status: { $in: ["not_started", "paused"] },
      }).populate("quizId");

      if (!session) {
        logger.warn(`Session not found or cannot be started: ${sessionId} for user ${userId}`);
        throw new ApiError(404, "Session not found or cannot be started");
      }

      // Check if session is expired
      if (session.isExpired) {
        session.status = "expired";
        await session.save();
        logger.warn(`Session expired: ${sessionId} for user ${userId}`);
        throw new ApiError(400, "Session has expired");
      }

      session.status = "in_progress";
      session.startTime = session.startTime || new Date();
      session.lastActive = new Date();

      await session.save();

      logger.info(`Quiz session started: ${sessionId} for user ${userId}`);
      return new ApiResponse(200, session, "Quiz session started successfully");
    } catch (error) {
      logger.error(`Error starting quiz session ${sessionId} for user ${userId}:`, error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Failed to start quiz session", error.message);
    }
  }

  // Get session by ID
  async getSession(sessionId, userId) {
    try {
      const session = await QuizSession.findOne({ sessionId, userId }).populate(
        [
          {
            path: "quizId",
            select: "title timeLimit totalQuestions totalPoints settings",
          },
          {
            path: "answers.questionId",
            select: "question format options difficulty points",
          },
        ]
      );

      if (!session) {
        logger.warn(`Session not found: ${sessionId} for user ${userId}`);
        throw new ApiError(404, "Session not found");
      }

      logger.info(`Session retrieved: ${sessionId} for user ${userId}`);
      return new ApiResponse(200, session, "Session retrieved successfully");
    } catch (error) {
      logger.error(`Error retrieving session ${sessionId} for user ${userId}:`, error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Failed to retrieve session", error.message);
    }
  }

  // Submit answer for a question
  async submitAnswer(sessionId, userId, questionId, selectedAnswer) {
    try {
      const session = await QuizSession.findOne({
        sessionId,
        userId,
        status: "in_progress",
      });

      if (!session) {
        logger.warn(`Active session not found for answer submission: ${sessionId} for user ${userId}`);
        throw new ApiError(404, "Active session not found");
      }

      // Find the answer in the session
      const answerIndex = session.answers.findIndex(
        (answer) => answer.questionId.toString() === questionId
      );

      if (answerIndex === -1) {
        logger.warn(`Question not found in session: ${questionId} for session ${sessionId}`);
        throw new ApiError(404, "Question not found in session");
      }

      // Get the question to check correct answer
      const question = await Question.findById(questionId);
      if (!question) {
        logger.warn(`Question not found: ${questionId}`);
        throw new ApiError(404, "Question not found");
      }

      // Update the answer
      const answer = session.answers[answerIndex];
      const previousAnswer = answer.selectedAnswer;

      answer.selectedAnswer = selectedAnswer;
      answer.answeredAt = new Date();
      answer.skipped = false;

      // Calculate time spent (if this is a new answer)
      if (previousAnswer === null || previousAnswer === undefined) {
        const timeSpent = Math.floor((new Date() - session.lastActive) / 1000);
        answer.timeSpent = timeSpent;
      }

      // Check if answer is correct
      answer.isCorrect = this.checkAnswer(question, selectedAnswer);

      session.lastActive = new Date();
      await session.save();

      logger.info(`Answer submitted for question ${questionId} in session ${sessionId} by user ${userId}`);
      return new ApiResponse(
        200,
        {
          answer: answer,
          isCorrect: answer.isCorrect,
          progress: session.progress,
        },
        "Answer submitted successfully"
      );
    } catch (error) {
      logger.error(`Error submitting answer for question ${questionId} in session ${sessionId} by user ${userId}:`, error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Failed to submit answer", error.message);
    }
  }

  // Flag/unflag a question
  async toggleQuestionFlag(sessionId, userId, questionId) {
    try {
      const session = await QuizSession.findOne({
        sessionId,
        userId,
        status: { $in: ["in_progress", "paused"] },
      });

      if (!session) {
        logger.warn(`Session not found for flag toggle: ${sessionId} for user ${userId}`);
        throw new ApiError(404, "Session not found");
      }

      const answerIndex = session.answers.findIndex(
        (answer) => answer.questionId.toString() === questionId
      );

      if (answerIndex === -1) {
        logger.warn(`Question not found in session for flag toggle: ${questionId} in session ${sessionId}`);
        throw new ApiError(404, "Question not found in session");
      }

      session.answers[answerIndex].flagged =
        !session.answers[answerIndex].flagged;
      session.lastActive = new Date();

      await session.save();

      logger.info(`Question flag toggled for question ${questionId} in session ${sessionId} by user ${userId}`);
      return new ApiResponse(
        200,
        {
          flagged: session.answers[answerIndex].flagged,
          progress: session.progress,
        },
        "Question flag toggled successfully"
      );
    } catch (error) {
      logger.error(`Error toggling question flag for question ${questionId} in session ${sessionId} by user ${userId}:`, error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Failed to toggle question flag", error.message);
    }
  }

  // Skip a question
  async skipQuestion(sessionId, userId, questionId) {
    try {
      const session = await QuizSession.findOne({
        sessionId,
        userId,
        status: "in_progress",
      });

      if (!session) {
        logger.warn(`Active session not found for question skip: ${sessionId} for user ${userId}`);
        throw new ApiError(404, "Active session not found");
      }

      const answerIndex = session.answers.findIndex(
        (answer) => answer.questionId.toString() === questionId
      );

      if (answerIndex === -1) {
        logger.warn(`Question not found in session for skip: ${questionId} in session ${sessionId}`);
        throw new ApiError(404, "Question not found in session");
      }

      session.answers[answerIndex].skipped = true;
      session.answers[answerIndex].selectedAnswer = null;
      session.answers[answerIndex].answeredAt = new Date();
      session.lastActive = new Date();

      await session.save();

      logger.info(`Question skipped: ${questionId} in session ${sessionId} by user ${userId}`);
      return new ApiResponse(
        200,
        {
          skipped: true,
          progress: session.progress,
        },
        "Question skipped successfully"
      );
    } catch (error) {
      logger.error(`Error skipping question ${questionId} in session ${sessionId} by user ${userId}:`, error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Failed to skip question", error.message);
    }
  }

  // Navigate to a specific question
  async navigateToQuestion(sessionId, userId, questionIndex) {
    try {
      const session = await QuizSession.findOne({
        sessionId,
        userId,
        status: { $in: ["in_progress", "paused"] },
      });

      if (!session) {
        logger.warn(`Session not found for navigation: ${sessionId} for user ${userId}`);
        throw new ApiError(404, "Session not found");
      }

      if (questionIndex < 0 || questionIndex >= session.answers.length) {
        logger.warn(`Invalid question index ${questionIndex} for session ${sessionId}`);
        throw new ApiError(400, "Invalid question index");
      }

      session.currentQuestionIndex = questionIndex;
      session.lastActive = new Date();
      await session.save();

      logger.info(`Navigated to question ${questionIndex} in session ${sessionId} by user ${userId}`);
      return new ApiResponse(
        200,
        {
          currentQuestionIndex: questionIndex,
          question: session.answers[questionIndex],
        },
        "Navigation successful"
      );
    } catch (error) {
      logger.error(`Error navigating to question ${questionIndex} in session ${sessionId} by user ${userId}:`, error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Failed to navigate to question", error.message);
    }
  }

  // Pause session
  async pauseSession(sessionId, userId) {
    try {
      const session = await QuizSession.findOne({
        sessionId,
        userId,
        status: "in_progress",
      });

      if (!session) {
        logger.warn(`Active session not found for pause: ${sessionId} for user ${userId}`);
        throw new ApiError(404, "Active session not found");
      }

      session.status = "paused";
      session.lastActive = new Date();
      await session.save();

      logger.info(`Session paused: ${sessionId} by user ${userId}`);
      return new ApiResponse(200, session, "Session paused successfully");
    } catch (error) {
      logger.error(`Error pausing session ${sessionId} by user ${userId}:`, error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Failed to pause session", error.message);
    }
  }

  // Resume session
  async resumeSession(sessionId, userId) {
    try {
      const session = await QuizSession.findOne({
        sessionId,
        userId,
        status: "paused",
      });

      if (!session) {
        logger.warn(`Paused session not found for resume: ${sessionId} for user ${userId}`);
        throw new ApiError(404, "Paused session not found");
      }

      // Check if session is expired
      if (session.isExpired) {
        session.status = "expired";
        await session.save();
        logger.warn(`Session expired during resume attempt: ${sessionId} for user ${userId}`);
        throw new ApiError(400, "Session has expired");
      }

      session.status = "in_progress";
      session.lastActive = new Date();
      await session.save();

      logger.info(`Session resumed: ${sessionId} by user ${userId}`);
      return new ApiResponse(200, session, "Session resumed successfully");
    } catch (error) {
      logger.error(`Error resuming session ${sessionId} by user ${userId}:`, error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Failed to resume session", error.message);
    }
  }

  // Complete session
  async completeSession(sessionId, userId) {
    try {
      const session = await QuizSession.findOne({
        sessionId,
        userId,
        status: { $in: ["in_progress", "paused"] },
      }).populate("quizId");

      if (!session) {
        logger.warn(`Active session not found for completion: ${sessionId} for user ${userId}`);
        throw new ApiError(404, "Active session not found");
      }

      // Calculate final score
      const score = session.answers.reduce((total, answer) => {
        if (answer.isCorrect) {
          const question = session.quizId.questionIds.find(
            (q) => q._id.toString() === answer.questionId.toString()
          );
          return total + (question?.points || 0);
        }
        return total;
      }, 0);

      session.status = "completed";
      session.endTime = new Date();
      session.score = score;
      session.timeTaken = Math.floor(
        (session.endTime - session.startTime) / 1000
      );

      await session.save();

      logger.info(`Session completed: ${sessionId} by user ${userId} with score ${score}`);
      return new ApiResponse(
        200,
        {
          session,
          score,
          timeTaken: session.timeTaken,
        },
        "Session completed successfully"
      );
    } catch (error) {
      logger.error(`Error completing session ${sessionId} by user ${userId}:`, error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Failed to complete session", error.message);
    }
  }

  // Get user's active sessions
  async getUserActiveSessions(userId) {
    try {
      const sessions = await QuizSession.find({
        userId,
        status: { $in: ["in_progress", "paused"] },
      }).populate("quizId", "title timeLimit totalQuestions");

      logger.info(`Retrieved ${sessions.length} active sessions for user ${userId}`);
      return new ApiResponse(
        200,
        sessions,
        "Active sessions retrieved successfully"
      );
    } catch (error) {
      logger.error(`Error retrieving active sessions for user ${userId}:`, error);
      throw new ApiError(500, "Failed to retrieve active sessions", error.message);
    }
  }

  // Get user's session history
  async getUserSessionHistory(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "endTime",
        sortOrder = "desc",
        status,
      } = options;

      const query = { userId, status: "completed" };
      if (status) query.status = status;

      const skip = (page - 1) * limit;
      const sortOptions = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

      const [sessions, total] = await Promise.all([
        QuizSession.find(query)
          .populate("quizId", "title timeLimit totalQuestions")
          .sort(sortOptions)
          .skip(skip)
          .limit(parseInt(limit)),
        QuizSession.countDocuments(query),
      ]);

      const pagination = {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      };

      logger.info(`Retrieved ${sessions.length} session history entries for user ${userId}`);
      return new ApiResponse(
        200,
        { sessions, pagination },
        "Session history retrieved successfully"
      );
    } catch (error) {
      logger.error(`Error retrieving session history for user ${userId}:`, error);
      throw new ApiError(500, "Failed to retrieve session history", error.message);
    }
  }

  // Sync session data
  async syncSession(sessionId, userId, syncData) {
    try {
      const session = await QuizSession.findOne({
        sessionId,
        userId,
        status: { $in: ["in_progress", "paused"] },
      });

      if (!session) {
        logger.warn(`Active session not found for sync: ${sessionId} for user ${userId}`);
        throw new ApiError(404, "Active session not found");
      }

      // Update session data
      if (syncData.answers) {
        session.answers = syncData.answers;
      }
      if (syncData.currentQuestionIndex !== undefined) {
        session.currentQuestionIndex = syncData.currentQuestionIndex;
      }
      if (syncData.timeRemaining !== undefined) {
        session.timeRemaining = syncData.timeRemaining;
      }
      if (syncData.deviceInfo) {
        session.deviceInfo = {
          ...session.deviceInfo,
          ...syncData.deviceInfo,
          lastSync: new Date(),
        };
      }

      session.lastActive = new Date();
      await session.save();

      logger.info(`Session synced: ${sessionId} by user ${userId}`);
      return new ApiResponse(200, session, "Session synced successfully");
    } catch (error) {
      logger.error(`Error syncing session ${sessionId} by user ${userId}:`, error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Failed to sync session", error.message);
    }
  }

  // Helper method to check answer
  checkAnswer(question, selectedAnswer) {
    try {
      if (!question || !selectedAnswer) return false;

      switch (question.format) {
        case "multiple_choice":
          return selectedAnswer === question.correctAnswer;
        case "true_false":
          return selectedAnswer === question.correctAnswer;
        case "matching":
          return JSON.stringify(selectedAnswer) === JSON.stringify(question.correctAnswer);
        default:
          return false;
      }
    } catch (error) {
      logger.error(`Error checking answer for question ${question._id}:`, error);
      return false;
    }
  }

  // Cleanup expired sessions
  async cleanupExpiredSessions() {
    try {
      const result = await QuizSession.updateMany(
        {
          status: { $in: ["in_progress", "paused"] },
          lastActive: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
        { status: "expired" }
      );

      logger.info(`Cleaned up ${result.modifiedCount} expired sessions`);
      return new ApiResponse(
        200,
        { modifiedCount: result.modifiedCount },
        "Expired sessions cleaned up successfully"
      );
    } catch (error) {
      logger.error("Error cleaning up expired sessions:", error);
      throw new ApiError(500, "Failed to cleanup expired sessions", error.message);
    }
  }

  // Delete old sessions
  async deleteOldSessions(daysOld = 30) {
    try {
      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
      const result = await QuizSession.deleteMany({
        status: { $in: ["completed", "expired"] },
        endTime: { $lt: cutoffDate },
      });

      logger.info(`Deleted ${result.deletedCount} old sessions older than ${daysOld} days`);
      return new ApiResponse(
        200,
        { deletedCount: result.deletedCount },
        "Old sessions deleted successfully"
      );
    } catch (error) {
      logger.error(`Error deleting old sessions older than ${daysOld} days:`, error);
      throw new ApiError(500, "Failed to delete old sessions", error.message);
    }
  }
}

module.exports = new QuizSessionService();