const { StatusCodes } = require("http-status-codes");
const studyGroupService = require("../../services/learning/studyGroup/study.group.service");
const createLogger = require("../../services/logging.service");

const logger = createLogger("StudyGroupController");

const createStudyGroup = async (req, res) => {
  try {
    const studyGroup = await studyGroupService.createStudyGroup(req.body);
    res.status(StatusCodes.CREATED).json({
      message: "Groupe d'étude créé avec succès",
      data: studyGroup,
    });
  } catch (error) {
    logger.error("Error creating study group:", error);
    throw error;
  }
};

const getStudyGroupById = async (req, res) => {
  try {
    const studyGroup = await studyGroupService.getStudyGroupById(req.params.id);
    res.status(StatusCodes.OK).json({
      message: "Groupe d'étude récupéré avec succès",
      data: studyGroup,
    });
  } catch (error) {
    logger.error("Error retrieving study group:", error);
    throw error;
  }
};

const getStudyGroups = async (req, res) => {
  try {
    const result = await studyGroupService.getStudyGroups(req.query, req.query);
    res.status(StatusCodes.OK).json({
      message: "Groupes d'étude récupérés avec succès",
      data: result.studyGroups,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error("Error retrieving study groups:", error);
    throw error;
  }
};

const updateStudyGroup = async (req, res) => {
  try {
    const studyGroup = await studyGroupService.updateStudyGroup(
      req.params.id,
      req.body
    );
    res.status(StatusCodes.OK).json({
      message: "Groupe d'étude mis à jour avec succès",
      data: studyGroup,
    });
  } catch (error) {
    logger.error("Error updating study group:", error);
    throw error;
  }
};

const deleteStudyGroup = async (req, res) => {
  try {
    const result = await studyGroupService.deleteStudyGroup(req.params.id);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    logger.error("Error deleting study group:", error);
    throw error;
  }
};

module.exports = {
  createStudyGroup,
  getStudyGroupById,
  getStudyGroups,
  updateStudyGroup,
  deleteStudyGroup,
};