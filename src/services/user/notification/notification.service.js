const mongoose = require("mongoose");
const { Notification } = require("../../../models/user/notification.model");
const createLogger = require("../../logging.service");

const logger = createLogger("NotificationService");

class NotificationService {
  // Create notification
  async createNotification(notificationData) {
    try {
      const {
        userId,
        type,
        title,
        message,
        priority = "medium",
        actionUrl,
        expiresAt,
        metadata = {},
      } = notificationData;

      const notification = new Notification({
        userId,
        type,
        title,
        message,
        priority,
        actionUrl,
        expiresAt,
        metadata,
      });

      await notification.save();
      await notification.populate("userId", "name email");

      logger.info(`Notification created for user ${userId}: ${title}`);
      return notification;
    } catch (error) {
      logger.error("Error creating notification:", error);
      throw error;
    }
  }

  // Get user notifications
  async getUserNotifications(userId, filters = {}) {
    try {
      const query = { userId };

      if (filters.type) query.type = filters.type;
      if (filters.priority) query.priority = filters.priority;
      if (filters.read !== undefined) query.read = filters.read;
      if (filters.unreadOnly) query.read = false;

      // Don't include expired notifications unless specifically requested
      if (!filters.includeExpired) {
        query.$or = [
          { expiresAt: { $exists: false } },
          { expiresAt: null },
          { expiresAt: { $gt: new Date() } },
        ];
      }

      const notifications = await Notification.find(query)
        .sort({ priority: -1, createdAt: -1 })
        .limit(filters.limit || 50)
        .skip(filters.skip || 0);

      return notifications;
    } catch (error) {
      logger.error("Error getting user notifications:", error);
      throw error;
    }
  }

  // Get notification by ID
  async getNotificationById(notificationId) {
    try {
      const notification = await Notification.findById(notificationId).populate(
        "userId",
        "name email"
      );

      if (!notification) {
        throw new Error("Notification not found");
      }

      return notification;
    } catch (error) {
      logger.error("Error getting notification by ID:", error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        _id: notificationId,
        userId,
      });

      if (!notification) {
        throw new Error("Notification not found");
      }

      notification.read = true;
      await notification.save();

      return notification;
    } catch (error) {
      logger.error("Error marking notification as read:", error);
      throw error;
    }
  }

  // Mark all notifications as read for user
  async markAllAsRead(userId, filters = {}) {
    try {
      const query = { userId, read: false };

      if (filters.type) query.type = filters.type;
      if (filters.priority) query.priority = filters.priority;

      const result = await Notification.updateMany(query, { read: true });

      logger.info(
        `Marked ${result.modifiedCount} notifications as read for user ${userId}`
      );
      return result;
    } catch (error) {
      logger.error("Error marking all notifications as read:", error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(notificationId, userId) {
    try {
      const result = await Notification.findOneAndDelete({
        _id: notificationId,
        userId,
      });

      if (!result) {
        throw new Error("Notification not found");
      }

      return result;
    } catch (error) {
      logger.error("Error deleting notification:", error);
      throw error;
    }
  }

  // Bulk create notifications
  async bulkCreateNotifications(notificationsData) {
    try {
      const notifications = await Notification.insertMany(notificationsData);

      logger.info(`Bulk created ${notifications.length} notifications`);
      return notifications;
    } catch (error) {
      logger.error("Error bulk creating notifications:", error);
      throw error;
    }
  }

  // Get notification statistics for user
  async getUserNotificationStats(userId) {
    try {
      const stats = await Notification.aggregate([
        { $match: { userId: mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            unread: { $sum: { $cond: [{ $eq: ["$read", false] }, 1, 0] } },
            byType: {
              $push: {
                type: "$type",
                read: "$read",
                priority: "$priority",
              },
            },
            byPriority: {
              high: { $sum: { $cond: [{ $eq: ["$priority", "high"] }, 1, 0] } },
              medium: {
                $sum: { $cond: [{ $eq: ["$priority", "medium"] }, 1, 0] },
              },
              low: { $sum: { $cond: [{ $eq: ["$priority", "low"] }, 1, 0] } },
            },
          },
        },
      ]);

      const result = stats[0] || {
        total: 0,
        unread: 0,
        byType: [],
        byPriority: { high: 0, medium: 0, low: 0 },
      };

      // Process type statistics
      const typeStats = {};
      result.byType.forEach((item) => {
        if (!typeStats[item.type]) {
          typeStats[item.type] = { total: 0, unread: 0 };
        }
        typeStats[item.type].total++;
        if (!item.read) typeStats[item.type].unread++;
      });

      result.typeStats = typeStats;
      delete result.byType;

      return result;
    } catch (error) {
      logger.error("Error getting user notification stats:", error);
      throw error;
    }
  }

  // Clean up expired notifications
  async cleanupExpiredNotifications() {
    try {
      const result = await Notification.deleteMany({
        expiresAt: { $lt: new Date() },
      });

      logger.info(`Cleaned up ${result.deletedCount} expired notifications`);
      return result;
    } catch (error) {
      logger.error("Error cleaning up expired notifications:", error);
      throw error;
    }
  }

  // Get system-wide notification analytics (admin)
  async getSystemNotificationAnalytics() {
    try {
      const analytics = await Notification.aggregate([
        {
          $group: {
            _id: null,
            totalNotifications: { $sum: 1 },
            unreadNotifications: {
              $sum: { $cond: [{ $eq: ["$read", false] }, 1, 0] },
            },
            typeDistribution: {
              reminder: {
                $sum: { $cond: [{ $eq: ["$type", "reminder"] }, 1, 0] },
              },
              achievement: {
                $sum: { $cond: [{ $eq: ["$type", "achievement"] }, 1, 0] },
              },
              study_group: {
                $sum: { $cond: [{ $eq: ["$type", "study_group"] }, 1, 0] },
              },
              system: { $sum: { $cond: [{ $eq: ["$type", "system"] }, 1, 0] } },
            },
            priorityDistribution: {
              high: { $sum: { $cond: [{ $eq: ["$priority", "high"] }, 1, 0] } },
              medium: {
                $sum: { $cond: [{ $eq: ["$priority", "medium"] }, 1, 0] },
              },
              low: { $sum: { $cond: [{ $eq: ["$priority", "low"] }, 1, 0] } },
            },
          },
        },
      ]);

      // Get recent notification trends
      const recentTrends = await Notification.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: {
              date: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
              type: "$type",
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.date": -1 } },
      ]);

      const result = analytics[0] || {
        totalNotifications: 0,
        unreadNotifications: 0,
        typeDistribution: {
          reminder: 0,
          achievement: 0,
          study_group: 0,
          system: 0,
        },
        priorityDistribution: { high: 0, medium: 0, low: 0 },
      };

      result.recentTrends = recentTrends;
      result.readRate =
        result.totalNotifications > 0
          ? Math.round(
              ((result.totalNotifications - result.unreadNotifications) /
                result.totalNotifications) *
                100
            )
          : 0;

      return result;
    } catch (error) {
      logger.error("Error getting system notification analytics:", error);
      throw error;
    }
  }

  // Send notification to multiple users
  async sendBulkNotification(userIds, notificationData) {
    try {
      const notifications = userIds.map((userId) => ({
        ...notificationData,
        userId,
      }));

      const result = await this.bulkCreateNotifications(notifications);
      return result;
    } catch (error) {
      logger.error("Error sending bulk notification:", error);
      throw error;
    }
  }
}

module.exports = new NotificationService();