const { StatusCodes } = require("http-status-codes");
const leaderboardEntryService = require("../../services/progress/leaderboardEntry/leaderboard.entry.service");
const createLogger = require("../../services/logging.service");

const logger = createLogger("LeaderboardEntryController");

const getGlobalLeaderboard = async (req, res) => {
  try {
    const { limit = 50, series } = req.query;

    const leaderboard = await leaderboardEntryService.getGlobalLeaderboard(
      Number.parseInt(limit),
      series
    );

    logger.info("Global leaderboard retrieved");
    res.status(StatusCodes.OK).json({
      message: "Classement mondial récupéré avec succès",
      data: leaderboard,
    });
  } catch (error) {
    logger.error("Error getting global leaderboard:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Erreur lors de la récupération du classement mondial",
      error: error.message,
    });
  }
};

const getNationalLeaderboard = async (req, res) => {
  try {
    const { country } = req.params;
    const { limit = 50, series } = req.query;

    const leaderboard = await leaderboardEntryService.getNationalLeaderboard(
      country,
      Number.parseInt(limit),
      series
    );

    logger.info(`National leaderboard retrieved for ${country}`);
    res.status(StatusCodes.OK).json({
      message: "Classement national récupéré avec succès",
      data: leaderboard,
    });
  } catch (error) {
    logger.error("Error getting national leaderboard:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Erreur lors de la récupération du classement national",
      error: error.message,
    });
  }
};

const getRegionalLeaderboard = async (req, res) => {
  try {
    const { region } = req.params;
    const { limit = 50, series } = req.query;

    const leaderboard = await leaderboardEntryService.getRegionalLeaderboard(
      region,
      Number.parseInt(limit),
      series
    );

    logger.info(`Regional leaderboard retrieved for ${region}`);
    res.status(StatusCodes.OK).json({
      message: "Classement régional récupéré avec succès",
      data: leaderboard,
    });
  } catch (error) {
    logger.error("Error getting regional leaderboard:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Erreur lors de la récupération du classement régional",
      error: error.message,
    });
  }
};

const getUserRank = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { series } = req.query;

    const rank = await leaderboardEntryService.getUserRank(userId, series);

    if (!rank) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Classement utilisateur non trouvé",
      });
    }

    logger.info(`User rank retrieved for user ${userId}`);
    res.status(StatusCodes.OK).json({
      message: "Classement utilisateur récupéré avec succès",
      data: rank,
    });
  } catch (error) {
    logger.error("Error getting user rank:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Erreur lors de la récupération du classement utilisateur",
      error: error.message,
    });
  }
};

const updateRank = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { series } = req.query;
    const rankData = req.body;

    const entry = await leaderboardEntryService.updateRank(
      userId,
      rankData,
      series
    );

    logger.info(`Rank updated for user ${userId}`);
    res.status(StatusCodes.OK).json({
      message: "Classement mis à jour avec succès",
      data: entry,
    });
  } catch (error) {
    logger.error("Error updating rank:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Erreur lors de la mise à jour du classement",
      error: error.message,
    });
  }
};

const getStatistics = async (req, res) => {
  try {
    const { series } = req.query;

    const statistics = await leaderboardEntryService.getStatistics(series);

    logger.info("Leaderboard statistics retrieved");
    res.status(StatusCodes.OK).json({
      message: "Statistiques du classement récupérées avec succès",
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

const recalculateRanks = async (req, res) => {
  try {
    const { series } = req.query;

    const result = await leaderboardEntryService.recalculateRanks(series);

    logger.info("Ranks recalculated");
    res.status(StatusCodes.OK).json({
      message: "Classements recalculés avec succès",
      data: result,
    });
  } catch (error) {
    logger.error("Error recalculating ranks:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Erreur lors du recalcul des classements",
      error: error.message,
    });
  }
};

module.exports = {
  getGlobalLeaderboard,
  getNationalLeaderboard,
  getRegionalLeaderboard,
  getUserRank,
  updateRank,
  getStatistics,
  recalculateRanks,
};