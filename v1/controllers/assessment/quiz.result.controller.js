const { StatusCodes } = require("http-status-codes");
const quizResultService = require("../../services/assessment/quiz.result.service");
const createLogger = require("../../services/logging.service");

const logger = createLogger("QuizResultController");

// =============== CREATE QUIZ RESULT ===============
const createQuizResult = async (req, res) => {
  logger.info("===================createQuizResult=======================");

  try {
    const quizResult = await quizResultService.createQuizResult(req.body);

    logger.info(
      "++++++✅ CREATE QUIZ RESULT: Quiz result created successfully ++++++"
    );
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Résultat de quiz créé avec succès",
      data: { quizResult },
    });
  } catch (error) {
    logger.error("❌ CREATE QUIZ RESULT ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Erreur lors de la création du résultat",
    });
  }
};

// =============== GET ALL QUIZ RESULTS ===============
const getQuizResults = async (req, res) => {
  logger.info("===================getQuizResults=======================");

  try {
    const result = await quizResultService.getQuizResults(req.query);

    logger.info(
      "++++++✅ GET QUIZ RESULTS: Quiz results retrieved successfully ++++++"
    );
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Résultats de quiz récupérés avec succès",
      data: result,
    });
  } catch (error) {
    logger.error("❌ GET QUIZ RESULTS ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Erreur lors de la récupération des résultats",
    });
  }
};

// =============== GET QUIZ RESULT BY ID ===============
const getQuizResultById = async (req, res) => {
  logger.info("===================getQuizResultById=======================");

  try {
    const quizResult = await quizResultService.getQuizResultById(req.params.id);

    logger.info(
      "++++++✅ GET QUIZ RESULT BY ID: Quiz result retrieved successfully ++++++"
    );
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Résultat de quiz récupéré avec succès",
      data: { quizResult },
    });
  } catch (error) {
    logger.error("❌ GET QUIZ RESULT BY ID ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Erreur lors de la récupération du résultat",
    });
  }
};

// =============== UPDATE QUIZ RESULT ===============
const updateQuizResult = async (req, res) => {
  logger.info("===================updateQuizResult=======================");

  try {
    const quizResult = await quizResultService.updateQuizResult(
      req.params.id,
      req.body
    );

    logger.info(
      "++++++✅ UPDATE QUIZ RESULT: Quiz result updated successfully ++++++"
    );
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Résultat de quiz mis à jour avec succès",
      data: { quizResult },
    });
  } catch (error) {
    logger.error("❌ UPDATE QUIZ RESULT ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Erreur lors de la mise à jour du résultat",
    });
  }
};

// =============== DELETE QUIZ RESULT ===============
const deleteQuizResult = async (req, res) => {
  logger.info("===================deleteQuizResult=======================");

  try {
    await quizResultService.deleteQuizResult(req.params.id);

    logger.info(
      "++++++✅ DELETE QUIZ RESULT: Quiz result deleted successfully ++++++"
    );
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Résultat de quiz supprimé avec succès",
    });
  } catch (error) {
    logger.error("❌ DELETE QUIZ RESULT ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Erreur lors de la suppression du résultat",
    });
  }
};

// =============== GET USER QUIZ RESULTS ===============
const getUserQuizResults = async (req, res) => {
  logger.info("===================getUserQuizResults=======================");

  try {
    const { userId } = req.params;
    const filters = { ...req.query, userId };
    const results = await quizResultService.getQuizResults(filters);

    logger.info(
      "++++++✅ GET USER QUIZ RESULTS: User quiz results retrieved ++++++"
    );
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Résultats utilisateur récupérés avec succès",
      data: results,
    });
  } catch (error) {
    logger.error("❌ GET USER QUIZ RESULTS ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Erreur lors de la récupération des résultats",
    });
  }
};

// =============== GET USER BEST SCORE ===============
const getUserBestScore = async (req, res) => {
  logger.info("===================getUserBestScore=======================");

  try {
    const { userId, quizId } = req.params;
    const bestScore = await quizResultService.getUserBestScore(userId, quizId);

    logger.info(
      "++++++✅ GET USER BEST SCORE: User best score retrieved ++++++"
    );
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Meilleur score récupéré avec succès",
      data: { bestScore },
    });
  } catch (error) {
    logger.error("❌ GET USER BEST SCORE ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message:
        error.message || "Erreur lors de la récupération du meilleur score",
    });
  }
};

// =============== GET USER ATTEMPT COUNT ===============
const getUserAttemptCount = async (req, res) => {
  logger.info("===================getUserAttemptCount=======================");

  try {
    const { userId, quizId } = req.params;
    const attemptCount = await quizResultService.getUserAttemptCount(
      userId,
      quizId
    );

    logger.info(
      "++++++✅ GET USER ATTEMPT COUNT: User attempt count retrieved ++++++"
    );
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Nombre de tentatives récupéré avec succès",
      data: { attemptCount },
    });
  } catch (error) {
    logger.error("❌ GET USER ATTEMPT COUNT ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message:
        error.message ||
        "Erreur lors de la récupération du nombre de tentatives",
    });
  }
};

// =============== GET USER AVERAGE SCORE ===============
const getUserAverageScore = async (req, res) => {
  logger.info("===================getUserAverageScore=======================");

  try {
    const { userId } = req.params;
    const averageScore = await quizResultService.getUserAverageScore(userId);

    logger.info(
      "++++++✅ GET USER AVERAGE SCORE: User average score retrieved ++++++"
    );
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Score moyen récupéré avec succès",
      data: { averageScore },
    });
  } catch (error) {
    logger.error("Error deleting quiz result:", error);
    throw error;
  }
};

module.exports = {
  createQuizResult,
  getQuizResultById,
  getQuizResults,
  updateQuizResult,
  deleteQuizResult,
};
