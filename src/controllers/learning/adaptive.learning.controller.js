const { StatusCodes } = require("http-status-codes");
const adaptiveLearningService = require("../../services/learning/adaptiveLearning/adaptive.learning.service");
const createLogger = require("../../services/logging.service");

const logger = createLogger("AdaptiveLearningController");

const createAdaptiveLearning = async (req, res) => {
  try {
    const profile = await adaptiveLearningService.createAdaptiveLearning(
      req.body
    );
    res.status(StatusCodes.CREATED).json({
      message: "Profil d'apprentissage adaptatif créé avec succès",
      data: profile,
    });
  } catch (error) {
    logger.error("Error creating adaptive learning profile:", error);
    throw error;
  }
};

const getAdaptiveLearningByUserId = async (req, res) => {
  try {
    const profile = await adaptiveLearningService.getAdaptiveLearningByUserId(
      req.params.userId
    );
    res.status(StatusCodes.OK).json({
      message: "Profil d'apprentissage adaptatif récupéré avec succès",
      data: profile,
    });
  } catch (error) {
    logger.error("Error retrieving adaptive learning profile:", error);
    throw error;
  }
};

const updateAdaptiveLearning = async (req, res) => {
  try {
    const profile = await adaptiveLearningService.updateAdaptiveLearning(
      req.params.userId,
      req.body
    );
    res.status(StatusCodes.OK).json({
      message: "Profil d'apprentissage adaptatif mis à jour avec succès",
      data: profile,
    });
  } catch (error) {
    logger.error("Error updating adaptive learning profile:", error);
    throw error;
  }
};

const adjustDifficulty = async (req, res) => {
  try {
    const profile = await adaptiveLearningService.adjustDifficulty(
      req.params.userId,
      req.body
    );
    res.status(StatusCodes.OK).json({
      message: "Difficulté ajustée avec succès",
      data: profile,
    });
  } catch (error) {
    logger.error("Error adjusting difficulty:", error);
    throw error;
  }
};

const getAllAdaptiveLearning = async (req, res) => {
  try {
    const result = await adaptiveLearningService.getAllAdaptiveLearning(
      req.query,
      req.query
    );
    res.status(StatusCodes.OK).json({
      message: "Profils d'apprentissage adaptatif récupérés avec succès",
      data: result.profiles,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error("Error retrieving all adaptive learning profiles:", error);
    throw error;
  }
};

module.exports = {
  createAdaptiveLearning,
  getAdaptiveLearningByUserId,
  updateAdaptiveLearning,
  adjustDifficulty,
  getAllAdaptiveLearning,
};
