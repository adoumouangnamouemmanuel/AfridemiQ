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

  // Validate questionIds and totalQuestions match if being updated
      if (updateData.questionIds && updateData.totalQuestions) {
        if (updateData.questionIds.length !== updateData.totalQuestions) {
          updateData.totalQuestions = updateData.questionIds.length;
        }
  } else if (updateData.questionIds) {
    updateData.totalQuestions = updateData.questionIds.length;
      }

      const quiz = await Quiz.findByIdAndUpdate(
        quizId,
    { $set: updateData },
        { new: true, runValidators: true }
  )
    .populate("subjectId", "name code")
    .populate("topicIds", "name")
    .populate("questionIds", "question type difficulty");

  logger.info("++++++✅ UPDATE QUIZ: Quiz updated successfully ++++++");
  return quiz;
};

// =============== DELETE QUIZ ===============
const deleteQuiz = async (quizId) => {
  logger.info("===================deleteQuiz=======================");

      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
    throw new NotFoundError("Quiz non trouvé");
      }

  // Soft delete - just mark as inactive
  await Quiz.findByIdAndUpdate(quizId, {
    isActive: false,
    status: "inactive",
  });

  logger.info("++++++✅ DELETE QUIZ: Quiz deleted successfully ++++++");
};

// =============== GET POPULAR QUIZZES ===============
const getPopularQuizzes = async (limit = 10) => {
  logger.info("===================getPopularQuizzes=======================");

  const quizzes = await Quiz.findPopular(limit)
    .populate("subjectId", "name code")
    .populate("topicIds", "name");

  logger.info("++++++✅ GET POPULAR QUIZZES: Popular quizzes retrieved ++++++");
  return quizzes;
};

// =============== GET QUIZZES BY SUBJECT ===============
const getQuizzesBySubject = async (subjectId, filters = {}) => {
  logger.info("===================getQuizzesBySubject=======================");

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
  if (filters.format) query.format = filters.format;
  if (filters.educationLevel) query.educationLevel = filters.educationLevel;
  if (filters.examType) query.examType = filters.examType;
  if (filters.isPremium !== undefined)
    query.isPremium = filters.isPremium === "true";

  const limit = parseInt(filters.limit) || 20;

  const quizzes = await Quiz.find(query)
    .populate("topicIds", "name")
    .sort({ "stats.totalAttempts": -1, createdAt: -1 })
    .limit(limit);

  logger.info("++++++✅ GET QUIZZES BY SUBJECT: Quizzes retrieved ++++++");
  return quizzes;
};

// =============== GET QUIZZES BY TOPIC ===============
const getQuizzesByTopic = async (topicId, filters = {}) => {
  logger.info("===================getQuizzesByTopic=======================");

  if (!topicId) {
    throw new BadRequestError("ID de sujet requis");
      }

  const query = {
    topicIds: { $in: [topicId] },
    isActive: true,
    status: "active",
  };

  // Apply additional filters
  if (filters.difficulty) query.difficulty = filters.difficulty;
  if (filters.format) query.format = filters.format;
  if (filters.educationLevel) query.educationLevel = filters.educationLevel;
  if (filters.examType) query.examType = filters.examType;
  if (filters.isPremium !== undefined)
    query.isPremium = filters.isPremium === "true";

  const limit = parseInt(filters.limit) || 20;

  const quizzes = await Quiz.find(query)
    .populate("subjectId", "name code")
    .populate("topicIds", "name")
    .sort({ "stats.totalAttempts": -1, createdAt: -1 })
    .limit(limit);

  logger.info("++++++✅ GET QUIZZES BY TOPIC: Quizzes retrieved ++++++");
  return quizzes;
};

// =============== GET QUIZZES BY EDUCATION AND EXAM ===============
const getQuizzesByEducationAndExam = async (
  educationLevel,
  examType,
  filters = {}
) => {
  logger.info(
    "===================getQuizzesByEducationAndExam======================="
  );

  if (!educationLevel || !examType) {
    throw new BadRequestError("Niveau d'éducation et type d'examen requis");
      }

  const query = {
    educationLevel,
    examType,
    isActive: true,
    status: "active",
  };

  // Apply additional filters
  if (filters.difficulty) query.difficulty = filters.difficulty;
  if (filters.format) query.format = filters.format;
  if (filters.subjectId) query.subjectId = filters.subjectId;
  if (filters.isPremium !== undefined)
    query.isPremium = filters.isPremium === "true";

  const limit = parseInt(filters.limit) || 20;

  const quizzes = await Quiz.find(query)
    .populate("subjectId", "name code")
    .populate("topicIds", "name")
    .sort({ "stats.totalAttempts": -1, createdAt: -1 })
    .limit(limit);

  logger.info(
    "++++++✅ GET QUIZZES BY EDUCATION AND EXAM: Quizzes retrieved ++++++"
  );
  return quizzes;
};

// =============== SEARCH QUIZZES ===============
const searchQuizzes = async (searchTerm, filters = {}) => {
  logger.info("===================searchQuizzes=======================");

  if (!searchTerm || searchTerm.trim().length < 2) {
    throw new BadRequestError(
      "Le terme de recherche doit contenir au moins 2 caractères"
    );
  }

  const query = {
    $or: [
      { title: { $regex: searchTerm.trim(), $options: "i" } },
      { description: { $regex: searchTerm.trim(), $options: "i" } },
    ],
    isActive: true,
    status: "active",
      };

  // Apply additional filters
  if (filters.subjectId) query.subjectId = filters.subjectId;
  if (filters.difficulty) query.difficulty = filters.difficulty;
  if (filters.format) query.format = filters.format;
  if (filters.educationLevel) query.educationLevel = filters.educationLevel;
  if (filters.examType) query.examType = filters.examType;
  if (filters.isPremium !== undefined)
    query.isPremium = filters.isPremium === "true";

  const quizzes = await Quiz.find(query)
    .populate("subjectId", "name code")
    .populate("topicIds", "name")
    .sort({ "stats.totalAttempts": -1, createdAt: -1 })
    .limit(20);

  logger.info("++++++✅ SEARCH QUIZZES: Search completed successfully ++++++");
  return quizzes;
};

// =============== UPDATE QUIZ STATS ===============
const updateQuizStats = async (
  quizId,
  score,
  completionTimeMinutes,
  passed
) => {
  logger.info("===================updateQuizStats=======================");

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
