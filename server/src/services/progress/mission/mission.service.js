const { Mission } = require("../../../models/progress/mission.model");
const { Subject } = require("../../../models/learning/subject.model");
const createLogger = require(".././../logging.service")

const logger = createLogger("MissionService");

class MissionService {
  // Create a new mission
  async createMission(missionData) {
    try {
      // Validate subject if provided
      if (missionData.subjectId) {
        const subject = await Subject.findById(missionData.subjectId);
        if (!subject) {
          throw new Error("Subject not found");
        }
      }

      const mission = new Mission(missionData);
      await mission.save();

      if (mission.subjectId) {
        await mission.populate("subjectId", "name description");
      }

      logger.info(`Mission created: ${mission.title}`);
      return mission;
    } catch (error) {
      logger.error("Error creating mission:", error);
      throw error;
    }
  }

  // Get all missions with filtering
  async getMissions(filters = {}) {
    try {
      const {
        type,
        completed,
        subjectId,
        series,
        category,
        isActive = true,
        page = 1,
        limit = 20,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = filters;

      const query = { isActive };

      if (type) query.type = type;
      if (completed !== undefined) query.completed = completed;
      if (subjectId) query.subjectId = subjectId;
      if (series) query.series = series;
      if (category) query.category = category;

      // Only show non-expired missions unless specifically requested
      if (!filters.includeExpired) {
        query.expiresAt = { $gt: new Date() };
      }

      const skip = (page - 1) * limit;
      const sortOptions = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

      const missions = await Mission.find(query)
        .populate("subjectId", "name description")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit);

      const total = await Mission.countDocuments(query);

      return {
        missions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error("Error getting missions:", error);
      throw error;
    }
  }

  // Get mission by ID
  async getMissionById(id) {
    try {
      const mission = await Mission.findById(id).populate(
        "subjectId",
        "name description"
      );

      if (!mission) {
        throw new Error("Mission not found");
      }

      return mission;
    } catch (error) {
      logger.error("Error getting mission by ID:", error);
      throw error;
    }
  }

  // Update mission progress
  async updateProgress(id, progress) {
    try {
      const mission = await Mission.findById(id);
      if (!mission) {
        throw new Error("Mission not found");
      }

      if (mission.completed) {
        throw new Error("Mission already completed");
      }

      if (mission.isExpired) {
        throw new Error("Mission has expired");
      }

      mission.progress = Math.min(progress, mission.target);

      // Check if mission is completed
      if (mission.progress >= mission.target) {
        mission.completed = true;
        logger.info(`Mission completed: ${mission.title}`);
      }

      await mission.save();
      await mission.populate("subjectId", "name description");

      return mission;
    } catch (error) {
      logger.error("Error updating mission progress:", error);
      throw error;
    }
  }

  // Update mission
  async updateMission(id, updateData) {
    try {
      // Validate subject if being updated
      if (updateData.subjectId) {
        const subject = await Subject.findById(updateData.subjectId);
        if (!subject) {
          throw new Error("Subject not found");
        }
      }

      const mission = await Mission.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).populate("subjectId", "name description");

      if (!mission) {
        throw new Error("Mission not found");
      }

      logger.info(`Mission updated: ${mission.title}`);
      return mission;
    } catch (error) {
      logger.error("Error updating mission:", error);
      throw error;
    }
  }

  // Delete mission
  async deleteMission(id) {
    try {
      const mission = await Mission.findByIdAndDelete(id);
      if (!mission) {
        throw new Error("Mission not found");
      }

      logger.info(`Mission deleted: ${mission.title}`);
      return mission;
    } catch (error) {
      logger.error("Error deleting mission:", error);
      throw error;
    }
  }

  // Get daily missions
  async getDailyMissions(subjectId = null, series = null) {
    try {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const query = {
        type: "daily",
        isActive: true,
        expiresAt: { $gte: today, $lt: tomorrow },
      };

      if (subjectId) query.subjectId = subjectId;
      if (series) query.series = series;

      const missions = await Mission.find(query)
        .populate("subjectId", "name description")
        .sort({ points: -1 });

      return missions;
    } catch (error) {
      logger.error("Error getting daily missions:", error);
      throw error;
    }
  }

  // Get weekly missions
  async getWeeklyMissions(subjectId = null, series = null) {
    try {
      const now = new Date();
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const query = {
        type: "weekly",
        isActive: true,
        expiresAt: { $gte: weekStart, $lt: weekEnd },
      };

      if (subjectId) query.subjectId = subjectId;
      if (series) query.series = series;

      const missions = await Mission.find(query)
        .populate("subjectId", "name description")
        .sort({ points: -1 });

      return missions;
    } catch (error) {
      logger.error("Error getting weekly missions:", error);
      throw error;
    }
  }

  // Get mission statistics
  async getStatistics() {
    try {
      const stats = await Mission.aggregate([
        {
          $group: {
            _id: null,
            totalMissions: { $sum: 1 },
            completedMissions: { $sum: { $cond: ["$completed", 1, 0] } },
            activeMissions: { $sum: { $cond: ["$isActive", 1, 0] } },
            expiredMissions: {
              $sum: {
                $cond: [{ $lt: ["$expiresAt", new Date()] }, 1, 0],
              },
            },
            totalPoints: { $sum: "$points" },
            averageProgress: { $avg: "$progress" },
            missionsByType: {
              $push: {
                type: "$type",
                completed: "$completed",
              },
            },
          },
        },
      ]);

      const typeStats = await Mission.aggregate([
        {
          $group: {
            _id: "$type",
            count: { $sum: 1 },
            completed: { $sum: { $cond: ["$completed", 1, 0] } },
          },
        },
      ]);

      const categoryStats = await Mission.aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
            completed: { $sum: { $cond: ["$completed", 1, 0] } },
          },
        },
      ]);

      return {
        overall: stats[0] || {
          totalMissions: 0,
          completedMissions: 0,
          activeMissions: 0,
          expiredMissions: 0,
          totalPoints: 0,
          averageProgress: 0,
        },
        byType: typeStats,
        byCategory: categoryStats,
      };
    } catch (error) {
      logger.error("Error getting mission statistics:", error);
      throw error;
    }
  }

  // Clean up expired missions
  async cleanupExpiredMissions() {
    try {
      const result = await Mission.updateMany(
        {
          expiresAt: { $lt: new Date() },
          isActive: true,
        },
        { isActive: false }
      );

      logger.info(`Deactivated ${result.modifiedCount} expired missions`);
      return result;
    } catch (error) {
      logger.error("Error cleaning up expired missions:", error);
      throw error;
    }
  }
}

module.exports = new MissionService();