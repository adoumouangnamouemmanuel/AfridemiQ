const { StatusCodes } = require("http-status-codes");
const missionService = require("../../services/progress/mission/mission.service");
const createLogger = require("../../services/logging.service");

const logger = createLogger("MissionController");

const createMission = async (req, res) => {
  try {
    const mission = await missionService.createMission(req.body);

    logger.info(`Mission created: ${mission.title}`);
    res.status(StatusCodes.CREATED).json({
      message: "Mission créée avec succès",
      data: mission,
    });
  } catch (error) {
    logger.error("Error creating mission:", error);
    res.status(StatusCodes.BAD_REQUEST).json({
      message: "Erreur lors de la création de la mission",
      error: error.message,
    });
  }
};

const getMissions = async (req, res) => {
  try {
    const result = await missionService.getMissions(req.query);

    logger.info("Missions retrieved");
    res.status(StatusCodes.OK).json({
      message: "Missions récupérées avec succès",
      data: result.missions,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error("Error getting missions:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Erreur lors de la récupération des missions",
      error: error.message,
    });
  }
};

const getMissionById = async (req, res) => {
  try {
    const { id } = req.params;
    const mission = await missionService.getMissionById(id);

    logger.info(`Mission retrieved: ${id}`);
    res.status(StatusCodes.OK).json({
      message: "Mission récupérée avec succès",
      data: mission,
    });
  } catch (error) {
    logger.error("Error getting mission by ID:", error);
    const statusCode =
      error.message === "Mission not found"
        ? StatusCodes.NOT_FOUND
        : StatusCodes.INTERNAL_SERVER_ERROR;

    res.status(statusCode).json({
      message: "Erreur lors de la récupération de la mission",
      error: error.message,
    });
  }
};

const updateProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { progress } = req.body;

    const mission = await missionService.updateProgress(id, progress);

    logger.info(`Mission progress updated: ${id}`);
    res.status(StatusCodes.OK).json({
      message: "Progrès de la mission mis à jour avec succès",
      data: mission,
    });
  } catch (error) {
    logger.error("Error updating mission progress:", error);
    const statusCode = error.message.includes("not found")
      ? StatusCodes.NOT_FOUND
      : StatusCodes.BAD_REQUEST;

    res.status(statusCode).json({
      message: "Erreur lors de la mise à jour du progrès",
      error: error.message,
    });
  }
};

const updateMission = async (req, res) => {
  try {
    const { id } = req.params;
    const mission = await missionService.updateMission(id, req.body);

    logger.info(`Mission updated: ${id}`);
    res.status(StatusCodes.OK).json({
      message: "Mission mise à jour avec succès",
      data: mission,
    });
  } catch (error) {
    logger.error("Error updating mission:", error);
    const statusCode =
      error.message === "Mission not found"
        ? StatusCodes.NOT_FOUND
        : StatusCodes.BAD_REQUEST;

    res.status(statusCode).json({
      message: "Erreur lors de la mise à jour de la mission",
      error: error.message,
    });
  }
};

const deleteMission = async (req, res) => {
  try {
    const { id } = req.params;
    await missionService.deleteMission(id);

    logger.info(`Mission deleted: ${id}`);
    res.status(StatusCodes.OK).json({
      message: "Mission supprimée avec succès",
    });
  } catch (error) {
    logger.error("Error deleting mission:", error);
    const statusCode =
      error.message === "Mission not found"
        ? StatusCodes.NOT_FOUND
        : StatusCodes.INTERNAL_SERVER_ERROR;

    res.status(statusCode).json({
      message: "Erreur lors de la suppression de la mission",
      error: error.message,
    });
  }
};

const getDailyMissions = async (req, res) => {
  try {
    const { subjectId, series } = req.query;
    const missions = await missionService.getDailyMissions(subjectId, series);

    logger.info("Daily missions retrieved");
    res.status(StatusCodes.OK).json({
      message: "Missions quotidiennes récupérées avec succès",
      data: missions,
    });
  } catch (error) {
    logger.error("Error getting daily missions:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Erreur lors de la récupération des missions quotidiennes",
      error: error.message,
    });
  }
};

const getWeeklyMissions = async (req, res) => {
  try {
    const { subjectId, series } = req.query;
    const missions = await missionService.getWeeklyMissions(subjectId, series);

    logger.info("Weekly missions retrieved");
    res.status(StatusCodes.OK).json({
      message: "Missions hebdomadaires récupérées avec succès",
      data: missions,
    });
  } catch (error) {
    logger.error("Error getting weekly missions:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Erreur lors de la récupération des missions hebdomadaires",
      error: error.message,
    });
  }
};

const getStatistics = async (req, res) => {
  try {
    const statistics = await missionService.getStatistics();

    logger.info("Mission statistics retrieved");
    res.status(StatusCodes.OK).json({
      message: "Statistiques des missions récupérées avec succès",
      data: statistics,
    });
  } catch (error) {
    logger.error("Error getting mission statistics:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Erreur lors de la récupération des statistiques",
      error: error.message,
    });
  }
};

const cleanupExpiredMissions = async (req, res) => {
  try {
    const result = await missionService.cleanupExpiredMissions();

    logger.info("Expired missions cleaned up");
    res.status(StatusCodes.OK).json({
      message: "Missions expirées nettoyées avec succès",
      data: { deactivated: result.modifiedCount },
    });
  } catch (error) {
    logger.error("Error cleaning up expired missions:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Erreur lors du nettoyage des missions expirées",
      error: error.message,
    });
  }
};

module.exports = {
  createMission,
  getMissions,
  getMissionById,
  updateProgress,
  updateMission,
  deleteMission,
  getDailyMissions,
  getWeeklyMissions,
  getStatistics,
  cleanupExpiredMissions,
};