const { Dashboard } = require("../../../models/user/dashboard.model");
const createLogger = require("../../services/logging.service");

const logger = createLogger("DashboardService");

class DashboardService {
  // Get or create user dashboard
  async getOrCreateDashboard(userId) {
    try {
      let dashboard = await Dashboard.findOne({ userId })
        .populate("upcomingExams.examId", "title date series")
        .populate("recentQuizzes.quizId", "title")
        .populate("recommendedTopics", "name description difficulty")
        .populate("notifications", "title message type createdAt");

      if (!dashboard) {
        dashboard = new Dashboard({ userId });
        await dashboard.save();
        logger.info(`Dashboard created for user: ${userId}`);
      }

      return dashboard;
    } catch (error) {
      logger.error("Error getting or creating dashboard:", error);
      throw error;
    }
  }

  // Update upcoming exams
  async updateUpcomingExams(userId, exams) {
    try {
      const dashboard = await Dashboard.findOneAndUpdate(
        { userId },
        { upcomingExams: exams },
        { new: true, upsert: true }
      ).populate("upcomingExams.examId", "title date series");

      logger.info(`Upcoming exams updated for user: ${userId}`);
      return dashboard;
    } catch (error) {
      logger.error("Error updating upcoming exams:", error);
      throw error;
    }
  }

  // Add recent quiz
  async addRecentQuiz(userId, quizData) {
    try {
      const dashboard = await Dashboard.findOne({ userId });

      if (!dashboard) {
        throw new Error("Dashboard not found");
      }

      // Add new quiz to the beginning of the array
      dashboard.recentQuizzes.unshift(quizData);

      // Keep only the last 10 quizzes
      if (dashboard.recentQuizzes.length > 10) {
        dashboard.recentQuizzes = dashboard.recentQuizzes.slice(0, 10);
      }

      await dashboard.save();
      await dashboard.populate("recentQuizzes.quizId", "title");

      logger.info(`Recent quiz added for user: ${userId}`);
      return dashboard;
    } catch (error) {
      logger.error("Error adding recent quiz:", error);
      throw error;
    }
  }

  // Update recommended topics
  async updateRecommendedTopics(userId, topicIds) {
    try {
      const dashboard = await Dashboard.findOneAndUpdate(
        { userId },
        { recommendedTopics: topicIds },
        { new: true, upsert: true }
      ).populate("recommendedTopics", "name description difficulty");

      logger.info(`Recommended topics updated for user: ${userId}`);
      return dashboard;
    } catch (error) {
      logger.error("Error updating recommended topics:", error);
      throw error;
    }
  }

  // Update study streak
  async updateStreak(userId, streak) {
    try {
      const dashboard = await Dashboard.findOneAndUpdate(
        { userId },
        { streak },
        { new: true, upsert: true }
      );

      logger.info(`Study streak updated for user: ${userId} - ${streak} days`);
      return dashboard;
    } catch (error) {
      logger.error("Error updating study streak:", error);
      throw error;
    }
  }

  // Add notification
  async addNotification(userId, notificationId) {
    try {
      const dashboard = await Dashboard.findOne({ userId });

      if (!dashboard) {
        throw new Error("Dashboard not found");
      }

      // Add notification if not already present
      if (!dashboard.notifications.includes(notificationId)) {
        dashboard.notifications.unshift(notificationId);

        // Keep only the last 20 notifications
        if (dashboard.notifications.length > 20) {
          dashboard.notifications = dashboard.notifications.slice(0, 20);
        }

        await dashboard.save();
      }

      logger.info(`Notification added for user: ${userId}`);
      return dashboard;
    } catch (error) {
      logger.error("Error adding notification:", error);
      throw error;
    }
  }

  // Remove notification
  async removeNotification(userId, notificationId) {
    try {
      const dashboard = await Dashboard.findOneAndUpdate(
        { userId },
        { $pull: { notifications: notificationId } },
        { new: true }
      );

      logger.info(`Notification removed for user: ${userId}`);
      return dashboard;
    } catch (error) {
      logger.error("Error removing notification:", error);
      throw error;
    }
  }

  // Get dashboard statistics
  async getDashboardStatistics(userId) {
    try {
      const dashboard = await this.getOrCreateDashboard(userId);

      const stats = {
        totalUpcomingExams: dashboard.totalUpcomingExams,
        totalRecentQuizzes: dashboard.totalRecentQuizzes,
        averageQuizScore: dashboard.averageQuizScore,
        currentStreak: dashboard.streak,
        totalNotifications: dashboard.totalNotifications,
        recommendedTopicsCount: dashboard.recommendedTopics.length,
      };

      return stats;
    } catch (error) {
      logger.error("Error getting dashboard statistics:", error);
      throw error;
    }
  }

  // Clear old data
  async clearOldData(userId, days = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const dashboard = await Dashboard.findOne({ userId });

      if (!dashboard) {
        return null;
      }

      // Remove old quizzes
      dashboard.recentQuizzes = dashboard.recentQuizzes.filter(
        (quiz) => quiz.completedAt > cutoffDate
      );

      // Remove old exams
      dashboard.upcomingExams = dashboard.upcomingExams.filter(
        (exam) => exam.date > new Date()
      );

      await dashboard.save();

      logger.info(`Old data cleared for user: ${userId}`);
      return dashboard;
    } catch (error) {
      logger.error("Error clearing old data:", error);
      throw error;
    }
  }
}

module.exports = new DashboardService();