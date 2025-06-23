const { StatusCodes } = require("http-status-codes");
const learningPathService = require("../../services/learning/learningPath/learning.path.service");
const createLogger = require("../../services/logging.service");

const logger = createLogger("LearningPathController");

const createLearningPath = async (req, res) => {
  try {
    const learningPath = await learningPathService.createLearningPath(req.body);
    res.status(StatusCodes.CREATED).json({
      message: "Chemin d'apprentissage créé avec succès",
      data: learningPath,
    });
  } catch (error) {
    logger.error("Error creating learning path:", error);
    throw error;
  }
};

const getLearningPathById = async (req, res) => {
  try {
    const learningPath = await learningPathService.getLearningPathById(
      req.params.id
    );
    res.status(StatusCodes.OK).json({
      message: "Chemin d'apprentissage récupéré avec succès",
      data: learningPath,
    });
  } catch (error) {
    logger.error("Error retrieving learning path:", error);
    throw error;
  }
};

const getLearningPaths = async (req, res) => {
  try {
    const result = await learningPathService.getLearningPaths(
      req.query,
      req.query
    );
    res.status(StatusCodes.OK).json({
      message: "Chemins d'apprentissage récupérés avec succès",
      data: result.learningPaths,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error("Error retrieving learning paths:", error);
    throw error;
  }
};

const updateLearningPath = async (req, res) => {
  try {
    const learningPath = await learningPathService.updateLearningPath(
      req.params.id,
      req.body
    );
    res.status(StatusCodes.OK).json({
      message: "Chemin d'apprentissage mis à jour avec succès",
      data: learningPath,
    });
  } catch (error) {
    logger.error("Error updating learning path:", error);
    throw error;
  }
};

const deleteLearningPath = async (req, res) => {
  try {
    const result = await learningPathService.deleteLearningPath(req.params.id);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    logger.error("Error deleting learning path:", error);
    throw error;
  }
};

module.exports = {
  createLearningPath,
  getLearningPathById,
  getLearningPaths,
  updateLearningPath,
  deleteLearningPath,
};
