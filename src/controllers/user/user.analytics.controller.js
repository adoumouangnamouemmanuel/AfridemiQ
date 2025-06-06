const { StatusCodes } = require("http-status-codes");
const userAnalyticsService = require("../../services/user/userAnalytics/user.analytics.service");
const createLogger = require("../../services/logging.service");

const logger = createLogger("UserAnalyticsController");

// Get or create user analytics
const getUserAnalytics = async (req, res) => {
  try {
    const analytics = await userAnalyticsService.getOrCreateUserAnalytics(
      req.user.userId
    );
    res.status(StatusCodes.OK).json({
      message: "Analyses utilisateur récupérées avec succès",
      data: analytics,
    });
  } catch (error) {
    logger.error("Erreur dans getUserAnalytics", error);
    throw error;
  }
};

// Add daily stats
const addDailyStats = async (req, res) => {
  try {
    const analytics = await userAnalyticsService.addDailyStats(
      req.user.userId,
      req.body
    );
    res.status(StatusCodes.OK).json({
      message: "Statistiques quotidiennes ajoutées avec succès",
      data: analytics,
    });
  } catch (error) {
    logger.error("Erreur dans addDailyStats", error);
    throw error;
  }
};

// Update subject stats
const updateSubjectStats = async (req, res) => {
  try {
    const analytics = await userAnalyticsService.updateSubjectStats(
      req.user.userId,
      req.params.subjectId,
      req.body
    );
    res.status(StatusCodes.OK).json({
      message: "Statistiques de matière mises à jour avec succès",
      data: analytics,
    });
  } catch (error) {
    logger.error("Erreur dans updateSubjectStats", error);
    throw error;
  }
};

// Update learning patterns
const updateLearningPatterns = async (req, res) => {
  try {
    const analytics = await userAnalyticsService.updateLearningPatterns(
      req.user.userId,
      req.body
    );
    res.status(StatusCodes.OK).json({
      message: "Modèles d'apprentissage mis à jour avec succès",
      data: analytics,
    });
  } catch (error) {
    logger.error("Erreur dans updateLearningPatterns", error);
    throw error;
  }
};

// Update mastery levels
const updateMastery = async (req, res) => {
  try {
    const analytics = await userAnalyticsService.updateMastery(
      req.user.userId,
      req.params.subjectId,
      req.body
    );
    res.status(StatusCodes.OK).json({
      message: "Niveaux de maîtrise mis à jour avec succès",
      data: analytics,
    });
  } catch (error) {
    logger.error("Erreur dans updateMastery", error);
    throw error;
  }
};

// Update efficiency metrics
const updateEfficiency = async (req, res) => {
  try {
    const analytics = await userAnalyticsService.updateEfficiency(
      req.user.userId,
      req.body
    );
    res.status(StatusCodes.OK).json({
      message: "Métriques d'efficacité mises à jour avec succès",
      data: analytics,
    });
  } catch (error) {
    logger.error("Erreur dans updateEfficiency", error);
    throw error;
  }
};

// Get dashboard data
const getDashboardData = async (req, res) => {
  try {
    const dashboardData = await userAnalyticsService.getDashboardData(
      req.user.userId
    );
    res.status(StatusCodes.OK).json({
      message: "Données du tableau de bord récupérées avec succès",
      data: dashboardData,
    });
  } catch (error) {
    logger.error("Erreur dans getDashboardData", error);
    throw error;
  }
};

// Get recommendations
const getRecommendations = async (req, res) => {
  try {
    const recommendations = await userAnalyticsService.generateRecommendations(
      req.user.userId
    );
    res.status(StatusCodes.OK).json({
      message: "Recommandations générées avec succès",
      data: recommendations,
    });
  } catch (error) {
    logger.error("Erreur dans getRecommendations", error);
    throw error;
  }
};

// Get detailed report
const getDetailedReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const report = await userAnalyticsService.getDetailedReport(
      req.user.userId,
      startDate,
      endDate
    );
    res.status(StatusCodes.OK).json({
      message: "Rapport détaillé généré avec succès",
      data: report,
    });
  } catch (error) {
    logger.error("Erreur dans getDetailedReport", error);
    throw error;
  }
};

// Admin: Get all users analytics
const getAllUsersAnalytics = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await userAnalyticsService.getAllUsersAnalytics(
      Number.parseInt(page),
      Number.parseInt(limit)
    );
    res.status(StatusCodes.OK).json({
      message: "Analyses de tous les utilisateurs récupérées avec succès",
      data: result.analytics,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error("Erreur dans getAllUsersAnalytics", error);
    throw error;
  }
};

// Admin: Get system statistics
const getSystemStatistics = async (req, res) => {
  try {
    const stats = await userAnalyticsService.getSystemStatistics();
    res.status(StatusCodes.OK).json({
      message: "Statistiques système récupérées avec succès",
      data: stats,
    });
  } catch (error) {
    logger.error("Erreur dans getSystemStatistics", error);
    throw error;
  }
};

// Admin: Get user analytics by ID
const getUserAnalyticsById = async (req, res) => {
  try {
    const analytics = await userAnalyticsService.getOrCreateUserAnalytics(
      req.params.userId
    );
    res.status(StatusCodes.OK).json({
      message: "Analyses utilisateur récupérées avec succès",
      data: analytics,
    });
  } catch (error) {
    logger.error("Erreur dans getUserAnalyticsById", error);
    throw error;
  }
};

module.exports = {
  getUserAnalytics,
  addDailyStats,
  updateSubjectStats,
  updateLearningPatterns,
  updateMastery,
  updateEfficiency,
  getDashboardData,
  getRecommendations,
  getDetailedReport,
  getAllUsersAnalytics,
  getSystemStatistics,
  getUserAnalyticsById,
};
