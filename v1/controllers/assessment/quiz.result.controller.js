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

const deleteQuizResult = async (req, res) => {
  try {
    const result = await quizResultService.deleteQuizResult(req.params.id);
    res.status(StatusCodes.OK).json(result);
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
