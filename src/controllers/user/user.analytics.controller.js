const userAnalyticsService = require("../services/user/userAnalytics/userAnalytics.service");
const asyncHandler = require("../../utils/asyncHandler");
const { successResponse } = require("../../utils/responseHandler");

class UserAnalyticsController {
  // Get user analytics
  getUserAnalytics = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const analytics = await userAnalyticsService.getOrCreateUserAnalytics(
      userId
    );

    successResponse(
      res,
      analytics,
      "Analytiques utilisateur récupérées avec succès"
    );
  });

  // Add daily stats
  addDailyStats = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const analytics = await userAnalyticsService.addDailyStats(
      userId,
      req.body
    );

    successResponse(
      res,
      analytics,
      "Statistiques quotidiennes ajoutées avec succès"
    );
  });

  // Update subject stats
  updateSubjectStats = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { subjectId } = req.params;
    const analytics = await userAnalyticsService.updateSubjectStats(
      userId,
      subjectId,
      req.body
    );

    successResponse(
      res,
      analytics,
      "Statistiques de matière mises à jour avec succès"
    );
  });

  // Update learning patterns
  updateLearningPatterns = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const analytics = await userAnalyticsService.updateLearningPatterns(
      userId,
      req.body
    );

    successResponse(
      res,
      analytics,
      "Modèles d'apprentissage mis à jour avec succès"
    );
  });

  // Update mastery levels
  updateMastery = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { subjectId } = req.params;
    const analytics = await userAnalyticsService.updateMastery(
      userId,
      subjectId,
      req.body
    );

    successResponse(
      res,
      analytics,
      "Niveaux de maîtrise mis à jour avec succès"
    );
  });

  // Update efficiency metrics
  updateEfficiency = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const analytics = await userAnalyticsService.updateEfficiency(
      userId,
      req.body
    );

    successResponse(
      res,
      analytics,
      "Métriques d'efficacité mises à jour avec succès"
    );
  });

  // Get dashboard data
  getDashboardData = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const dashboardData = await userAnalyticsService.getDashboardData(userId);

    successResponse(
      res,
      dashboardData,
      "Données du tableau de bord récupérées avec succès"
    );
  });

  // Generate recommendations
  generateRecommendations = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const recommendations = await userAnalyticsService.generateRecommendations(
      userId
    );

    successResponse(
      res,
      recommendations,
      "Recommandations générées avec succès"
    );
  });

  // Get detailed report
  getDetailedReport = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;
    const report = await userAnalyticsService.getDetailedReport(
      userId,
      startDate,
      endDate
    );

    successResponse(res, report, "Rapport détaillé généré avec succès");
  });

  // Admin: Get all users analytics
  getAllUsersAnalytics = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const result = await userAnalyticsService.getAllUsersAnalytics(
      Number.parseInt(page),
      Number.parseInt(limit)
    );

    successResponse(
      res,
      result,
      "Analytiques de tous les utilisateurs récupérées avec succès"
    );
  });

  // Admin: Get system statistics
  getSystemStatistics = asyncHandler(async (req, res) => {
    const statistics = await userAnalyticsService.getSystemStatistics();

    successResponse(
      res,
      statistics,
      "Statistiques système récupérées avec succès"
    );
  });

  // Admin: Get specific user analytics
  getUserAnalyticsById = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const analytics = await userAnalyticsService.getOrCreateUserAnalytics(
      userId
    );

    successResponse(
      res,
      analytics,
      "Analytiques utilisateur récupérées avec succès"
    );
  });
}

module.exports = new UserAnalyticsController();