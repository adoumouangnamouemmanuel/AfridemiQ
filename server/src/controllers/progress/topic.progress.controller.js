const topicProgressService = require("../../services/progress/topicProgress/topic.progress.service");
const { StatusCodes } = require("http-status-codes");
const createLogger = require("../../services/logging.service");

const logger = createLogger("TopicProgressController");

class TopicProgressController {
  // Get user's topic progress
  async getUserTopicProgress(req, res) {
    try {
      const userId = req.user.userId;
      const filters = {
        series: req.query.series,
        masteryLevel: req.query.masteryLevel,
        topicId: req.query.topicId,
        limit: Number.parseInt(req.query.limit) || 50,
        skip: Number.parseInt(req.query.skip) || 0,
      };

      const progress = await topicProgressService.getUserTopicProgress(
        userId,
        filters
      );

      res.status(StatusCodes.OK).json({
        message: "Topic progress retrieved successfully",
        data: progress,
      });
    } catch (error) {
      logger.error("Error getting user topic progress:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error retrieving topic progress",
        error: error.message,
      });
    }
  }

  // Get specific topic progress
  async getTopicProgress(req, res) {
    try {
      const userId = req.user.userId;
      const { topicId } = req.params;

      const progress = await topicProgressService.getOrCreateTopicProgress(
        userId,
        topicId
      );

      res.status(StatusCodes.OK).json({
        message: "Topic progress retrieved successfully",
        data: progress,
      });
    } catch (error) {
      logger.error("Error getting topic progress:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error retrieving topic progress",
        error: error.message,
      });
    }
  }

  // Record practice session
  async recordPracticeSession(req, res) {
    try {
      const userId = req.user.userId;
      const { topicId } = req.params;
      const sessionData = req.body;

      const progress = await topicProgressService.recordPracticeSession(
        userId,
        topicId,
        sessionData
      );

      res.status(StatusCodes.OK).json({
        message: "Practice session recorded successfully",
        data: progress,
      });
    } catch (error) {
      logger.error("Error recording practice session:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error recording practice session",
        error: error.message,
      });
    }
  }

  // Get topic progress analytics
  async getTopicAnalytics(req, res) {
    try {
      const userId = req.user.userId;
      const { topicId } = req.params;

      const analytics = await topicProgressService.getTopicProgressAnalytics(
        userId,
        topicId
      );

      if (!analytics) {
        return res.status(StatusCodes.NOT_FOUND).json({
          message: "Topic progress not found",
        });
      }

      res.status(StatusCodes.OK).json({
        message: "Topic analytics retrieved successfully",
        data: analytics,
      });
    } catch (error) {
      logger.error("Error getting topic analytics:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error retrieving topic analytics",
        error: error.message,
      });
    }
  }

  // Get user's overall progress statistics
  async getUserProgressStatistics(req, res) {
    try {
      const userId = req.user.userId;

      const statistics = await topicProgressService.getUserProgressStatistics(
        userId
      );

      res.status(StatusCodes.OK).json({
        message: "User progress statistics retrieved successfully",
        data: statistics,
      });
    } catch (error) {
      logger.error("Error getting user progress statistics:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error retrieving progress statistics",
        error: error.message,
      });
    }
  }

  // Update areas of focus
  async updateAreasOfFocus(req, res) {
    try {
      const userId = req.user.userId;
      const { topicId } = req.params;
      const { weakAreas, strongAreas } = req.body;

      const progress = await topicProgressService.updateAreasOfFocus(
        userId,
        topicId,
        {
          weakAreas,
          strongAreas,
        }
      );

      res.status(StatusCodes.OK).json({
        message: "Areas of focus updated successfully",
        data: progress,
      });
    } catch (error) {
      logger.error("Error updating areas of focus:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error updating areas of focus",
        error: error.message,
      });
    }
  }

  // Delete topic progress
  async deleteTopicProgress(req, res) {
    try {
      const userId = req.user.userId;
      const { topicId } = req.params;

      await topicProgressService.deleteTopicProgress(userId, topicId);

      res.status(StatusCodes.OK).json({
        message: "Topic progress deleted successfully",
      });
    } catch (error) {
      logger.error("Error deleting topic progress:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error deleting topic progress",
        error: error.message,
      });
    }
  }
}

module.exports = new TopicProgressController();