const { StatusCodes } = require("http-status-codes");
const gamifiedProgressService = require("../../services/progress/gamifiedProgress/gamified.progress.service");
const createLogger = require("../../services/logging.service");

const logger = createLogger("GamifiedProgressController");

const getProgress = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const userId = req.user.userId;

    const progress = await gamifiedProgressService.getOrCreateProgress(
      userId,
      subjectId
    );

    logger.info(
      `Progress retrieved for user ${userId} and subject ${subjectId}`
    );
    res.status(StatusCodes.OK).json({
      message: "Progress récupéré avec succès",
      data: progress,
    });
  } catch (error) {
    logger.error("Error getting progress:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Erreur lors de la récupération du progrès",
      error: error.message,
    });
  }
};

const updateMilestone = async (req, res) => {
  try {
    const { subjectId, milestoneId } = req.params;
    const { currentValue } = req.body;
    const userId = req.user.userId;

    const progress = await gamifiedProgressService.updateMilestoneProgress(
      userId,
      subjectId,
      milestoneId,
      currentValue
    );

    logger.info(`Milestone ${milestoneId} updated for user ${userId}`);
    res.status(StatusCodes.OK).json({
      message: "Jalon mis à jour avec succès",
      data: progress,
    });
  } catch (error) {
    logger.error("Error updating milestone:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Erreur lors de la mise à jour du jalon",
      error: error.message,
    });
  }
};

const getUserProgress = async (req, res) => {
  try {
    const userId = req.user.userId;

    const progress = await gamifiedProgressService.getUserProgress(userId);

    logger.info(`All progress retrieved for user ${userId}`);
    res.status(StatusCodes.OK).json({
      message: "Progrès utilisateur récupéré avec succès",
      data: progress,
    });
  } catch (error) {
    logger.error("Error getting user progress:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Erreur lors de la récupération du progrès utilisateur",
      error: error.message,
    });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const leaderboard = await gamifiedProgressService.getLeaderboard(
      parseInt(limit)
    );

    logger.info("Leaderboard retrieved");
    res.status(StatusCodes.OK).json({
      message: "Classement récupéré avec succès",
      data: leaderboard,
    });
  } catch (error) {
    logger.error("Error getting leaderboard:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Erreur lors de la récupération du classement",
      error: error.message,
    });
  }
};

const getStatistics = async (req, res) => {
  try {
    const statistics = await gamifiedProgressService.getStatistics();

    logger.info("Statistics retrieved");
    res.status(StatusCodes.OK).json({
      message: "Statistiques récupérées avec succès",
      data: statistics,
    });
  } catch (error) {
    logger.error("Error getting statistics:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Erreur lors de la récupération des statistiques",
      error: error.message,
    });
  }
};

module.exports = {
  getProgress,
  updateMilestone,
  getUserProgress,
  getLeaderboard,
  getStatistics,
};