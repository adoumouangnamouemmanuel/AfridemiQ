const { ParentAccess } = require("../../../models/user/parent.access.model");
const { User } = require("../../../models/user/user.model");
const createLogger = require("../../logging.service");
const crypto = require("crypto");

const logger = createLogger("ParentAccessService");

class ParentAccessService {
  // Create parent access
  async createParentAccess(userId, parentAccessData) {
    try {
      const {
        parentEmail,
        accessLevel = "viewProgress",
        notifications = [],
      } = parentAccessData;

      // Check if parent access already exists
      const existingAccess = await ParentAccess.findOne({ userId });
      if (existingAccess) {
        throw new Error("Parent access already exists for this user");
      }

      // Verify user exists
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Generate verification code
      const verificationCode = crypto.randomBytes(32).toString("hex");

      // Default notifications if none provided
      const defaultNotifications =
        notifications.length > 0
          ? notifications
          : [
              { type: "weekly_summary", frequency: "weekly", enabled: true },
              { type: "achievement", frequency: "immediate", enabled: true },
              {
                type: "low_performance",
                frequency: "immediate",
                enabled: true,
              },
            ];

      const parentAccess = new ParentAccess({
        userId,
        parentEmail,
        accessLevel,
        notifications: defaultNotifications,
        verificationCode,
        isVerified: false,
      });

      await parentAccess.save();
      await parentAccess.populate("userId", "name email");

      logger.info(
        `Parent access created for user ${userId} with parent email ${parentEmail}`
      );
      return parentAccess;
    } catch (error) {
      logger.error("Error creating parent access:", error);
      throw error;
    }
  }

  // Get parent access by user ID
  async getParentAccessByUserId(userId) {
    try {
      const parentAccess = await ParentAccess.findOne({ userId }).populate(
        "userId",
        "name email"
      );

      return parentAccess;
    } catch (error) {
      logger.error("Error getting parent access by user ID:", error);
      throw error;
    }
  }

  // Get parent access by parent email
  async getParentAccessByEmail(parentEmail) {
    try {
      const parentAccess = await ParentAccess.find({
        parentEmail: parentEmail.toLowerCase(),
        isActive: true,
      }).populate("userId", "name email");

      return parentAccess;
    } catch (error) {
      logger.error("Error getting parent access by email:", error);
      throw error;
    }
  }

  // Verify parent access
  async verifyParentAccess(verificationCode) {
    try {
      const parentAccess = await ParentAccess.findOne({ verificationCode });
      if (!parentAccess) {
        throw new Error("Invalid verification code");
      }

      parentAccess.isVerified = true;
      parentAccess.verificationCode = undefined;
      parentAccess.lastAccessDate = new Date();

      await parentAccess.save();
      await parentAccess.populate("userId", "name email");

      logger.info(`Parent access verified for user ${parentAccess.userId}`);
      return parentAccess;
    } catch (error) {
      logger.error("Error verifying parent access:", error);
      throw error;
    }
  }

  // Update parent access
  async updateParentAccess(userId, updateData) {
    try {
      const parentAccess = await ParentAccess.findOne({ userId });
      if (!parentAccess) {
        throw new Error("Parent access not found");
      }

      const { accessLevel, notifications, isActive } = updateData;

      if (accessLevel) parentAccess.accessLevel = accessLevel;
      if (notifications) parentAccess.notifications = notifications;
      if (isActive !== undefined) parentAccess.isActive = isActive;

      await parentAccess.save();
      await parentAccess.populate("userId", "name email");

      return parentAccess;
    } catch (error) {
      logger.error("Error updating parent access:", error);
      throw error;
    }
  }

  // Update notification preferences
  async updateNotificationPreferences(userId, notificationPreferences) {
    try {
      const parentAccess = await ParentAccess.findOne({ userId });
      if (!parentAccess) {
        throw new Error("Parent access not found");
      }

      parentAccess.notifications = notificationPreferences;
      await parentAccess.save();

      return parentAccess;
    } catch (error) {
      logger.error("Error updating notification preferences:", error);
      throw error;
    }
  }

  // Record parent access
  async recordParentAccess(userId) {
    try {
      const parentAccess = await ParentAccess.findOne({ userId });
      if (!parentAccess) {
        throw new Error("Parent access not found");
      }

      parentAccess.lastAccessDate = new Date();
      await parentAccess.save();

      return parentAccess;
    } catch (error) {
      logger.error("Error recording parent access:", error);
      throw error;
    }
  }

  // Get student progress for parent
  async getStudentProgressForParent(userId, parentEmail) {
    try {
      const parentAccess = await ParentAccess.findOne({
        userId,
        parentEmail: parentEmail.toLowerCase(),
        isActive: true,
        isVerified: true,
      });

      if (!parentAccess) {
        throw new Error("Parent access not found or not authorized");
      }

      // Record access
      await this.recordParentAccess(userId);

      // Get student data based on access level
      const student = await User.findById(userId).select("name email");

      const progressData = {
        student: {
          name: student.name,
          email: student.email,
        },
        accessLevel: parentAccess.accessLevel,
        lastUpdated: new Date(),
      };

      // Add progress data based on access level
      if (
        parentAccess.accessLevel === "viewProgress" ||
        parentAccess.canViewReports
      ) {
        // Get basic progress data
        // This would integrate with other services like UserAnalytics, TopicProgress, etc.
        progressData.basicProgress = {
          studyTime: 0, // Would come from UserAnalytics
          topicsCompleted: 0, // Would come from TopicProgress
          averageScore: 0, // Would come from practice sessions
        };
      }

      if (parentAccess.canViewReports) {
        // Get detailed reports
        progressData.detailedReports = {
          subjectPerformance: [], // Would come from subject analytics
          recentActivities: [], // Would come from activity logs
          recommendations: [], // Would come from recommendation engine
        };
      }

      if (parentAccess.hasFullAccess) {
        // Get full access data including settings
        progressData.fullAccess = {
          accountSettings: {}, // Limited account settings
          parentalControls: {}, // Parental control options
        };
      }

      return progressData;
    } catch (error) {
      logger.error("Error getting student progress for parent:", error);
      throw error;
    }
  }

  // Delete parent access
  async deleteParentAccess(userId) {
    try {
      const result = await ParentAccess.findOneAndDelete({ userId });
      if (!result) {
        throw new Error("Parent access not found");
      }

      logger.info(`Parent access deleted for user ${userId}`);
      return result;
    } catch (error) {
      logger.error("Error deleting parent access:", error);
      throw error;
    }
  }

  // Get parent access analytics (admin)
  async getParentAccessAnalytics() {
    try {
      const analytics = await ParentAccess.aggregate([
        {
          $group: {
            _id: null,
            totalParentAccess: { $sum: 1 },
            activeAccess: {
              $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
            },
            verifiedAccess: {
              $sum: { $cond: [{ $eq: ["$isVerified", true] }, 1, 0] },
            },
            accessLevelDistribution: {
              viewProgress: {
                $sum: {
                  $cond: [{ $eq: ["$accessLevel", "viewProgress"] }, 1, 0],
                },
              },
              viewReports: {
                $sum: {
                  $cond: [{ $eq: ["$accessLevel", "viewReports"] }, 1, 0],
                },
              },
              fullAccess: {
                $sum: {
                  $cond: [{ $eq: ["$accessLevel", "fullAccess"] }, 1, 0],
                },
              },
            },
          },
        },
      ]);

      // Get recent activity
      const recentActivity = await ParentAccess.find({
        lastAccessDate: {
          $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      }).countDocuments();

      const result = analytics[0] || {
        totalParentAccess: 0,
        activeAccess: 0,
        verifiedAccess: 0,
        accessLevelDistribution: {
          viewProgress: 0,
          viewReports: 0,
          fullAccess: 0,
        },
      };

      result.recentActivity = recentActivity;
      result.verificationRate =
        result.totalParentAccess > 0
          ? Math.round((result.verifiedAccess / result.totalParentAccess) * 100)
          : 0;

      return result;
    } catch (error) {
      logger.error("Error getting parent access analytics:", error);
      throw error;
    }
  }

  // Get all parent access (admin)
  async getAllParentAccess(filters = {}) {
    try {
      const query = {};

      if (filters.isActive !== undefined) query.isActive = filters.isActive;
      if (filters.isVerified !== undefined)
        query.isVerified = filters.isVerified;
      if (filters.accessLevel) query.accessLevel = filters.accessLevel;

      const parentAccess = await ParentAccess.find(query)
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .limit(filters.limit || 100)
        .skip(filters.skip || 0);

      return parentAccess;
    } catch (error) {
      logger.error("Error getting all parent access:", error);
      throw error;
    }
  }
}

module.exports = new ParentAccessService();