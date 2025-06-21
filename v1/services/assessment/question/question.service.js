const { Question } = require("../../../models/assessment/question.model");
const NotFoundError = require("../../../errors/notFoundError");
const BadRequestError = require("../../../errors/badRequestError");
const createLogger = require("../../logging.service");

const logger = createLogger("QuestionService");

// =============== CREATE QUESTION ===============
const createQuestion = async (questionData) => {
  logger.info("===================createQuestion=======================");

  // Validate options for multiple choice questions
  if (questionData.type === "multiple_choice") {
    if (!questionData.options || questionData.options.length < 2) {
      throw new BadRequestError(
        "Les questions à choix multiples doivent avoir au moins 2 options"
      );
    }
    if (questionData.options.length > 5) {
      throw new BadRequestError("Maximum 5 options autorisées");
    }

    // Validate correct answer index for multiple choice
    const answerIndex = parseInt(questionData.correctAnswer);
    if (
      isNaN(answerIndex) ||
      answerIndex < 0 ||
      answerIndex >= questionData.options.length
    ) {
      throw new BadRequestError("L'index de la réponse correcte est invalide");
    }
  }

  // Validate true/false questions
  if (questionData.type === "true_false") {
    if (!["true", "false", true, false].includes(questionData.correctAnswer)) {
      throw new BadRequestError("Réponse invalide pour une question vrai/faux");
    }
  }

  const question = new Question(questionData);
  await question.save();

  logger.info("++++++✅ CREATE QUESTION: Question created successfully ++++++");
  return question;
};

// =============== GET ALL QUESTIONS ===============
const getQuestions = async (query) => {
  logger.info("===================getQuestions=======================");

      const {
        page = 1,
        limit = 10,
    subjectId,
    topicId,
    type,
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
  if (topicId) filter.topicId = topicId;
  if (type) filter.type = type;
  if (difficulty) filter.difficulty = difficulty;
  if (educationLevel) filter.educationLevel = educationLevel;
  if (examType) filter.examType = examType;
  if (isActive !== undefined) filter.isActive = isActive === "true";
  if (isPremium !== undefined) filter.isPremium = isPremium === "true";
  if (status) filter.status = status;

  // Add search functionality
  if (search) {
    filter.$or = [
      { question: { $regex: search, $options: "i" } },
      { explanation: { $regex: search, $options: "i" } },
      { tags: { $in: [new RegExp(search, "i")] } },
    ];
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === "desc" ? -1 : 1;

  // Calculate pagination
      const skip = (page - 1) * limit;

  // Execute query with pagination
      const [questions, total] = await Promise.all([
    Question.find(filter)
      .populate("subjectId", "name code")
          .populate("topicId", "name")
      .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
    Question.countDocuments(filter),
      ]);

  const pagination = {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
    totalCount: total,
    hasNextPage: page < Math.ceil(total / limit),
    hasPrevPage: page > 1,
      };

  logger.info(
    "++++++✅ GET QUESTIONS: Questions retrieved successfully ++++++"
  );
  return { questions, pagination };
};

// =============== GET QUESTION BY ID ===============
const getQuestionById = async (questionId) => {
  logger.info("===================getQuestionById=======================");

  const question = await Question.findById(questionId)
    .populate("subjectId", "name code")
    .populate("topicId", "name");

  if (!question) {
    throw new NotFoundError("Question non trouvée");
  }

  logger.info(
    "++++++✅ GET QUESTION BY ID: Question retrieved successfully ++++++"
  );
  return question;
};

// =============== UPDATE QUESTION ===============
const updateQuestion = async (questionId, updateData) => {
  logger.info("===================updateQuestion=======================");

  // Check if question exists
  const existingQuestion = await Question.findById(questionId);
  if (!existingQuestion) {
    throw new NotFoundError("Question non trouvée");
  }

  // Validate options for multiple choice questions
  if (
    updateData.type === "multiple_choice" ||
    existingQuestion.type === "multiple_choice"
  ) {
    const options = updateData.options || existingQuestion.options;
    if (options && options.length > 0) {
      if (options.length < 2) {
        throw new BadRequestError(
          "Les questions à choix multiples doivent avoir au moins 2 options"
        );
      }
      if (options.length > 5) {
        throw new BadRequestError("Maximum 5 options autorisées");
      }
    }
  }

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