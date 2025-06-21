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
    userId,
    quizId,
    isPassed,
    minScore,
    maxScore,
        sortBy = "createdAt",
        sortOrder = "desc",
  } = query;

  // Build filter object
  const filter = {};

  if (userId) filter.userId = userId;
  if (quizId) filter.quizId = quizId;
  if (isPassed !== undefined) filter.isPassed = isPassed === "true";
  if (minScore !== undefined) filter.score = { $gte: parseFloat(minScore) };
  if (maxScore !== undefined) {
    filter.score = { ...filter.score, $lte: parseFloat(maxScore) };
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === "desc" ? -1 : 1;

  // Calculate pagination
      const skip = (page - 1) * limit;

  // Execute query with pagination
      const [quizResults, total] = await Promise.all([
    QuizResult.find(filter)
      .populate("userId", "firstName lastName email")
      .populate("quizId", "title format difficulty passingScore")
      .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
    QuizResult.countDocuments(filter),
      ]);

  const pagination = {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
    totalCount: total,
    hasNextPage: page < Math.ceil(total / limit),
    hasPrevPage: page > 1,
      };

  logger.info(
    "++++++✅ GET QUIZ RESULTS: Quiz results retrieved successfully ++++++"
  );
  return { quizResults, pagination };
};

// =============== GET QUIZ RESULT BY ID ===============
const getQuizResultById = async (quizResultId) => {
  logger.info("===================getQuizResultById=======================");

  const quizResult = await QuizResult.findById(quizResultId)
    .populate("userId", "firstName lastName email")
    .populate("quizId", "title format difficulty passingScore")
    .populate("answers.questionId", "question type difficulty");

  if (!quizResult) {
    throw new NotFoundError("Résultat de quiz non trouvé");
  }

  logger.info(
    "++++++✅ GET QUIZ RESULT BY ID: Quiz result retrieved successfully ++++++"
  );
  return quizResult;
};

// =============== UPDATE QUIZ RESULT ===============
const updateQuizResult = async (quizResultId, updateData) => {
  logger.info("===================updateQuizResult=======================");

  // Check if quiz result exists
  const existingQuizResult = await QuizResult.findById(quizResultId);
  if (!existingQuizResult) {
    throw new NotFoundError("Résultat de quiz non trouvé");
  }

  // Validate answers array length if being updated
  if (updateData.answers && updateData.totalQuestions) {
    if (updateData.answers.length !== updateData.totalQuestions) {
      throw new BadRequestError(
        "Le nombre de réponses ne correspond pas au nombre de questions"
      );
    }
  }

  // Validate correct/incorrect answers sum if being updated
  if (
    updateData.correctAnswers !== undefined &&
    updateData.incorrectAnswers !== undefined
  ) {
    const totalQuestions =
      updateData.totalQuestions || existingQuizResult.totalQuestions;
    if (
      updateData.correctAnswers + updateData.incorrectAnswers !==
      totalQuestions
    ) {
      throw new BadRequestError(
        "Le total des réponses ne correspond pas au nombre de questions"
      );
    }
  }

      const quizResult = await QuizResult.findByIdAndUpdate(
    quizResultId,
    { $set: updateData },
        { new: true, runValidators: true }
      )
    .populate("userId", "firstName lastName email")
    .populate("quizId", "title format difficulty passingScore")
    .populate("answers.questionId", "question type difficulty");

  logger.info(
    "++++++✅ UPDATE QUIZ RESULT: Quiz result updated successfully ++++++"
  );
      return quizResult;
};

// =============== DELETE QUIZ RESULT ===============
const deleteQuizResult = async (quizResultId) => {
  logger.info("===================deleteQuizResult=======================");

  const quizResult = await QuizResult.findById(quizResultId);
  if (!quizResult) {
    throw new NotFoundError("Résultat de quiz non trouvé");
  }

  await QuizResult.findByIdAndDelete(quizResultId);

  logger.info(
    "++++++✅ DELETE QUIZ RESULT: Quiz result deleted successfully ++++++"
  );
};

// =============== GET USER BEST SCORE ===============
const getUserBestScore = async (userId, quizId) => {
  logger.info("===================getUserBestScore=======================");

  if (!userId || !quizId) {
    throw new BadRequestError("ID utilisateur et ID quiz requis");
  }

  const bestScore = await QuizResult.getUserBestScore(userId, quizId);

  logger.info("++++++✅ GET USER BEST SCORE: User best score retrieved ++++++");
  return bestScore;
};

// =============== GET USER ATTEMPT COUNT ===============
const getUserAttemptCount = async (userId, quizId) => {
  logger.info("===================getUserAttemptCount=======================");

  if (!userId || !quizId) {
    throw new BadRequestError("ID utilisateur et ID quiz requis");
  }

  const attemptCount = await QuizResult.getUserAttemptCount(userId, quizId);

  logger.info(
    "++++++✅ GET USER ATTEMPT COUNT: User attempt count retrieved ++++++"
  );
  return attemptCount;
};

// =============== GET USER AVERAGE SCORE ===============
const getUserAverageScore = async (userId) => {
  logger.info("===================getUserAverageScore=======================");

  if (!userId) {
    throw new BadRequestError("ID utilisateur requis");
  }

  const averageScoreResult = await QuizResult.getUserAverageScore(userId);
  const averageScore =
    averageScoreResult.length > 0 ? averageScoreResult[0].averageScore : 0;

  logger.info(
    "++++++✅ GET USER AVERAGE SCORE: User average score retrieved ++++++"
  );
  return Math.round(averageScore * 100) / 100; // Round to 2 decimal places
};

module.exports = {
  createQuizResult,
  getQuizResults,
  getQuizResultById,
  updateQuizResult,
  deleteQuizResult,
  getUserBestScore,
  getUserAttemptCount,
  getUserAverageScore,
};
