const { Achievement } = require("../../../models/user/achievement.model");
const createLogger  = require("../../logging.service");

const logger = createLogger("AchievementService");

class AchievementService {
  // Get all achievements for a user
  async getUserAchievements(userId, filters = {}) {
    try {
      const query = { userId };

      // Apply filters
      if (filters.subjectId) query.subjectId = filters.subjectId;
      if (filters.series) query.series = filters.series;
      if (filters.completed !== undefined) {
        if (filters.completed === "true") {
          query.$expr = { $gte: ["$progress", "$target"] };
        } else {
          query.$expr = { $lt: ["$progress", "$target"] };
        }
      }

      const achievements = await Achievement.find(query)
        .populate("subjectId", "name")
        .sort({ earnedDate: -1, createdAt: -1 })
        .lean();

      return achievements;
    } catch (error) {
      logger.error("Error getting user achievements:", error);
      throw error;
    }
  }

  // Create a new achievement
  async createAchievement(achievementData) {
    try {
      const achievement = new Achievement(achievementData);
      await achievement.save();

      logger.info(`Achievement created: ${achievement.name}`);
      return achievement;
    } catch (error) {
      logger.error("Error creating achievement:", error);
      throw error;
    }
  }

  // Update achievement progress
  async updateProgress(achievementId, progress) {
    try {
      const achievement = await Achievement.findById(achievementId);
      if (!achievement) {
        throw new Error("Achievement not found");
      }

      achievement.progress = Math.min(progress, achievement.target);

      // Set earned date if achievement is completed
      if (
        achievement.progress >= achievement.target &&
        !achievement.earnedDate
      ) {
        achievement.earnedDate = new Date();
      }

      await achievement.save();

      logger.info(
        `Achievement progress updated: ${achievement.name} - ${achievement.progress}/${achievement.target}`
      );
      return achievement;
    } catch (error) {
      logger.error("Error updating achievement progress:", error);
      throw error;
    }
  }

  // Get achievement statistics
  async getAchievementStatistics(userId) {
    try {
      const stats = await Achievement.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: null,
            totalAchievements: { $sum: 1 },
            completedAchievements: {
              $sum: {
                $cond: [{ $gte: ["$progress", "$target"] }, 1, 0],
              },
            },
            totalProgress: { $sum: "$progress" },
            totalTargets: { $sum: "$target" },
          },
        },
      ]);

      const result = stats[0] || {
        totalAchievements: 0,
        completedAchievements: 0,
        totalProgress: 0,
        totalTargets: 0,
      };

      result.completionRate =
        result.totalAchievements > 0
          ? Math.round(
              (result.completedAchievements / result.totalAchievements) * 100
            )
          : 0;

      result.overallProgress =
        result.totalTargets > 0
          ? Math.round((result.totalProgress / result.totalTargets) * 100)
          : 0;

      return result;
    } catch (error) {
      logger.error("Error getting achievement statistics:", error);
      throw error;
    }
  }

  // Get achievement by ID
  async getAchievementById(achievementId) {
    try {
      const achievement = await Achievement.findById(achievementId).populate(
        "subjectId",
        "name"
      );

      if (!achievement) {
        throw new Error("Achievement not found");
      }

      return achievement;
    } catch (error) {
      logger.error("Error getting achievement by ID:", error);
      throw error;
    }
  }

  // Update achievement
  async updateAchievement(achievementId, updateData) {
    try {
      const achievement = await Achievement.findByIdAndUpdate(
        achievementId,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      ).populate("subjectId", "name");

      if (!achievement) {
        throw new Error("Achievement not found");
      }

      logger.info(`Achievement updated: ${achievement.name}`);
      return achievement;
    } catch (error) {
      logger.error("Error updating achievement:", error);
      throw error;
    }
  }

  // Delete achievement
  async deleteAchievement(achievementId) {
    try {
      const achievement = await Achievement.findByIdAndDelete(achievementId);

      if (!achievement) {
        throw new Error("Achievement not found");
      }

      logger.info(`Achievement deleted: ${achievement.name}`);
      return achievement;
    } catch (error) {
      logger.error("Error deleting achievement:", error);
      throw error;
    }
  }

  // Get achievements by subject
  async getAchievementsBySubject(subjectId, userId) {
    try {
      const achievements = await Achievement.find({
        subjectId,
        userId,
      })
        .populate("subjectId", "name")
        .sort({ earnedDate: -1, createdAt: -1 })
        .lean();

      return achievements;
    } catch (error) {
      logger.error("Error getting achievements by subject:", error);
      throw error;
    }
  }

  // Get recent achievements
  async getRecentAchievements(userId, limit = 5) {
    try {
      const achievements = await Achievement.find({
        userId,
        earnedDate: { $exists: true },
      })
        .populate("subjectId", "name")
        .sort({ earnedDate: -1 })
        .limit(limit)
        .lean();

      return achievements;
    } catch (error) {
      logger.error("Error getting recent achievements:", error);
      throw error;
    }
  }
}

module.exports = new AchievementService();