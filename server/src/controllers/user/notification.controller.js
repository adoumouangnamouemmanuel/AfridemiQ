const notificationService = require("../../services/user/notification/notification.service");
const { StatusCodes } = require("http-status-codes");
const createLogger = require("../../services/logging.service");

const logger = createLogger("NotificationController");

class NotificationController {
  // Get user notifications
  async getUserNotifications(req, res) {
    try {
      const userId = req.user.userId;
      const filters = {
        type: req.query.type,
        priority: req.query.priority,
        read:
          req.query.read === "true"
            ? true
            : req.query.read === "false"
            ? false
            : undefined,
        unreadOnly: req.query.unreadOnly === "true",
        includeExpired: req.query.includeExpired === "true",
        limit: Number.parseInt(req.query.limit) || 50,
        skip: Number.parseInt(req.query.skip) || 0,
      };

      const notifications = await notificationService.getUserNotifications(
        userId,
        filters
      );

      res.status(StatusCodes.OK).json({
        message: "Notifications retrieved successfully",
        data: notifications,
      });
    } catch (error) {
      logger.error("Error getting user notifications:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error retrieving notifications",
        error: error.message,
      });
    }
  }

  // Get notification by ID
  async getNotificationById(req, res) {
    try {
      const { notificationId } = req.params;
      const userId = req.user.userId;

      // Handle special routes
      if (notificationId === 'read-all') {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "Invalid notification ID",
        });
      }

      const notification = await notificationService.getNotificationById(
        notificationId
      );

      // Check if user owns this notification or is admin
      if (
        notification.userId._id.toString() !== userId &&
        !req.user.roles.includes("admin")
      ) {
        return res.status(StatusCodes.FORBIDDEN).json({
          message: "Access denied",
        });
      }

      res.status(StatusCodes.OK).json({
        message: "Notification retrieved successfully",
        data: notification,
      });
    } catch (error) {
      logger.error("Error getting notification by ID:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error retrieving notification",
        error: error.message,
      });
    }
  }

  // Mark notification as read
  async markAsRead(req, res) {
    try {
      const { notificationId } = req.params;
      const userId = req.user.userId;

      const notification = await notificationService.markAsRead(
        notificationId,
        userId
      );

      res.status(StatusCodes.OK).json({
        message: "Notification marked as read",
        data: notification,
      });
    } catch (error) {
      logger.error("Error marking notification as read:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error marking notification as read",
        error: error.message,
      });
    }
  }

  // Mark all notifications as read
  async markAllAsRead(req, res) {
    try {
      const userId = req.user.userId;
      const filters = {
        type: req.query.type,
        priority: req.query.priority,
      };

      const result = await notificationService.markAllAsRead(userId, filters);

      res.status(StatusCodes.OK).json({
        message: "All notifications marked as read",
        data: { modifiedCount: result.modifiedCount },
      });
    } catch (error) {
      logger.error("Error marking all notifications as read:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error marking notifications as read",
        error: error.message,
      });
    }
  }

  // Delete notification
  async deleteNotification(req, res) {
    try {
      const { notificationId } = req.params;
      const userId = req.user.userId;

      await notificationService.deleteNotification(notificationId, userId);

      res.status(StatusCodes.OK).json({
        message: "Notification deleted successfully",
      });
    } catch (error) {
      logger.error("Error deleting notification:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error deleting notification",
        error: error.message,
      });
    }
  }

  // Get user notification statistics
  async getUserNotificationStats(req, res) {
    try {
      const userId = req.user.userId;

      const stats = await notificationService.getUserNotificationStats(userId);

      res.status(StatusCodes.OK).json({
        message: "Notification statistics retrieved successfully",
        data: stats,
      });
    } catch (error) {
      logger.error("Error getting user notification stats:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error retrieving notification statistics",
        error: error.message,
      });
    }
  }

  // Admin: Create notification
  async createNotification(req, res) {
    try {
      const notificationData = req.body;

      const notification = await notificationService.createNotification(
        notificationData
      );

      res.status(StatusCodes.CREATED).json({
        message: "Notification created successfully",
        data: notification,
      });
    } catch (error) {
      logger.error("Error creating notification:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error creating notification",
        error: error.message,
      });
    }
  }

  // Admin: Send bulk notification
  async sendBulkNotification(req, res) {
    try {
      const { userIds, ...notificationData } = req.body;

      const notifications = await notificationService.sendBulkNotification(
        userIds,
        notificationData
      );

      res.status(StatusCodes.CREATED).json({
        message: "Bulk notifications sent successfully",
        data: { count: notifications.length },
      });
    } catch (error) {
      logger.error("Error sending bulk notification:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error sending bulk notifications",
        error: error.message,
      });
    }
  }

  // Admin: Get system notification analytics
  async getSystemNotificationAnalytics(req, res) {
    try {
      const analytics =
        await notificationService.getSystemNotificationAnalytics();

      res.status(StatusCodes.OK).json({
        message: "System notification analytics retrieved successfully",
        data: analytics,
      });
    } catch (error) {
      logger.error("Error getting system notification analytics:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error retrieving system analytics",
        error: error.message,
      });
    }
  }

  // Admin: Cleanup expired notifications
  async cleanupExpiredNotifications(req, res) {
    try {
      const result = await notificationService.cleanupExpiredNotifications();

      res.status(StatusCodes.OK).json({
        message: "Expired notifications cleaned up successfully",
        data: { deletedCount: result.deletedCount },
      });
    } catch (error) {
      logger.error("Error cleaning up expired notifications:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error cleaning up notifications",
        error: error.message,
      });
    }
  }
}

module.exports = new NotificationController();