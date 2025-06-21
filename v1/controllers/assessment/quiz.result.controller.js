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

const getQuizResultById = async (req, res) => {
  try {
    const quizResult = await quizResultService.getQuizResultById(req.params.id);
    res.status(StatusCodes.OK).json({
      message: "Résultat de quiz récupéré avec succès",
      data: quizResult,
    });
  } catch (error) {
    logger.error("Error retrieving quiz result:", error);
    throw error;
  }
};

const getQuizResults = async (req, res) => {
  try {
    const result = await quizResultService.getQuizResults(req.query, req.query);
    res.status(StatusCodes.OK).json({
      message: "Résultats de quiz récupérés avec succès",
      data: result.quizResults,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error("Error retrieving quiz results:", error);
    throw error;
  }
};

const updateQuizResult = async (req, res) => {
  try {
    const quizResult = await quizResultService.updateQuizResult(
      req.params.id,
      req.body
    );
    res.status(StatusCodes.OK).json({
      message: "Résultat de quiz mis à jour avec succès",
      data: quizResult,
    });
  } catch (error) {
    logger.error("Error updating quiz result:", error);
    throw error;
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
