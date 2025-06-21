const { Question } = require("../../../models/assessment/question.model");
const NotFoundError = require("../../../errors/notFoundError");
const BadRequestError = require("../../../errors/badRequestError");
const createLogger = require("../../logging.service");

const logger = createLogger("QuestionService");

class QuestionService {
  async createQuestion(data) {
    try {
      const question = new Question(data);
      await question.save();
      logger.info(`Created question: ${question._id}`);
      return question;
    } catch (error) {
      logger.error("Error creating question:", error);
      throw error instanceof ApiError
        ? error
        : new ApiError(500, "Failed to create question");
    }
  }

  async getQuestionById(id) {
    try {
      const question = await Question.findById(id)
        .populate("topicId", "name")
        .populate("subjectId", "name code")
        .populate("creatorId", "name")
        .populate("validation.verifiedBy", "name")
        .populate("relatedQuestions", "question");
      if (!question) throw new ApiError(404, "Question not found");
      logger.info(`Retrieved question: ${id}`);
      return question;
    } catch (error) {
      logger.error("Error retrieving question:", error);
      throw error instanceof ApiError
        ? error
        : new ApiError(500, "Failed to retrieve question");
    }
  }

  async getQuestions(filters = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = options;
      const query = {};
      if (filters.topicId) query.topicId = filters.topicId;
      if (filters.subjectId) query.subjectId = filters.subjectId;
      if (filters.creatorId) query.creatorId = filters.creatorId;
      if (filters.series) query.series = filters.series;
      if (filters.level) query.level = filters.level;
      if (filters.format) query.format = filters.format;
      if (filters.difficulty) query.difficulty = filters.difficulty;
      if (filters.status) query.status = filters.status;
      if (filters.premiumOnly !== undefined)
        query.premiumOnly = filters.premiumOnly;
      if (filters.isActive !== undefined) query.isActive = filters.isActive;

      const skip = (page - 1) * limit;
      const sortOptions = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

      const [questions, total] = await Promise.all([
        Question.find(query)
          .populate("topicId", "name")
          .populate("subjectId", "name code")
          .populate("creatorId", "name")
          .sort(sortOptions)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Question.countDocuments(query),
      ]);

      logger.info(`Retrieved ${questions.length} questions`);
      return {
        questions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit),
        },
      };
    } catch (error) {
      logger.error("Error retrieving questions:", error);
      throw new ApiError(500, "Failed to retrieve questions");
    }
  }

  async updateQuestion(id, data) {
    try {
      const question = await Question.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
      )
        .populate("topicId", "name")
        .populate("subjectId", "name code")
        .populate("creatorId", "name")
        .populate("validation.verifiedBy", "name")
        .populate("relatedQuestions", "question");
      if (!question) throw new ApiError(404, "Question not found");
      logger.info(`Updated question: ${id}`);
      return question;
    } catch (error) {
      logger.error("Error updating question:", error);
      throw error instanceof ApiError
        ? error
        : new ApiError(500, "Failed to update question");
    }
  }

  async deleteQuestion(id) {
    try {
      const question = await Question.findByIdAndDelete(id);
      if (!question) throw new ApiError(404, "Question not found");
      logger.info(`Deleted question: ${id}`);
      return { message: "Question deleted successfully" };
    } catch (error) {
      logger.error("Error deleting question:", error);
      throw error instanceof ApiError
        ? error
        : new ApiError(500, "Failed to delete question");
    }
  }

  async verifyQuestion(id, verifierId, qualityScore, feedback = []) {
    try {
      const question = await Question.findById(id);
      if (!question) throw new ApiError(404, "Question not found");
      await question.verify(verifierId, qualityScore, feedback);
      logger.info(`Verified question: ${id}`);
      return question;
    } catch (error) {
      logger.error("Error verifying question:", error);
      throw error instanceof ApiError
        ? error
        : new ApiError(500, "Failed to verify question");
    }
  }
}

module.exports = new QuestionService();