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
    questionId,
    { $set: updateData },
        { new: true, runValidators: true }
      )
        .populate("subjectId", "name code")
    .populate("topicId", "name");

  logger.info("++++++✅ UPDATE QUESTION: Question updated successfully ++++++");
      return question;
};

// =============== DELETE QUESTION ===============
const deleteQuestion = async (questionId) => {
  logger.info("===================deleteQuestion=======================");

  const question = await Question.findById(questionId);
  if (!question) {
    throw new NotFoundError("Question non trouvée");
  }

  // Soft delete - just mark as inactive
  await Question.findByIdAndUpdate(questionId, {
    isActive: false,
    status: "inactive",
  });

  logger.info("++++++✅ DELETE QUESTION: Question deleted successfully ++++++");
};

// =============== GET QUESTIONS BY SUBJECT ===============
const getQuestionsBySubject = async (subjectId, filters = {}) => {
  logger.info(
    "===================getQuestionsBySubject======================="
  );

  if (!subjectId) {
    throw new BadRequestError("ID de matière requis");
  }

  const query = {
    subjectId,
    isActive: true,
    status: "active",
  };

  // Apply additional filters
  if (filters.difficulty) query.difficulty = filters.difficulty;
  if (filters.type) query.type = filters.type;
  if (filters.educationLevel) query.educationLevel = filters.educationLevel;
  if (filters.examType) query.examType = filters.examType;
  if (filters.isPremium !== undefined)
    query.isPremium = filters.isPremium === "true";

  const limit = parseInt(filters.limit) || 20;

  const questions = await Question.find(query)
    .populate("topicId", "name")
    .sort({ createdAt: -1 })
    .limit(limit);

  logger.info("++++++✅ GET QUESTIONS BY SUBJECT: Questions retrieved ++++++");
  return questions;
};

// =============== GET QUESTIONS BY TOPIC ===============
const getQuestionsByTopic = async (topicId, filters = {}) => {
  logger.info("===================getQuestionsByTopic=======================");

  if (!topicId) {
    throw new BadRequestError("ID de sujet requis");
  }

  const query = {
    topicId,
    isActive: true,
    status: "active",
  };

  // Apply additional filters
  if (filters.difficulty) query.difficulty = filters.difficulty;
  if (filters.type) query.type = filters.type;
  if (filters.educationLevel) query.educationLevel = filters.educationLevel;
  if (filters.examType) query.examType = filters.examType;
  if (filters.isPremium !== undefined)
    query.isPremium = filters.isPremium === "true";

  const limit = parseInt(filters.limit) || 20;

  const questions = await Question.find(query)
    .populate("subjectId", "name code")
    .sort({ createdAt: -1 })
    .limit(limit);

  logger.info("++++++✅ GET QUESTIONS BY TOPIC: Questions retrieved ++++++");
  return questions;
};

// =============== GET RANDOM QUESTIONS ===============
const getRandomQuestions = async (count = 10, filters = {}) => {
  logger.info("===================getRandomQuestions=======================");

  const query = {
    isActive: true,
    status: "active",
  };

  // Apply filters
  if (filters.subjectId) query.subjectId = filters.subjectId;
  if (filters.topicId) query.topicId = filters.topicId;
  if (filters.difficulty) query.difficulty = filters.difficulty;
  if (filters.type) query.type = filters.type;
  if (filters.educationLevel) query.educationLevel = filters.educationLevel;
  if (filters.examType) query.examType = filters.examType;
  if (filters.isPremium !== undefined)
    query.isPremium = filters.isPremium === "true";

  const questions = await Question.aggregate([
    { $match: query },
    { $sample: { size: parseInt(count) } },
    {
      $lookup: {
        from: "subjects",
        localField: "subjectId",
        foreignField: "_id",
        as: "subjectId",
        pipeline: [{ $project: { name: 1, code: 1 } }],
      },
    },
    {
      $lookup: {
        from: "topics",
        localField: "topicId",
        foreignField: "_id",
        as: "topicId",
        pipeline: [{ $project: { name: 1 } }],
      },
    },
    {
      $addFields: {
        subjectId: { $arrayElemAt: ["$subjectId", 0] },
        topicId: { $arrayElemAt: ["$topicId", 0] },
      },
    },
  ]);

  logger.info(
    "++++++✅ GET RANDOM QUESTIONS: Random questions retrieved ++++++"
  );
  return questions;
};

// =============== SEARCH QUESTIONS ===============
const searchQuestions = async (searchTerm, filters = {}) => {
  logger.info("===================searchQuestions=======================");

  if (!searchTerm || searchTerm.trim().length < 2) {
    throw new BadRequestError(
      "Le terme de recherche doit contenir au moins 2 caractères"
    );
  }

  const query = {
    $or: [
      { question: { $regex: searchTerm.trim(), $options: "i" } },
      { explanation: { $regex: searchTerm.trim(), $options: "i" } },
      { tags: { $in: [new RegExp(searchTerm.trim(), "i")] } },
    ],
    isActive: true,
    status: "active",
  };

  // Apply additional filters
  if (filters.subjectId) query.subjectId = filters.subjectId;
  if (filters.difficulty) query.difficulty = filters.difficulty;
  if (filters.type) query.type = filters.type;
  if (filters.educationLevel) query.educationLevel = filters.educationLevel;
  if (filters.examType) query.examType = filters.examType;
  if (filters.isPremium !== undefined)
    query.isPremium = filters.isPremium === "true";

  const questions = await Question.find(query)
    .populate("subjectId", "name code")
    .populate("topicId", "name")
    .sort({ "stats.totalAttempts": -1, createdAt: -1 })
    .limit(20);

  logger.info(
    "++++++✅ SEARCH QUESTIONS: Search completed successfully ++++++"
  );
  return questions;
};

// =============== UPDATE QUESTION STATS ===============
const updateQuestionStats = async (questionId, isCorrect, timeSpent) => {
  logger.info("===================updateQuestionStats=======================");

  const question = await Question.findById(questionId);
  if (!question) {
    throw new NotFoundError("Question non trouvée");
  }

  await question.updateStats(isCorrect, timeSpent);

  logger.info(
    "++++++✅ UPDATE QUESTION STATS: Stats updated successfully ++++++"
  );
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