const { FeedbackLoop } = require("../../../models/user/feedback.loop.model");
const createLogger = require("../../logging.service");

const logger = createLogger("FeedbackLoopService");

class FeedbackLoopService {
  // Create new feedback loop
  async createFeedbackLoop(userId, feedbackData) {
    try {
      const { type, rating, comments, attachments = [] } = feedbackData;

      const feedbackLoop = new FeedbackLoop({
        userId,
        type,
        feedback: [
          {
            userId,
            rating,
            comments,
            createdAt: new Date(),
          },
        ],
        status: "pending",
        attachments,
      });

      await feedbackLoop.save();
      await feedbackLoop.populate("userId", "name email");

      logger.info(`New feedback loop created by user ${userId} for ${type}`);
      return feedbackLoop;
    } catch (error) {
      logger.error("Error creating feedback loop:", error);
      throw error;
    }
  }

  // Add feedback to existing loop
  async addFeedback(feedbackLoopId, userId, feedbackData) {
    try {
      const { rating, comments } = feedbackData;

      const feedbackLoop = await FeedbackLoop.findById(feedbackLoopId);
      if (!feedbackLoop) {
        throw new Error("Feedback loop not found");
      }

      feedbackLoop.feedback.push({
        userId,
        rating,
        comments,
        createdAt: new Date(),
      });

      // Update status if it was resolved
      if (feedbackLoop.status === "resolved") {
        feedbackLoop.status = "reviewed";
      }

      await feedbackLoop.save();
      await feedbackLoop.populate("userId", "name email");

      return feedbackLoop;
    } catch (error) {
      logger.error("Error adding feedback:", error);
      throw error;
    }
  }

  // Get user's feedback loops
  async getUserFeedbackLoops(userId, filters = {}) {
    try {
      const query = { userId };

      if (filters.type) query.type = filters.type;
      if (filters.status) query.status = filters.status;

      const feedbackLoops = await FeedbackLoop.find(query)
        .populate("userId", "name email")
        .populate("response.adminId", "name email")
        .sort({ createdAt: -1 })
        .limit(filters.limit || 50)
        .skip(filters.skip || 0);

      return feedbackLoops;
    } catch (error) {
      logger.error("Error getting user feedback loops:", error);
      throw error;
    }
  }

  // Get all feedback loops (admin)
  async getAllFeedbackLoops(filters = {}) {
    try {
      const query = {};

      if (filters.type) query.type = filters.type;
      if (filters.status) query.status = filters.status;
      if (filters.userId) query.userId = filters.userId;

      const feedbackLoops = await FeedbackLoop.find(query)
        .populate("userId", "name email")
        .populate("response.adminId", "name email")
        .sort({ createdAt: -1 })
        .limit(filters.limit || 100)
        .skip(filters.skip || 0);

      return feedbackLoops;
    } catch (error) {
      logger.error("Error getting all feedback loops:", error);
      throw error;
    }
  }

  // Get feedback loop by ID
  async getFeedbackLoopById(feedbackLoopId) {
    try {
      const feedbackLoop = await FeedbackLoop.findById(feedbackLoopId)
        .populate("userId", "name email")
        .populate("response.adminId", "name email")
        .populate("feedback.userId", "name email");

      if (!feedbackLoop) {
        throw new Error("Feedback loop not found");
      }

      return feedbackLoop;
    } catch (error) {
      logger.error("Error getting feedback loop by ID:", error);
      throw error;
    }
  }

  // Admin response to feedback
  async respondToFeedback(feedbackLoopId, adminId, responseData) {
    try {
      const { message, status = "reviewed" } = responseData;

      const feedbackLoop = await FeedbackLoop.findById(feedbackLoopId);
      if (!feedbackLoop) {
        throw new Error("Feedback loop not found");
      }

      feedbackLoop.response = {
        adminId,
        message,
        date: new Date(),
      };
      feedbackLoop.status = status;

      await feedbackLoop.save();
      await feedbackLoop.populate("userId", "name email");
      await feedbackLoop.populate("response.adminId", "name email");

      logger.info(
        `Admin ${adminId} responded to feedback loop ${feedbackLoopId}`
      );
      return feedbackLoop;
    } catch (error) {
      logger.error("Error responding to feedback:", error);
      throw error;
    }
  }

  // Update feedback loop status
  async updateFeedbackStatus(feedbackLoopId, status) {
    try {
      const feedbackLoop = await FeedbackLoop.findById(feedbackLoopId);
      if (!feedbackLoop) {
        throw new Error("Feedback loop not found");
      }

      feedbackLoop.status = status;
      await feedbackLoop.save();

      return feedbackLoop;
    } catch (error) {
      logger.error("Error updating feedback status:", error);
      throw error;
    }
  }

  // Get feedback analytics
  async getFeedbackAnalytics() {
    try {
      const analytics = await FeedbackLoop.aggregate([
        {
          $group: {
            _id: null,
            totalFeedback: { $sum: 1 },
            pendingCount: {
              $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
            },
            reviewedCount: {
              $sum: { $cond: [{ $eq: ["$status", "reviewed"] }, 1, 0] },
            },
            resolvedCount: {
              $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] },
            },
            averageRating: { $avg: { $avg: "$feedback.rating" } },
            typeDistribution: {
              question: {
                $sum: { $cond: [{ $eq: ["$type", "question"] }, 1, 0] },
              },
              exercise: {
                $sum: { $cond: [{ $eq: ["$type", "exercise"] }, 1, 0] },
              },
              lesson: {
                $sum: { $cond: [{ $eq: ["$type", "lesson"] }, 1, 0] },
              },
              platform: {
                $sum: { $cond: [{ $eq: ["$type", "platform"] }, 1, 0] },
              },
            },
          },
        },
      ]);

      // Get overdue feedback
      const overdueFeedback = await FeedbackLoop.find({
        status: { $ne: "resolved" },
        createdAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }).countDocuments();

      const result = analytics[0] || {
        totalFeedback: 0,
        pendingCount: 0,
        reviewedCount: 0,
        resolvedCount: 0,
        averageRating: 0,
        typeDistribution: { question: 0, exercise: 0, lesson: 0, platform: 0 },
      };

      result.overdueFeedback = overdueFeedback;
      result.responseRate =
        result.totalFeedback > 0
          ? Math.round(
              ((result.reviewedCount + result.resolvedCount) /
                result.totalFeedback) *
                100
            )
          : 0;

      return result;
    } catch (error) {
      logger.error("Error getting feedback analytics:", error);
      throw error;
    }
  }

  // Delete feedback loop
  async deleteFeedbackLoop(feedbackLoopId) {
    try {
      const result = await FeedbackLoop.findByIdAndDelete(feedbackLoopId);
      if (!result) {
        throw new Error("Feedback loop not found");
      }
      return result;
    } catch (error) {
      logger.error("Error deleting feedback loop:", error);
      throw error;
    }
  }

  // Get overdue feedback loops
  async getOverdueFeedbackLoops() {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const overdueFeedback = await FeedbackLoop.find({
        status: { $ne: "resolved" },
        createdAt: { $lt: sevenDaysAgo },
      })
        .populate("userId", "name email")
        .sort({ createdAt: 1 });

      return overdueFeedback;
    } catch (error) {
      logger.error("Error getting overdue feedback loops:", error);
      throw error;
    }
  }
}

module.exports = new FeedbackLoopService();