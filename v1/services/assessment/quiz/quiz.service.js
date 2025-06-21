const { Quiz } = require("../../../models/assessment/quiz.model");
const NotFoundError = require("../../../errors/notFoundError");
const BadRequestError = require("../../../errors/badRequestError");
const createLogger = require("../../logging.service");

const logger = createLogger("QuizService");

// =============== CREATE QUIZ ===============
const createQuiz = async (quizData) => {
  logger.info("===================createQuiz=======================");

  // Validate questionIds and totalQuestions match
      if (quizData.questionIds && quizData.totalQuestions) {
        if (quizData.questionIds.length !== quizData.totalQuestions) {
          quizData.totalQuestions = quizData.questionIds.length;
        }
  } else if (quizData.questionIds) {
    quizData.totalQuestions = quizData.questionIds.length;
      }

      const quiz = new Quiz(quizData);
      await quiz.save();

  // Populate related fields
      await quiz.populate([
        { path: "subjectId", select: "name code" },
        { path: "topicIds", select: "name" },
    { path: "questionIds", select: "question type difficulty" },
      ]);

  logger.info("++++++✅ CREATE QUIZ: Quiz created successfully ++++++");
  return quiz;
};

// =============== GET ALL QUIZZES ===============
const getQuizzes = async (query) => {
  logger.info("===================getQuizzes=======================");

      const {
        page = 1,
        limit = 10,
    subjectId,
    topicId,
    format,
    difficulty,
    educationLevel,
    examType,
    isActive,
    isPremium,
    status,
    search,
        sortBy = "createdAt",
        sortOrder = "desc",
  } = query;

  // Build filter object
  const filter = {};

  if (subjectId) filter.subjectId = subjectId;
  if (topicId) filter.topicIds = { $in: [topicId] };
  if (format) filter.format = format;
  if (difficulty) filter.difficulty = difficulty;
  if (educationLevel) filter.educationLevel = educationLevel;
  if (examType) filter.examType = examType;
  if (isActive !== undefined) filter.isActive = isActive === "true";
  if (isPremium !== undefined) filter.isPremium = isPremium === "true";
  if (status) filter.status = status;

  // Add search functionality
      if (search) {
    filter.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === "desc" ? -1 : 1;

  // Calculate pagination
      const skip = (page - 1) * limit;

  // Execute query with pagination
      const [quizzes, total] = await Promise.all([
    Quiz.find(filter)
          .populate("subjectId", "name code")
          .populate("topicIds", "name")
      .sort(sort)
          .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Quiz.countDocuments(filter),
      ]);

      const pagination = {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
    totalCount: total,
    hasNextPage: page < Math.ceil(total / limit),
    hasPrevPage: page > 1,
      };

  logger.info("++++++✅ GET QUIZZES: Quizzes retrieved successfully ++++++");
  return { quizzes, pagination };
};

// =============== GET QUIZ BY ID ===============
const getQuizById = async (quizId) => {
  logger.info("===================getQuizById=======================");

  const quiz = await Quiz.findById(quizId)
    .populate("subjectId", "name code")
    .populate("topicIds", "name")
    .populate("questionIds", "question type difficulty");

      if (!quiz) {
    throw new NotFoundError("Quiz non trouvé");
      }

  logger.info("++++++✅ GET QUIZ BY ID: Quiz retrieved successfully ++++++");
  return quiz;
};

// =============== UPDATE QUIZ ===============
const updateQuiz = async (quizId, updateData) => {
  logger.info("===================updateQuiz=======================");

  // Check if quiz exists
  const existingQuiz = await Quiz.findById(quizId);
  if (!existingQuiz) {
    throw new NotFoundError("Quiz non trouvé");
  }

  // Update quiz
  async updateQuiz(quizId, updateData) {
    try {
      // Validate question count if updating questionIds
      if (updateData.questionIds && updateData.totalQuestions) {
        if (updateData.questionIds.length !== updateData.totalQuestions) {
          updateData.totalQuestions = updateData.questionIds.length;
        }
      }

      const quiz = await Quiz.findByIdAndUpdate(
        quizId,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).populate([
        { path: "subjectId", select: "name code" },
        { path: "topicIds", select: "name" },
        { path: "createdBy", select: "name email" },
      ]);

      if (!quiz) {
        logger.warn(`Quiz not found for update: ${quizId}`);
        throw new ApiError(404, "Quiz not found");
      }

      logger.info(`Quiz updated successfully: ${quizId}`);
      return new ApiResponse(200, quiz, "Quiz updated successfully");
    } catch (error) {
      logger.error(`Error updating quiz ${quizId}:`, error);
      if (error instanceof ApiError) throw error;
      if (error.name === "ValidationError") {
        throw new ApiError(
          400,
          "Validation failed",
          Object.values(error.errors).map((e) => e.message)
        );
      }
      throw new ApiError(500, "Failed to update quiz", error.message);
    }
  }

  // Delete quiz
  async deleteQuiz(quizId) {
    try {
      const quiz = await Quiz.findById(quizId);

      if (!quiz) {
        logger.warn(`Quiz not found for deletion: ${quizId}`);
        throw new ApiError(404, "Quiz not found");
      }

      // Check if quiz has results
      const hasResults = await QuizResult.exists({ quizId });
      if (hasResults) {
        // Soft delete by setting isActive to false
        quiz.isActive = false;
        await quiz.save();
        logger.info(`Quiz deactivated (has results): ${quizId}`);
        return new ApiResponse(
          200,
          null,
          "Quiz deactivated successfully (has existing results)"
        );
      }

      // Hard delete if no results
      await Quiz.findByIdAndDelete(quizId);
      logger.info(`Quiz deleted successfully: ${quizId}`);
      return new ApiResponse(200, null, "Quiz deleted successfully");
    } catch (error) {
      logger.error(`Error deleting quiz ${quizId}:`, error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Failed to delete quiz", error.message);
    }
  }

  // Get quizzes by subject
  async getQuizzesBySubject(subjectId, options = {}) {
    try {
      const filters = { subjectId, isActive: true };
      return await this.getAllQuizzes(filters, options);
    } catch (error) {
      throw new ApiError(
        500,
        "Failed to retrieve quizzes by subject",
        error.message
      );
    }
  }

  // Get popular quizzes
  async getPopularQuizzes(limit = 10) {
    try {
      const quizzes = await Quiz.getPopularQuizzes(limit);
      return new ApiResponse(
        200,
        quizzes,
        "Popular quizzes retrieved successfully"
      );
    } catch (error) {
      throw new ApiError(
        500,
        "Failed to retrieve popular quizzes",
        error.message
      );
    }
  }

  // Check if user can take quiz
  async canUserTakeQuiz(quizId, userId) {
    try {
      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
        throw new ApiError(404, "Quiz not found");
      }

      // Count user attempts
      const userAttempts = await QuizResult.countDocuments({ quizId, userId });

      if (!quiz.canUserRetake(userAttempts)) {
        const lastAttempt = await QuizResult.findOne({ quizId, userId })
          .sort({ createdAt: -1 })
          .select("createdAt");

        const nextRetakeTime = quiz.getNextRetakeTime(lastAttempt.createdAt);

        return new ApiResponse(200, {
          canTake: false,
          reason: "Maximum attempts reached",
          attemptsUsed: userAttempts,
          maxAttempts: quiz.retakePolicy.maxAttempts,
          nextRetakeTime: nextRetakeTime > new Date() ? nextRetakeTime : null,
        });
      }

      return new ApiResponse(200, {
        canTake: true,
        attemptsUsed: userAttempts,
        maxAttempts: quiz.retakePolicy.maxAttempts,
      });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        500,
        "Failed to check quiz eligibility",
        error.message
      );
    }
  }

  // Update quiz analytics
  async updateQuizAnalytics(quizId) {
    try {
      const results = await QuizResult.find({ quizId });

      if (results.length === 0) return;

      const totalAttempts = results.length;
      const totalScore = results.reduce((sum, result) => sum + result.score, 0);
      const totalTime = results.reduce(
        (sum, result) => sum + result.timeTaken,
        0
      );
      const completedResults = results.filter((result) => result.score > 0);

      const analytics = {
        totalAttempts,
        averageScore: Math.round(totalScore / totalAttempts),
        averageTime: Math.round(totalTime / totalAttempts),
        completionRate: Math.round(
          (completedResults.length / totalAttempts) * 100
        ),
      };

      await Quiz.findByIdAndUpdate(quizId, { analytics });

      return new ApiResponse(
        200,
        analytics,
        "Quiz analytics updated successfully"
      );
    } catch (error) {
      throw new ApiError(500, "Failed to update quiz analytics", error.message);
    }
  }

  // Bulk operations
  async bulkUpdateQuizzes(quizIds, updateData) {
    try {
      const result = await Quiz.updateMany(
        { _id: { $in: quizIds } },
        { ...updateData, updatedAt: new Date() }
      );

      return new ApiResponse(
        200,
        {
          matchedCount: result.matchedCount,
          modifiedCount: result.modifiedCount,
        },
        "Bulk update completed successfully"
      );
    } catch (error) {
      throw new ApiError(500, "Failed to bulk update quizzes", error.message);
    }
  }

  // Get quiz statistics
  async getQuizStatistics(quizId) {
    try {
      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
        throw new ApiError(404, "Quiz not found");
      }

      const results = await QuizResult.find({ quizId });

      const stats = {
        totalAttempts: results.length,
        averageScore:
          results.length > 0
            ? Math.round(
                results.reduce((sum, r) => sum + r.score, 0) / results.length
              )
            : 0,
        averageTime:
          results.length > 0
            ? Math.round(
                results.reduce((sum, r) => sum + r.timeTaken, 0) /
                  results.length
              )
            : 0,
        highestScore:
          results.length > 0 ? Math.max(...results.map((r) => r.score)) : 0,
        lowestScore:
          results.length > 0 ? Math.min(...results.map((r) => r.score)) : 0,
        passRate:
          results.length > 0
            ? Math.round(
                (results.filter((r) => r.score >= quiz.totalPoints * 0.6)
                  .length /
                  results.length) *
                  100
              )
            : 0,
        scoreDistribution: this.calculateScoreDistribution(
          results,
          quiz.totalPoints
        ),
      };

      return new ApiResponse(
        200,
        stats,
        "Quiz statistics retrieved successfully"
      );
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        500,
        "Failed to retrieve quiz statistics",
        error.message
      );
    }
  }

  // Helper method to calculate score distribution
  calculateScoreDistribution(results, totalPoints) {
    const ranges = [
      { label: "0-20%", min: 0, max: totalPoints * 0.2 },
      { label: "21-40%", min: totalPoints * 0.2, max: totalPoints * 0.4 },
      { label: "41-60%", min: totalPoints * 0.4, max: totalPoints * 0.6 },
      { label: "61-80%", min: totalPoints * 0.6, max: totalPoints * 0.8 },
      { label: "81-100%", min: totalPoints * 0.8, max: totalPoints },
    ];

    return ranges.map((range) => ({
      label: range.label,
      count: results.filter((r) => r.score > range.min && r.score <= range.max)
        .length,
    }));
  }
}

module.exports = new QuizService();
