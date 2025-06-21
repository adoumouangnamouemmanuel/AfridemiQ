const { QuizResult } = require("../../../models/assessment/quiz.result.model");
const { Quiz } = require("../../../models/assessment/quiz.model");
const NotFoundError = require("../../../errors/notFoundError");
const BadRequestError = require("../../../errors/badRequestError");
const createLogger = require("../../logging.service");

const logger = createLogger("QuizResultService");

class QuizResultService {
  async createQuizResult(data) {
    try {
      const quizResult = new QuizResult(data);
      await quizResult.save();
      logger.info(`Created quiz result for user: ${data.userId}`);
      return await this.getQuizResultById(quizResult._id);
    } catch (error) {
      logger.error("Error creating quiz result:", error);
      throw error instanceof ApiError
        ? error
        : new ApiError(500, "Failed to create quiz result");
    }
  }

  async getQuizResultById(id) {
    try {
      const quizResult = await QuizResult.findById(id)
        .populate("userId", "name email")
        .populate("quizId", "name")
        .populate("questionIds", "question")
        .populate("hintUsages", "hintType stepsViewed usedAt")
        .populate("questionFeedback.userId", "name");
      if (!quizResult) throw new ApiError(404, "Quiz result not found");
      logger.info(`Retrieved quiz result: ${id}`);
      return quizResult;
    } catch (error) {
      logger.error("Error retrieving quiz result:", error);
      throw error instanceof ApiError
        ? error
        : new ApiError(500, "Failed to retrieve quiz result");
    }
  }

  async getQuizResults(filters = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = options;
      const query = {};
      if (filters.userId) query.userId = filters.userId;
      if (filters.quizId) query.quizId = filters.quizId;

      const skip = (page - 1) * limit;
      const sortOptions = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

      const [quizResults, total] = await Promise.all([
        QuizResult.find(query)
          .populate("userId", "name email")
          .populate("quizId", "name")
          .sort(sortOptions)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        QuizResult.countDocuments(query),
      ]);

      logger.info(`Retrieved ${quizResults.length} quiz results`);
      return {
        quizResults,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit),
        },
      };
    } catch (error) {
      logger.error("Error retrieving quiz results:", error);
      throw new ApiError(500, "Failed to retrieve quiz results");
    }
  }

  async updateQuizResult(id, data) {
    try {
      const quizResult = await QuizResult.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
      )
        .populate("userId", "name email")
        .populate("quizId", "name")
        .populate("questionIds", "question")
        .populate("hintUsages", "hintType stepsViewed usedAt")
        .populate("questionFeedback.userId", "name");
      if (!quizResult) throw new ApiError(404, "Quiz result not found");
      logger.info(`Updated quiz result: ${id}`);
      return quizResult;
    } catch (error) {
      logger.error("Error updating quiz result:", error);
      throw error instanceof ApiError
        ? error
        : new ApiError(500, "Failed to update quiz result");
    }
  }

  async deleteQuizResult(id) {
    try {
      const quizResult = await QuizResult.findByIdAndDelete(id);
      if (!quizResult) throw new ApiError(404, "Quiz result not found");
      logger.info(`Deleted quiz result: ${id}`);
      return { message: "Quiz result deleted successfully" };
    } catch (error) {
      logger.error("Error deleting quiz result:", error);
      throw error instanceof ApiError
        ? error
        : new ApiError(500, "Failed to delete quiz result");
    }
  }
}

module.exports = new QuizResultService();
