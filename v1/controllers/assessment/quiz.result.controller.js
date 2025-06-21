const { StatusCodes } = require("http-status-codes");
const quizResultService = require("../../services/results/quiz.result.service");
const createLogger = require("../../services/logging.service");

const logger = createLogger("QuizResultController");

const createQuizResult = async (req, res) => {
  try {
    const quizResult = await quizResultService.createQuizResult(req.body);
    res.status(StatusCodes.CREATED).json({
      message: "Résultat de quiz créé avec succès",
      data: quizResult,
    });
  } catch (error) {
    logger.error("Error creating quiz result:", error);
    throw error;
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
