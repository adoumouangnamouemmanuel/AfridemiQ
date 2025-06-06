const feedbackLoopService = require("../../services/user/feedbackLoop/feedback.loop.service");
const { StatusCodes } = require("http-status-codes");
const createLogger = require("../../services/logging.service");

const logger = createLogger("FeedbackLoopController");

class FeedbackLoopController {
  // Create new feedback loop
  async createFeedbackLoop(req, res) {
    try {
      const userId = req.user.userId;
      const feedbackData = req.body;

      const feedbackLoop = await feedbackLoopService.createFeedbackLoop(
        userId,
        feedbackData
      );

      res.status(StatusCodes.CREATED).json({
        message: "Feedback loop created successfully",
        data: feedbackLoop,
      });
    } catch (error) {
      logger.error("Error creating feedback loop:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error creating feedback loop",
        error: error.message,
      });
    }
  }

  // Add feedback to existing loop
  async addFeedback(req, res) {
    try {
      const userId = req.user.userId;
      const { feedbackLoopId } = req.params;
      const feedbackData = req.body;

      const feedbackLoop = await feedbackLoopService.addFeedback(
        feedbackLoopId,
        userId,
        feedbackData
      );

      res.status(StatusCodes.OK).json({
        message: "Feedback added successfully",
        data: feedbackLoop,
      });
    } catch (error) {
      logger.error("Error adding feedback:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error adding feedback",
        error: error.message,
      });
    }
  }

  // Get user's feedback loops
  async getUserFeedbackLoops(req, res) {
    try {
      const userId = req.user.userId;
      const filters = {
        type: req.query.type,
        status: req.query.status,
        limit: Number.parseInt(req.query.limit) || 50,
        skip: Number.parseInt(req.query.skip) || 0,
      };

      const feedbackLoops = await feedbackLoopService.getUserFeedbackLoops(
        userId,
        filters
      );

      res.status(StatusCodes.OK).json({
        message: "Feedback loops retrieved successfully",
        data: feedbackLoops,
      });
    } catch (error) {
      logger.error("Error getting user feedback loops:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error retrieving feedback loops",
        error: error.message,
      });
    }
  }

  // Get feedback loop by ID
  async getFeedbackLoopById(req, res) {
    try {
      const { feedbackLoopId } = req.params;
      const userId = req.user.userId;

      const feedbackLoop = await feedbackLoopService.getFeedbackLoopById(
        feedbackLoopId
      );

      // Check if user owns this feedback loop or is admin
      if (
        feedbackLoop.userId._id.toString() !== userId &&
        !req.user.roles.includes("admin")
      ) {
        return res.status(StatusCodes.FORBIDDEN).json({
          message: "Access denied",
        });
      }

      res.status(StatusCodes.OK).json({
        message: "Feedback loop retrieved successfully",
        data: feedbackLoop,
      });
    } catch (error) {
      logger.error("Error getting feedback loop by ID:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error retrieving feedback loop",
        error: error.message,
      });
    }
  }

  // Admin: Get all feedback loops
  async getAllFeedbackLoops(req, res) {
    try {
      const filters = {
        type: req.query.type,
        status: req.query.status,
        userId: req.query.userId,
        limit: Number.parseInt(req.query.limit) || 100,
        skip: Number.parseInt(req.query.skip) || 0,
      };

      const feedbackLoops = await feedbackLoopService.getAllFeedbackLoops(
        filters
      );

      res.status(StatusCodes.OK).json({
        message: "All feedback loops retrieved successfully",
        data: feedbackLoops,
      });
    } catch (error) {
      logger.error("Error getting all feedback loops:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error retrieving feedback loops",
        error: error.message,
      });
    }
  }

  // Admin: Respond to feedback
  async respondToFeedback(req, res) {
    try {
      const adminId = req.user.userId;
      const { feedbackLoopId } = req.params;
      const responseData = req.body;

      const feedbackLoop = await feedbackLoopService.respondToFeedback(
        feedbackLoopId,
        adminId,
        responseData
      );

      res.status(StatusCodes.OK).json({
        message: "Response added successfully",
        data: feedbackLoop,
      });
    } catch (error) {
      logger.error("Error responding to feedback:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error responding to feedback",
        error: error.message,
      });
    }
  }

  // Admin: Update feedback status
  async updateFeedbackStatus(req, res) {
    try {
      const { feedbackLoopId } = req.params;
      const { status } = req.body;

      const feedbackLoop = await feedbackLoopService.updateFeedbackStatus(
        feedbackLoopId,
        status
      );

      res.status(StatusCodes.OK).json({
        message: "Feedback status updated successfully",
        data: feedbackLoop,
      });
    } catch (error) {
      logger.error("Error updating feedback status:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error updating feedback status",
        error: error.message,
      });
    }
  }

  // Admin: Get feedback analytics
  async getFeedbackAnalytics(req, res) {
    try {
      const analytics = await feedbackLoopService.getFeedbackAnalytics();

      res.status(StatusCodes.OK).json({
        message: "Feedback analytics retrieved successfully",
        data: analytics,
      });
    } catch (error) {
      logger.error("Error getting feedback analytics:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error retrieving feedback analytics",
        error: error.message,
      });
    }
  }

  // Admin: Get overdue feedback
  async getOverdueFeedback(req, res) {
    try {
      const overdueFeedback =
        await feedbackLoopService.getOverdueFeedbackLoops();

      res.status(StatusCodes.OK).json({
        message: "Overdue feedback retrieved successfully",
        data: overdueFeedback,
      });
    } catch (error) {
      logger.error("Error getting overdue feedback:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error retrieving overdue feedback",
        error: error.message,
      });
    }
  }

  // Delete feedback loop
  async deleteFeedbackLoop(req, res) {
    try {
      const { feedbackLoopId } = req.params;
      const userId = req.user.userId;

      // Get feedback loop to check ownership
      const feedbackLoop = await feedbackLoopService.getFeedbackLoopById(
        feedbackLoopId
      );

      // Check if user owns this feedback loop or is admin
      if (
        feedbackLoop.userId._id.toString() !== userId &&
        !req.user.roles.includes("admin")
      ) {
        return res.status(StatusCodes.FORBIDDEN).json({
          message: "Access denied",
        });
      }

      await feedbackLoopService.deleteFeedbackLoop(feedbackLoopId);

      res.status(StatusCodes.OK).json({
        message: "Feedback loop deleted successfully",
      });
    } catch (error) {
      logger.error("Error deleting feedback loop:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error deleting feedback loop",
        error: error.message,
      });
    }
  }
}

module.exports = new FeedbackLoopController();