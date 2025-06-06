const { StatusCodes } = require("http-status-codes");
const userAnalyticsService = require("../../services/user/userAnalytics/user.analytics.service");
const createLogger = require("../../services/logging.service");


const logger = createLogger("UserAnalyticsController");

const getUserAnalytics = async (req, res) => {
  try {
    const userId = req.user.userId;
    const analytics = await userAnalyticsService.getOrCreateUserAnalytics(
      userId
    );

    logger.info(`User analytics retrieved for user: ${userId}`);
    res.status(StatusCodes.OK).json({
      message: "Analytiques utilisateur récupérées avec succès",
      data: analytics,
    });
  } catch (error) {
    logger.error("Error getting user analytics:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Erreur lors de la récupération des analytiques",
      error: error.message,
    });
  }
};

const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.userId;
    const dashboardData = await userAnalyticsService.generateDashboardData(
      userId
    );

    logger.info(`Dashboard data generated for user: ${userId}`);
    res.status(StatusCodes.OK).json({
      message: "Données du tableau de bord récupérées avec succès",
      data: dashboardData,
    });
  } catch (error) {
    logger.error("Error getting dashboard data:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Erreur lors de la récupération des données du tableau de bord",
      error: error.message,
    });
  }
};

const getDetailedReport = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate } = req.query;

    const report = await userAnalyticsService.generateDetailedReport(userId, {
      startDate,
      endDate,
    });

    logger.info(`Detailed report generated for user: ${userId}`);
    res.status(StatusCodes.OK).json({
      message: "Rapport détaillé généré avec succès",
      data: report,
    });
  } catch (error) {
    logger.error("Error generating detailed report:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Erreur lors de la génération du rapport détaillé",
      error: error.message,
    });
  }
};

const generateRecommendations = async (req, res) => {
  try {
    const userId = req.user.userId;
    const recommendations = await userAnalyticsService.generateRecommendations(
      userId
    );

    logger.info(`Recommendations generated for user: ${userId}`);
    res.status(StatusCodes.OK).json({
      message: "Recommandations générées avec succès",
      data: recommendations,
    });
  } catch (error) {
    logger.error("Error generating recommendations:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Erreur lors de la génération des recommandations",
      error: error.message,
    });
  }
};

const addDailyStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const dailyStatsData = req.body;

    const updatedAnalytics = await userAnalyticsService.addDailyStats(
      userId,
      dailyStatsData
    );

    logger.info(`Daily stats added for user: ${userId}`);
    res.status(StatusCodes.OK).json({
      message: "Statistiques quotidiennes ajoutées avec succès",
      data: updatedAnalytics,
    });
  } catch (error) {
    logger.error("Error adding daily stats:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Erreur lors de l'ajout des statistiques quotidiennes",
      error: error.message,
    });
  }
};

const updateSubjectStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { subjectId } = req.params;
    const subjectStatsData = req.body;

    const updatedAnalytics = await userAnalyticsService.updateSubjectStats(
      userId,
      subjectId,
      subjectStatsData
    );

    logger.info(
      `Subject stats updated for user: ${userId}, subject: ${subjectId}`
    );
    res.status(StatusCodes.OK).json({
      message: "Statistiques de matière mises à jour avec succès",
      data: updatedAnalytics,
    });
  } catch (error) {
    logger.error("Error updating subject stats:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Erreur lors de la mise à jour des statistiques de matière",
      error: error.message,
    });
  }
};

const updateLearningPatterns = async (req, res) => {
  try {
    const userId = req.user.userId;
    const learningPatternsData = req.body;

    const updatedAnalytics = await userAnalyticsService.updateLearningPatterns(
      userId,
      learningPatternsData
    );

    logger.info(`Learning patterns updated for user: ${userId}`);
    res.status(StatusCodes.OK).json({
      message: "Modèles d'apprentissage mis à jour avec succès",
      data: updatedAnalytics,
    });
  } catch (error) {
    logger.error("Error updating learning patterns:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Erreur lors de la mise à jour des modèles d'apprentissage",
      error: error.message,
    });
  }
};

const updateMastery = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { subjectId } = req.params;
    const masteryData = req.body;

    const updatedAnalytics = await userAnalyticsService.updateMastery(
      userId,
      subjectId,
      masteryData
    );

    logger.info(`Mastery updated for user: ${userId}, subject: ${subjectId}`);
    res.status(StatusCodes.OK).json({
      message: "Niveau de maîtrise mis à jour avec succès",
      data: updatedAnalytics,
    });
  } catch (error) {
    logger.error("Error updating mastery:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Erreur lors de la mise à jour du niveau de maîtrise",
      error: error.message,
    });
  }
};

const updateEfficiency = async (req, res) => {
  try {
    const userId = req.user.userId;
    const efficiencyData = req.body;

    const updatedAnalytics = await userAnalyticsService.updateEfficiency(
      userId,
      efficiencyData
    );

    logger.info(`Efficiency updated for user: ${userId}`);
    res.status(StatusCodes.OK).json({
      message: "Efficacité mise à jour avec succès",
      data: updatedAnalytics,
    });
  } catch (error) {
    logger.error("Error updating efficiency:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Erreur lors de la mise à jour de l'efficacité",
      error: error.message,
    });
  }
};

const getAllUsersAnalytics = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const analytics = await userAnalyticsService.getAllUsersAnalytics({
      page: Number.parseInt(page),
      limit: Number.parseInt(limit),
    });

    logger.info("All users analytics retrieved by admin");
    res.status(StatusCodes.OK).json({
      message: "Analytiques de tous les utilisateurs récupérées avec succès",
      data: analytics,
    });
  } catch (error) {
    logger.error("Error getting all users analytics:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message:
        "Erreur lors de la récupération des analytiques de tous les utilisateurs",
      error: error.message,
    });
  }
};

const getSystemStatistics = async (req, res) => {
  try {
    const statistics = await userAnalyticsService.getSystemStatistics();

    logger.info("System statistics retrieved by admin");
    res.status(StatusCodes.OK).json({
      message: "Statistiques système récupérées avec succès",
      data: statistics,
    });
  } catch (error) {
    logger.error("Error getting system statistics:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Erreur lors de la récupération des statistiques système",
      error: error.message,
    });
  }
};

const getUserAnalyticsById = async (req, res) => {
  try {
    const { userId } = req.params;
    const analytics = await userAnalyticsService.getOrCreateUserAnalytics(
      userId
    );

    logger.info(`User analytics retrieved by admin for user: ${userId}`);
    res.status(StatusCodes.OK).json({
      message: "Analytiques utilisateur récupérées avec succès",
      data: analytics,
    });
  } catch (error) {
    logger.error("Error getting user analytics by ID:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Erreur lors de la récupération des analytiques utilisateur",
      error: error.message,
    });
  }
};

module.exports = {
  getUserAnalytics,
  getDashboardData,
  getDetailedReport,
  generateRecommendations,
  addDailyStats,
  updateSubjectStats,
  updateLearningPatterns,
  updateMastery,
  updateEfficiency,
  getAllUsersAnalytics,
  getSystemStatistics,
  getUserAnalyticsById,
};