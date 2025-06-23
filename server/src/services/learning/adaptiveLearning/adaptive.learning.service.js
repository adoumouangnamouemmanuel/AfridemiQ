const {
  AdaptiveLearning,
  DIFFICULTY_LEVELS,
} = require("../../../models/learning/adaptive.learning.model");
const { ApiError } = require("../../../utils/ApiError");
const createLogger = require("../../logging.service");

const logger = createLogger("AdaptiveLearningService");

class AdaptiveLearningService {
  // Create adaptive learning profile
  async createAdaptiveLearning(data) {
    try {
      const existingProfile = await AdaptiveLearning.findOne({
        userId: data.userId,
      });
      if (existingProfile) {
        throw new ApiError(400, "Adaptive learning profile already exists");
      }

      const profile = new AdaptiveLearning(data);
      await profile.save();

      logger.info(`Created adaptive learning profile for user: ${data.userId}`);
      return profile;
    } catch (error) {
      logger.error("Error creating adaptive learning profile:", error);
      throw error instanceof ApiError
        ? error
        : new ApiError(500, "Failed to create adaptive learning profile");
    }
  }

  // Get adaptive learning profile by user ID
  async getAdaptiveLearningByUserId(userId) {
    try {
      const profile = await AdaptiveLearning.findOne({ userId })
        .populate("adjustmentRules.resourceId", "title url")
        .populate({
          path: "recommendedContent.contentId",
          select: "title name",
          model: function (doc) {
            return {
              topic: "Topic",
              quiz: "Quiz",
              resource: "Resource",
            }[doc.contentType];
          },
        });

      if (!profile) {
        throw new ApiError(404, "Adaptive learning profile not found");
      }

      logger.info(`Retrieved adaptive learning profile for user: ${userId}`);
      return profile;
    } catch (error) {
      logger.error("Error retrieving adaptive learning profile:", error);
      throw error instanceof ApiError
        ? error
        : new ApiError(500, "Failed to retrieve adaptive learning profile");
    }
  }

  // Update adaptive learning profile
  async updateAdaptiveLearning(userId, data) {
    try {
      const profile = await AdaptiveLearning.findOneAndUpdate(
        { userId },
        { $set: data },
        { new: true, runValidators: true }
      )
        .populate("adjustmentRules.resourceId", "title url")
        .populate({
          path: "recommendedContent.contentId",
          select: "title name",
          model: function (doc) {
            return {
              topic: "Topic",
              quiz: "Quiz",
              resource: "Resource",
            }[doc.contentType];
          },
        });

      if (!profile) {
        throw new ApiError(404, "Adaptive learning profile not found");
      }

      logger.info(`Updated adaptive learning profile for user: ${userId}`);
      return profile;
    } catch (error) {
      logger.error("Error updating adaptive learning profile:", error);
      throw error instanceof ApiError
        ? error
        : new ApiError(500, "Failed to update adaptive learning profile");
    }
  }

  // Adjust difficulty based on performance
  async adjustDifficulty(userId, performance) {
    try {
      const profile = await AdaptiveLearning.findOne({ userId });
      if (!profile) {
        throw new ApiError(404, "Adaptive learning profile not found");
      }

      const currentIndex = DIFFICULTY_LEVELS.indexOf(profile.currentLevel);
      let newLevel = profile.currentLevel;
      let recommendations = [];

      for (const rule of profile.adjustmentRules) {
        const value = performance[rule.metric];
        if (value >= rule.threshold) {
          if (
            rule.action === "increaseDifficulty" &&
            currentIndex < DIFFICULTY_LEVELS.length - 1
          ) {
            newLevel = DIFFICULTY_LEVELS[currentIndex + (rule.value || 1)];
          } else if (rule.action === "decreaseDifficulty" && currentIndex > 0) {
            newLevel = DIFFICULTY_LEVELS[currentIndex - (rule.value || 1)];
          } else if (rule.action === "suggestResource" && rule.resourceId) {
            recommendations.push({
              contentType: "resource",
              contentId: rule.resourceId,
            });
          }
        }
      }

      // Update progress
      profile.progress.scores.push(performance.score || 0);
      profile.progress.timeSpent.push(performance.timeSpent || 0);
      profile.progress.accuracy.push(performance.accuracy || 0);
      profile.progress.completionRate.push(performance.completionRate || 0);

      // Update profile
      profile.currentLevel = newLevel;
      if (recommendations.length > 0) {
        profile.recommendedContent.push(...recommendations);
      }

      await profile.save();

      logger.info(`Adjusted difficulty for user: ${userId} to ${newLevel}`);
      return await this.getAdaptiveLearningByUserId(userId);
    } catch (error) {
      logger.error("Error adjusting difficulty:", error);
      throw error instanceof ApiError
        ? error
        : new ApiError(500, "Failed to adjust difficulty");
    }
  }

  // Get all adaptive learning profiles (admin)
  async getAllAdaptiveLearning(filters = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = options;

      const query = {};
      if (filters.userId) query.userId = filters.userId;
      if (filters.currentLevel) query.currentLevel = filters.currentLevel;

      const skip = (page - 1) * limit;
      const sortOptions = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

      const [profiles, total] = await Promise.all([
        AdaptiveLearning.find(query)
          .populate("userId", "name email")
          .sort(sortOptions)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        AdaptiveLearning.countDocuments(query),
      ]);

      logger.info(`Retrieved ${profiles.length} adaptive learning profiles`);
      return {
        profiles,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit),
        },
      };
    } catch (error) {
      logger.error("Error retrieving adaptive learning profiles:", error);
      throw new ApiError(500, "Failed to retrieve adaptive learning profiles");
    }
  }
}

module.exports = new AdaptiveLearningService();