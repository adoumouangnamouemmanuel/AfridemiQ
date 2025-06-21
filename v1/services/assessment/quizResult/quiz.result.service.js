const { QuizResult } = require("../../../models/assessment/quiz.result.model");
const { Quiz } = require("../../../models/assessment/quiz.model");
const NotFoundError = require("../../../errors/notFoundError");
const BadRequestError = require("../../../errors/badRequestError");
const createLogger = require("../../logging.service");

const logger = createLogger("QuizResultService");

// =============== CREATE QUIZ RESULT ===============
const createQuizResult = async (quizResultData) => {
  logger.info("===================createQuizResult=======================");

  // Validate that answers array length matches totalQuestions
  if (quizResultData.answers.length !== quizResultData.totalQuestions) {
    throw new BadRequestError(
      "Le nombre de réponses ne correspond pas au nombre de questions"
    );
    }

  // Validate that correctAnswers + incorrectAnswers = totalQuestions
  if (
    quizResultData.correctAnswers + quizResultData.incorrectAnswers !==
    quizResultData.totalQuestions
  ) {
    throw new BadRequestError(
      "Le total des réponses ne correspond pas au nombre de questions"
    );
  }

  // Validate that completedAt > startedAt
  if (
    new Date(quizResultData.completedAt) <= new Date(quizResultData.startedAt)
  ) {
    throw new BadRequestError(
      "L'heure de fin doit être après l'heure de début"
    );
  }

  const quizResult = new QuizResult(quizResultData);
  await quizResult.save();

  // Populate related fields
  await quizResult.populate([
    { path: "userId", select: "firstName lastName email" },
    { path: "quizId", select: "title format difficulty passingScore" },
    { path: "answers.questionId", select: "question type difficulty" },
  ]);

  logger.info(
    "++++++✅ CREATE QUIZ RESULT: Quiz result created successfully ++++++"
  );
  return quizResult;
};

// =============== GET ALL QUIZ RESULTS ===============
const getQuizResults = async (query) => {
  logger.info("===================getQuizResults=======================");

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
