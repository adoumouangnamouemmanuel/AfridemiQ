const { StatusCodes } = require("http-status-codes");
const dashboardService = require("../../services/user/dashboard/dashboard.service");
const createLogger = require("../../services/logging.service");

const logger = createLogger("DashboardController");

const dashboardController = {
  // Get user dashboard
  async getDashboard(req, res) {
    try {
      const userId = req.user.userId;
      const dashboard = await dashboardService.getOrCreateDashboard(userId);

      res.status(StatusCodes.OK).json({
        message: "Dashboard retrieved successfully",
        data: dashboard,
      });
    } catch (error) {
      logger.error("Error getting dashboard:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error retrieving dashboard",
        error: error.message,
      });
    }
  },

  // Update upcoming exams
  async updateUpcomingExams(req, res) {
    try {
      const userId = req.user.userId;
      const { exams } = req.body;

      const dashboard = await dashboardService.updateUpcomingExams(
        userId,
        exams
      );

      res.status(StatusCodes.OK).json({
        message: "Upcoming exams updated successfully",
        data: dashboard,
      });
    } catch (error) {
      logger.error("Error updating upcoming exams:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error updating upcoming exams",
        error: error.message,
      });
    }
  },

  // Add recent quiz
  async addRecentQuiz(req, res) {
    try {
      const userId = req.user.userId;
      const quizData = req.body;

      const dashboard = await dashboardService.addRecentQuiz(userId, quizData);

      res.status(StatusCodes.OK).json({
        message: "Recent quiz added successfully",
        data: dashboard,
      });
    } catch (error) {
      logger.error("Error adding recent quiz:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error adding recent quiz",
        error: error.message,
      });
    }
  },

  // Update recommended topics
  async updateRecommendedTopics(req, res) {
    try {
      const userId = req.user.userId;
      const { topicIds } = req.body;

      const dashboard = await dashboardService.updateRecommendedTopics(
        userId,
        topicIds
      );

      res.status(StatusCodes.OK).json({
        message: "Recommended topics updated successfully",
        data: dashboard,
      });
    } catch (error) {
      logger.error("Error updating recommended topics:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error updating recommended topics",
        error: error.message,
      });
    }
  },

  // Update study streak
  async updateStreak(req, res) {
    try {
      const userId = req.user.userId;
      const { streak } = req.body;

      const dashboard = await dashboardService.updateStreak(userId, streak);

      res.status(StatusCodes.OK).json({
        message: "Study streak updated successfully",
        data: dashboard,
      });
    } catch (error) {
      logger.error("Error updating study streak:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error updating study streak",
        error: error.message,
      });
    }
  },

  // Add notification
  async addNotification(req, res) {
    try {
      const userId = req.user.userId;
      const { notificationId } = req.body;

      const dashboard = await dashboardService.addNotification(
        userId,
        notificationId
      );

      res.status(StatusCodes.OK).json({
        message: "Notification added successfully",
        data: dashboard,
      });
    } catch (error) {
      logger.error("Error adding notification:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error adding notification",
        error: error.message,
      });
    }
  },

  // Remove notification
  async removeNotification(req, res) {
    try {
      const userId = req.user.userId;
      const { notificationId } = req.params;

      const dashboard = await dashboardService.removeNotification(
        userId,
        notificationId
      );

      res.status(StatusCodes.OK).json({
        message: "Notification removed successfully",
        data: dashboard,
      });
    } catch (error) {
      logger.error("Error removing notification:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error removing notification",
        error: error.message,
      });
    }
  },

  // Get dashboard statistics
  async getStatistics(req, res) {
    try {
      const userId = req.user.userId;
      const statistics = await dashboardService.getDashboardStatistics(userId);

      res.status(StatusCodes.OK).json({
        message: "Dashboard statistics retrieved successfully",
        data: statistics,
      });
    } catch (error) {
      logger.error("Error getting dashboard statistics:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error retrieving dashboard statistics",
        error: error.message,
      });
    }
  },

  // Clear old data
  async clearOldData(req, res) {
    try {
      const userId = req.user.userId;
      const days = Number.parseInt(req.query.days) || 30;

      const dashboard = await dashboardService.clearOldData(userId, days);

      res.status(StatusCodes.OK).json({
        message: "Old data cleared successfully",
        data: dashboard,
      });
    } catch (error) {
      logger.error("Error clearing old data:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error clearing old data",
        error: error.message,
      });
    }
  },
};

module.exports = dashboardController;