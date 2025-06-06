const { HintUsage } = require("../../models/results/hint.model");
const { Question } = require("../../models/assessment/question.model");
const { ApiError } = require("../../utils/ApiError");
const { ApiResponse } = require("../../utils/ApiResponse");
const createLogger = require("../logging.service");

const logger = createLogger("HintUsageService");

class HintUsageService {
  // Record hint usage
  async recordHintUsage(hintData) {
    try {
      // Validate question exists
      const question = await Question.findById(hintData.questionId);
      if (!question) {
        logger.warn(`Question not found for hint usage: ${hintData.questionId}`);
        throw new ApiError(404, "Question not found");
      }

      // Check if hint usage already exists for this session/question
      let hintUsage = await HintUsage.findOne({
        userId: hintData.userId,
        questionId: hintData.questionId,
        sessionId: hintData.sessionId,
      });

      if (hintUsage) {
        // Update existing hint usage
        if (hintData.stepNumber !== undefined) {
          hintUsage.addViewedStep(hintData.stepNumber);
        }
        if (hintData.timeSpentOnHint) {
          hintUsage.timeSpentOnHint += hintData.timeSpentOnHint;
        }
        if (hintData.pointsDeducted) {
          hintUsage.pointsDeducted += hintData.pointsDeducted;
        }
        logger.info(`Updated existing hint usage for user ${hintData.userId} and question ${hintData.questionId}`);
      } else {
        // Create new hint usage record
        hintUsage = new HintUsage({
          ...hintData,
          totalStepsAvailable: question.steps ? question.steps.length : 1,
          stepsViewed:
            hintData.stepNumber !== undefined ? [hintData.stepNumber] : [],
          context: {
            ...hintData.context,
            difficulty: question.difficulty,
          },
        });
        logger.info(`Created new hint usage for user ${hintData.userId} and question ${hintData.questionId}`);
      }

      await hintUsage.save();

      await hintUsage.populate([
        { path: "questionId", select: "question difficulty points" },
        { path: "userId", select: "name email" },
        { path: "quizId", select: "title" },
      ]);

      return new ApiResponse(
        201,
        hintUsage,
        "Hint usage recorded successfully"
      );
    } catch (error) {
      logger.error(`Error recording hint usage for user ${hintData.userId} and question ${hintData.questionId}:`, error);
      if (error instanceof ApiError) throw error;
      if (error.name === "ValidationError") {
        throw new ApiError(
          400,
          "Validation failed",
          Object.values(error.errors).map((e) => e.message)
        );
      }
      throw new ApiError(500, "Failed to record hint usage", error.message);
    }
  }

  // Get hint usage by ID
  async getHintUsageById(hintUsageId) {
    try {
      const hintUsage = await HintUsage.findById(hintUsageId).populate([
        { path: "questionId", select: "question difficulty points steps" },
        { path: "userId", select: "name email" },
        { path: "quizId", select: "title" },
      ]);

      if (!hintUsage) {
        logger.warn(`Hint usage not found: ${hintUsageId}`);
        throw new ApiError(404, "Hint usage record not found");
      }

      logger.info(`Retrieved hint usage: ${hintUsageId}`);
      return new ApiResponse(
        200,
        hintUsage,
        "Hint usage retrieved successfully"
      );
    } catch (error) {
      logger.error(`Error retrieving hint usage ${hintUsageId}:`, error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Failed to retrieve hint usage", error.message);
    }
  }

  // Get user's hint usage history
  async getUserHintUsage(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        questionId,
        quizId,
        startDate,
        endDate,
        hintType,
      } = options;

      const query = { userId };

      if (questionId) query.questionId = questionId;
      if (quizId) query.quizId = quizId;
      if (hintType) query.hintType = hintType;

      if (startDate || endDate) {
        query.usedAt = {};
        if (startDate) query.usedAt.$gte = new Date(startDate);
        if (endDate) query.usedAt.$lte = new Date(endDate);
      }

      const skip = (page - 1) * limit;

      const [hintUsages, total] = await Promise.all([
        HintUsage.find(query)
          .populate([
            { path: "questionId", select: "question difficulty points" },
            { path: "quizId", select: "title" },
          ])
          .sort({ usedAt: -1 })
          .skip(skip)
          .limit(Number.parseInt(limit)),
        HintUsage.countDocuments(query),
      ]);

      const pagination = {
        currentPage: Number.parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: Number.parseInt(limit),
      };

      logger.info(`Retrieved ${hintUsages.length} hint usages for user ${userId}`);
      return new ApiResponse(
        200,
        { hintUsages, pagination },
        "Hint usage history retrieved successfully"
      );
    } catch (error) {
      logger.error(`Error retrieving hint usage history for user ${userId}:`, error);
      throw new ApiError(
        500,
        "Failed to retrieve hint usage history",
        error.message
      );
    }
  }

  // Get question hint statistics
  async getQuestionHintStats(questionId) {
    try {
      const question = await Question.findById(questionId);
      if (!question) {
        logger.warn(`Question not found for hint stats: ${questionId}`);
        throw new ApiError(404, "Question not found");
      }

      const stats = await HintUsage.getQuestionHintStats(questionId);

      const result =
        stats.length > 0
          ? stats[0]
          : {
              totalUsages: 0,
              uniqueUsers: 0,
              averageStepsViewed: 0,
              averageTimeSpent: 0,
              totalPointsDeducted: 0,
            };

      // Additional statistics
      const hintUsages = await HintUsage.find({ questionId });

      const hintTypeDistribution = hintUsages.reduce((acc, usage) => {
        acc[usage.hintType] = (acc[usage.hintType] || 0) + 1;
        return acc;
      }, {});

      const stepUsageDistribution = {};
      hintUsages.forEach((usage) => {
        usage.stepsViewed.forEach((step) => {
          stepUsageDistribution[step] = (stepUsageDistribution[step] || 0) + 1;
        });
      });

      logger.info(`Retrieved hint statistics for question ${questionId}`);
      return new ApiResponse(
        200,
        {
          ...result,
          hintTypeDistribution,
          stepUsageDistribution,
          question: {
            id: question._id,
            question: question.question,
            difficulty: question.difficulty,
            totalSteps: question.steps ? question.steps.length : 0,
          },
        },
        "Question hint statistics retrieved successfully"
      );
    } catch (error) {
      logger.error(`Error retrieving hint statistics for question ${questionId}:`, error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        500,
        "Failed to retrieve question hint statistics",
        error.message
      );
    }
  }

  // Get user hint usage analytics
  async getUserHintAnalytics(userId) {
    try {
      const hintUsages = await HintUsage.find({ userId }).populate(
        "questionId",
        "difficulty"
      );

      if (hintUsages.length === 0) {
        logger.info(`No hint usage found for user ${userId}`);
        return new ApiResponse(
          200,
          {
            totalHintsUsed: 0,
            averageStepsPerHint: 0,
            totalTimeSpent: 0,
            totalPointsDeducted: 0,
            hintsByDifficulty: {},
            hintsByType: {},
            hintTrends: [],
          },
          "No hint usage found for user"
        );
      }

      const analytics = {
        totalHintsUsed: hintUsages.length,
        averageStepsPerHint:
          Math.round(
            (hintUsages.reduce(
              (sum, usage) => sum + usage.stepsViewed.length,
              0
            ) /
              hintUsages.length) *
              100
          ) / 100,
        totalTimeSpent: hintUsages.reduce(
          (sum, usage) => sum + usage.timeSpentOnHint,
          0
        ),
        totalPointsDeducted: hintUsages.reduce(
          (sum, usage) => sum + usage.pointsDeducted,
          0
        ),

        hintsByDifficulty: hintUsages.reduce((acc, usage) => {
          const difficulty = usage.questionId?.difficulty || "Unknown";
          acc[difficulty] = (acc[difficulty] || 0) + 1;
          return acc;
        }, {}),

        hintsByType: hintUsages.reduce((acc, usage) => {
          acc[usage.hintType] = (acc[usage.hintType] || 0) + 1;
          return acc;
        }, {}),

        // Monthly trend for last 6 months
        hintTrends: this.calculateHintTrends(hintUsages, 6),
      };

      logger.info(`Retrieved hint analytics for user ${userId}`);
      return new ApiResponse(
        200,
        analytics,
        "User hint analytics retrieved successfully"
      );
    } catch (error) {
      logger.error(`Error retrieving hint analytics for user ${userId}:`, error);
      throw new ApiError(
        500,
        "Failed to retrieve user hint analytics",
        error.message
      );
    }
  }

  // Get questions needing better hints
  async getQuestionsNeedingBetterHints() {
    try {
      const questions = await HintUsage.findQuestionsNeedingBetterHints();

      // Populate question details
      const populatedQuestions = await Question.populate(questions, {
        path: "_id",
        select: "question difficulty points steps",
      });

      logger.info(`Found ${populatedQuestions.length} questions needing better hints`);
      return new ApiResponse(
        200,
        populatedQuestions,
        "Questions needing better hints retrieved successfully"
      );
    } catch (error) {
      logger.error("Error retrieving questions needing better hints:", error);
      throw new ApiError(
        500,
        "Failed to retrieve questions needing better hints",
        error.message
      );
    }
  }

  // Update hint usage
  async updateHintUsage(hintUsageId, updateData) {
    try {
      const hintUsage = await HintUsage.findByIdAndUpdate(
        hintUsageId,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      ).populate([
        { path: "questionId", select: "question difficulty points" },
        { path: "userId", select: "name email" },
        { path: "quizId", select: "title" },
      ]);

      if (!hintUsage) {
        logger.warn(`Hint usage not found for update: ${hintUsageId}`);
        throw new ApiError(404, "Hint usage record not found");
      }

      logger.info(`Updated hint usage: ${hintUsageId}`);
      return new ApiResponse(200, hintUsage, "Hint usage updated successfully");
    } catch (error) {
      logger.error(`Error updating hint usage ${hintUsageId}:`, error);
      if (error instanceof ApiError) throw error;
      if (error.name === "ValidationError") {
        throw new ApiError(
          400,
          "Validation failed",
          Object.values(error.errors).map((e) => e.message)
        );
      }
      throw new ApiError(500, "Failed to update hint usage", error.message);
    }
  }

  // Delete hint usage record
  async deleteHintUsage(hintUsageId) {
    try {
      const hintUsage = await HintUsage.findByIdAndDelete(hintUsageId);

      if (!hintUsage) {
        logger.warn(`Hint usage not found for deletion: ${hintUsageId}`);
        throw new ApiError(404, "Hint usage record not found");
      }

      logger.info(`Deleted hint usage: ${hintUsageId}`);
      return new ApiResponse(
        200,
        null,
        "Hint usage record deleted successfully"
      );
    } catch (error) {
      logger.error(`Error deleting hint usage ${hintUsageId}:`, error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        500,
        "Failed to delete hint usage record",
        error.message
      );
    }
  }

  // Get hint usage summary for admin
  async getHintUsageSummary(options = {}) {
    try {
      const {
        startDate,
        endDate,
        groupBy = "day", // day, week, month
      } = options;

      const matchStage = {};
      if (startDate || endDate) {
        matchStage.usedAt = {};
        if (startDate) matchStage.usedAt.$gte = new Date(startDate);
        if (endDate) matchStage.usedAt.$lte = new Date(endDate);
      }

      const groupFormat = {
        day: { $dateToString: { format: "%Y-%m-%d", date: "$usedAt" } },
        week: { $dateToString: { format: "%Y-W%U", date: "$usedAt" } },
        month: { $dateToString: { format: "%Y-%m", date: "$usedAt" } },
      };

      const summary = await HintUsage.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: groupFormat[groupBy],
            totalHints: { $sum: 1 },
            uniqueUsers: { $addToSet: "$userId" },
            uniqueQuestions: { $addToSet: "$questionId" },
            totalTimeSpent: { $sum: "$timeSpentOnHint" },
            totalPointsDeducted: { $sum: "$pointsDeducted" },
            averageStepsViewed: { $avg: { $size: "$stepsViewed" } },
          },
        },
        {
          $project: {
            _id: 1,
            totalHints: 1,
            uniqueUsers: { $size: "$uniqueUsers" },
            uniqueQuestions: { $size: "$uniqueQuestions" },
            totalTimeSpent: 1,
            totalPointsDeducted: 1,
            averageStepsViewed: { $round: ["$averageStepsViewed", 2] },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      logger.info(`Retrieved hint usage summary with ${summary.length} records`);
      return new ApiResponse(
        200,
        summary,
        "Hint usage summary retrieved successfully"
      );
    } catch (error) {
      logger.error("Error retrieving hint usage summary:", error);
      throw new ApiError(
        500,
        "Failed to retrieve hint usage summary",
        error.message
      );
    }
  }

  // Helper method to calculate hint trends
  calculateHintTrends(hintUsages, months = 6) {
    const trends = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const monthUsages = hintUsages.filter(
        (usage) => usage.usedAt >= date && usage.usedAt < nextDate
      );

      trends.push({
        month: date.toISOString().substring(0, 7), // YYYY-MM format
        count: monthUsages.length,
        totalTimeSpent: monthUsages.reduce(
          (sum, usage) => sum + usage.timeSpentOnHint,
          0
        ),
        averageStepsViewed:
          monthUsages.length > 0
            ? Math.round(
                (monthUsages.reduce(
                  (sum, usage) => sum + usage.stepsViewed.length,
                  0
                ) /
                  monthUsages.length) *
                  100
              ) / 100
            : 0,
      });
    }

    return trends;
  }

  // Bulk operations
  async bulkDeleteHintUsages(hintUsageIds) {
    try {
      const result = await HintUsage.deleteMany({
        _id: { $in: hintUsageIds },
      });

      logger.info(`Bulk deleted ${result.deletedCount} hint usages`);
      return new ApiResponse(
        200,
        {
          deletedCount: result.deletedCount,
        },
        "Bulk delete completed successfully"
      );
    } catch (error) {
      logger.error("Error bulk deleting hint usages:", error);
      throw new ApiError(
        500,
        "Failed to bulk delete hint usages",
        error.message
      );
    }
  }
}

module.exports = new HintUsageService();