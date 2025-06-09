const { StatusCodes } = require("http-status-codes");
const curriculumService = require("../../services/learning/curriculum.service");
const createLogger = require("../../services/logging.service");

const logger = createLogger("CurriculumController");

// Create a new curriculum
const createCurriculum = async (req, res) => {
  try {
    // Add the authenticated user's ID as createdBy
    const curriculumData = {
      ...req.body,
      createdBy: req.user.userId,
    };

    const curriculum = await curriculumService.createCurriculum(curriculumData);
    res.status(StatusCodes.CREATED).json({
      message: "Curriculum créé avec succès",
      data: curriculum,
    });
  } catch (error) {
    logger.error("Error in createCurriculum controller", error);
    throw error;
  }
};

// Get all curricula
const getCurricula = async (req, res) => {
  try {
    const result = await curriculumService.getCurricula(req.query);
    res.status(StatusCodes.OK).json({
      message: "Curricula récupérés avec succès",
      data: result.curricula,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error("Error in getCurricula controller", error, {
      query: req.query,
    });
    throw error;
  }
};

// Get curriculum by ID
const getCurriculumById = async (req, res) => {
  try {
    const curriculum = await curriculumService.getCurriculumById(req.params.id);
    res.status(StatusCodes.OK).json({
      message: "Curriculum récupéré avec succès",
      data: curriculum,
    });
  } catch (error) {
    logger.error("Error in getCurriculumById controller", error, {
      curriculumId: req.params.id,
    });
    throw error;
  }
};

// Update curriculum
const updateCurriculum = async (req, res) => {
  try {
    const curriculum = await curriculumService.updateCurriculum(
      req.params.id,
      req.body
    );
    res.status(StatusCodes.OK).json({
      message: "Curriculum mis à jour avec succès",
      data: curriculum,
    });
  } catch (error) {
    logger.error("Error in updateCurriculum controller", error, {
      curriculumId: req.params.id,
    });
    throw error;
  }
};

// Delete curriculum
const deleteCurriculum = async (req, res) => {
  try {
    const result = await curriculumService.deleteCurriculum(req.params.id);
    res.status(StatusCodes.OK).json({
      message: result.message,
    });
  } catch (error) {
    logger.error("Error in deleteCurriculum controller", error, {
      curriculumId: req.params.id,
    });
    throw error;
  }
};

// Add subject to curriculum
const addSubjectToCurriculum = async (req, res) => {
  try {
    const { subjectId } = req.body;
    const curriculum = await curriculumService.addSubjectToCurriculum(
      req.params.id,
      { subjectId }
    );
    res.status(StatusCodes.OK).json({
      message: "Matière ajoutée au curriculum avec succès",
      data: curriculum,
    });
  } catch (error) {
    logger.error("Error in addSubjectToCurriculum controller", error, {
      curriculumId: req.params.id,
      subjectId: req.body.subjectId,
    });
    throw error;
  }
};

// Remove subject from curriculum
const removeSubjectFromCurriculum = async (req, res) => {
  try {
    const curriculum = await curriculumService.removeSubjectFromCurriculum(
      req.params.id,
      req.params.subjectId
    );
    res.status(StatusCodes.OK).json({
      message: "Matière retirée du curriculum avec succès",
      data: curriculum,
    });
  } catch (error) {
    logger.error("Error in removeSubjectFromCurriculum controller", error, {
      curriculumId: req.params.id,
      subjectId: req.params.subjectId,
    });
    throw error;
  }
};

// Get curricula by country
const getCurriculaByCountry = async (req, res) => {
  try {
    const curricula = await curriculumService.getCurriculaByCountry(
      req.params.country
    );
    res.status(StatusCodes.OK).json({
      message: "Curricula récupérés par pays avec succès",
      data: curricula,
    });
  } catch (error) {
    logger.error("Error in getCurriculaByCountry controller", error, {
      country: req.params.country,
    });
    throw error;
  }
};

// Get curriculum statistics
const getCurriculumStats = async (req, res) => {
  try {
    const stats = await curriculumService.getCurriculumStats();
    res.status(StatusCodes.OK).json({
      message: "Statistiques des curricula récupérées avec succès",
      data: stats,
    });
  } catch (error) {
    logger.error("Error in getCurriculumStats controller", error);
    throw error;
  }
};

module.exports = {
  createCurriculum,
  getCurricula,
  getCurriculumById,
  updateCurriculum,
  deleteCurriculum,
  addSubjectToCurriculum,
  removeSubjectFromCurriculum,
  getCurriculaByCountry,
  getCurriculumStats,
};
