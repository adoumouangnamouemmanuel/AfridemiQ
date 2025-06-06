const { StatusCodes } = require("http-status-codes");
const achievementService = require("../../services/user/achievement/achievement.service");
const createLogger = require("../../services/logging.service");

const logger = createLogger("AchievementController");

const achievementController = {
  // Get user achievements
  async getUserAchievements(req, res) {
    try {
      const userId = req.user.userId;
      const filters = {
        subjectId: req.query.subjectId,
        series: req.query.series,
        completed: req.query.completed,
      };

      const achievements = await achievementService.getUserAchievements(
        userId,
        filters
      );

      res.status(StatusCodes.OK).json({
        message: "Achievements retrieved successfully",
        data: achievements,
      });
    } catch (error) {
      logger.error("Error getting user achievements:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error retrieving achievements",
        error: error.message,
      });
    }
  },

  // Create achievement (admin only)
  async createAchievement(req, res) {
    try {
      const achievement = await achievementService.createAchievement(req.body);

      res.status(StatusCodes.CREATED).json({
        message: "Achievement created successfully",
        data: achievement,
      });
    } catch (error) {
      logger.error("Error creating achievement:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error creating achievement",
        error: error.message,
      });
    }
  },

  // Update achievement progress
  async updateProgress(req, res) {
    try {
      const { id } = req.params;
      const { progress } = req.body;

      const achievement = await achievementService.updateProgress(id, progress);

      res.status(StatusCodes.OK).json({
        message: "Achievement progress updated successfully",
        data: achievement,
      });
    } catch (error) {
      logger.error("Error updating achievement progress:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error updating achievement progress",
        error: error.message,
      });
    }
  },

  // Get achievement statistics
  async getStatistics(req, res) {
    try {
      const userId = req.user.userId;
      const statistics = await achievementService.getAchievementStatistics(
        userId
      );

      res.status(StatusCodes.OK).json({
        message: "Achievement statistics retrieved successfully",
        data: statistics,
      });
    } catch (error) {
      logger.error("Error getting achievement statistics:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error retrieving achievement statistics",
        error: error.message,
      });
    }
  },

  // Get achievement by ID
  async getAchievementById(req, res) {
    try {
      const { id } = req.params;
      const achievement = await achievementService.getAchievementById(id);

      res.status(StatusCodes.OK).json({
        message: "Achievement retrieved successfully",
        data: achievement,
      });
    } catch (error) {
      logger.error("Error getting achievement by ID:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error retrieving achievement",
        error: error.message,
      });
    }
  },

  // Update achievement (admin only)
  async updateAchievement(req, res) {
    try {
      const { id } = req.params;
      const achievement = await achievementService.updateAchievement(
        id,
        req.body
      );

      res.status(StatusCodes.OK).json({
        message: "Achievement updated successfully",
        data: achievement,
      });
    } catch (error) {
      logger.error("Error updating achievement:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error updating achievement",
        error: error.message,
      });
    }
  },

  // Delete achievement (admin only)
  async deleteAchievement(req, res) {
    try {
      const { id } = req.params;
      await achievementService.deleteAchievement(id);

      res.status(StatusCodes.OK).json({
        message: "Achievement deleted successfully",
      });
    } catch (error) {
      logger.error("Error deleting achievement:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error deleting achievement",
        error: error.message,
      });
    }
  },

  // Get achievements by subject
  async getAchievementsBySubject(req, res) {
    try {
      const { subjectId } = req.params;
      const userId = req.user.userId;

      const achievements = await achievementService.getAchievementsBySubject(
        subjectId,
        userId
      );

      res.status(StatusCodes.OK).json({
        message: "Subject achievements retrieved successfully",
        data: achievements,
      });
    } catch (error) {
      logger.error("Error getting achievements by subject:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error retrieving subject achievements",
        error: error.message,
      });
    }
  },

  // Get recent achievements
  async getRecentAchievements(req, res) {
    try {
      const userId = req.user.userId;
      const limit = Number.parseInt(req.query.limit) || 5;

      const achievements = await achievementService.getRecentAchievements(
        userId,
        limit
      );

      res.status(StatusCodes.OK).json({
        message: "Recent achievements retrieved successfully",
        data: achievements,
      });
    } catch (error) {
      logger.error("Error getting recent achievements:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error retrieving recent achievements",
        error: error.message,
      });
    }
  },
};

module.exports = achievementController;