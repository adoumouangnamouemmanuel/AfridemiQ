const {
  GamifiedProgress,
} = require("../../../models/progress/gamified.progress.model");
const createLogger = require("../../services/logging.service");

const logger = createLogger("GamifiedProgressService");

class GamifiedProgressService {
  // Get or create gamified progress for user and subject
  async getOrCreateProgress(userId, subjectId) {
    try {
      let progress = await GamifiedProgress.findOne({ userId, subjectId })
        .populate("userId", "name email")
        .populate("subjectId", "name description");

      if (!progress) {
        // Create default milestones
        const defaultMilestones = [
          {
            id: "first_lesson",
            description: "Complete your first lesson",
            targetValue: 1,
            currentValue: 0,
            reward: { type: "badge", value: "First Steps" },
          },
          {
            id: "week_streak",
            description: "Study for 7 consecutive days",
            targetValue: 7,
            currentValue: 0,
            reward: { type: "points", value: "100" },
          },
          {
            id: "topic_master",
            description: "Master 5 topics",
            targetValue: 5,
            currentValue: 0,
            reward: { type: "badge", value: "Topic Master" },
          },
        ];

        progress = new GamifiedProgress({
          userId,
          subjectId,
          milestones: defaultMilestones,
        });
        await progress.save();
        await progress.populate("userId", "name email");
        await progress.populate("subjectId", "name description");
      }

      return progress;
    } catch (error) {
      logger.error("Error getting/creating gamified progress:", error);
      throw error;
    }
  }

  // Update milestone progress
  async updateMilestoneProgress(userId, subjectId, milestoneId, currentValue) {
    try {
      const progress = await GamifiedProgress.findOne({ userId, subjectId });
      if (!progress) {
        throw new Error("Progress not found");
      }

      const milestone = progress.milestones.find((m) => m.id === milestoneId);
      if (!milestone) {
        throw new Error("Milestone not found");
      }

      milestone.currentValue = currentValue;

      // Check if milestone is achieved
      if (currentValue >= milestone.targetValue && !milestone.achieved) {
        milestone.achieved = true;
        milestone.achievedDate = new Date();

        // Award points/badges
        if (milestone.reward.type === "points") {
          progress.totalPoints += parseInt(milestone.reward.value);
        } else if (milestone.reward.type === "badge") {
          if (!progress.badges.includes(milestone.reward.value)) {
            progress.badges.push(milestone.reward.value);
          }
        }

        // Level up logic
        const pointsForNextLevel = progress.level * 100;
        if (progress.totalPoints >= pointsForNextLevel) {
          progress.level += 1;
        }
      }

      await progress.save();
      return progress;
    } catch (error) {
      logger.error("Error updating milestone progress:", error);
      throw error;
    }
  }

  // Get user's progress across all subjects
  async getUserProgress(userId) {
    try {
      const progress = await GamifiedProgress.find({ userId })
        .populate("subjectId", "name description")
        .sort({ updatedAt: -1 });

      return progress;
    } catch (error) {
      logger.error("Error getting user progress:", error);
      throw error;
    }
  }

  // Get leaderboard
  async getLeaderboard(limit = 10) {
    try {
      const leaderboard = await GamifiedProgress.aggregate([
        {
          $group: {
            _id: "$userId",
            totalPoints: { $sum: "$totalPoints" },
            totalBadges: { $sum: { $size: "$badges" } },
            maxLevel: { $max: "$level" },
          },
        },
        { $sort: { totalPoints: -1 } },
        { $limit: limit },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $project: {
            userId: "$_id",
            userName: "$user.name",
            totalPoints: 1,
            totalBadges: 1,
            maxLevel: 1,
          },
        },
      ]);

      return leaderboard;
    } catch (error) {
      logger.error("Error getting leaderboard:", error);
      throw error;
    }
  }

  // Get statistics
  async getStatistics() {
    try {
      const stats = await GamifiedProgress.aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $addToSet: "$userId" },
            totalProgress: { $sum: 1 },
            averageLevel: { $avg: "$level" },
            totalPoints: { $sum: "$totalPoints" },
            totalBadges: { $sum: { $size: "$badges" } },
          },
        },
        {
          $project: {
            totalUsers: { $size: "$totalUsers" },
            totalProgress: 1,
            averageLevel: { $round: ["$averageLevel", 2] },
            totalPoints: 1,
            totalBadges: 1,
          },
        },
      ]);

      return (
        stats[0] || {
          totalUsers: 0,
          totalProgress: 0,
          averageLevel: 0,
          totalPoints: 0,
          totalBadges: 0,
        }
      );
    } catch (error) {
      logger.error("Error getting statistics:", error);
      throw error;
    }
  }
}

module.exports = new GamifiedProgressService();