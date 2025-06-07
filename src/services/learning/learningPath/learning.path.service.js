const {
  LearningPath,
} = require("../../../models/learning/learning.path.model");
const { ApiError } = require("../../../utils/ApiError");
const createLogger = require("../../logging.service");

const logger = createLogger("LearningPathService");

class LearningPathService {
  async createLearningPath(data) {
    try {
      const learningPath = new LearningPath(data);
      await learningPath.save();
      logger.info(`Created learning path: ${learningPath.name}`);
      return learningPath;
    } catch (error) {
      logger.error("Error creating learning path:", error);
      throw error instanceof ApiError
        ? error
        : new ApiError(500, "Failed to create learning path");
    }
  }

  async getLearningPathById(id) {
    try {
      const learningPath = await LearningPath.findById(id)
        .populate("targetExam", "name")
        .populate("levels.modules", "title")
        .populate("levels.prerequisites", "name")
        .populate("adaptiveLearning.remediationPaths.topicId", "name")
        .populate(
          "adaptiveLearning.remediationPaths.alternativeResources",
          "title"
        )
        .populate(
          "adaptiveLearning.remediationPaths.practiceExercises",
          "question"
        )
        .populate("adaptiveLearning.adaptiveLearningId", "userId currentLevel");
      if (!learningPath) throw new ApiError(404, "Learning path not found");
      logger.info(`Retrieved learning path: ${id}`);
      return learningPath;
    } catch (error) {
      logger.error("Error retrieving learning path:", error);
      throw error instanceof ApiError
        ? error
        : new ApiError(500, "Failed to retrieve learning path");
    }
  }

  async getLearningPaths(filters = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = options;
      const query = {};
      if (filters.targetExam) query.targetExam = filters.targetExam;
      if (filters.targetSeries)
        query.targetSeries = { $in: [filters.targetSeries] };

      const skip = (page - 1) * limit;
      const sortOptions = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

      const [learningPaths, total] = await Promise.all([
        LearningPath.find(query)
          .populate("targetExam", "name")
          .sort(sortOptions)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        LearningPath.countDocuments(query),
      ]);

      logger.info(`Retrieved ${learningPaths.length} learning paths`);
      return {
        learningPaths,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit),
        },
      };
    } catch (error) {
      logger.error("Error retrieving learning paths:", error);
      throw new ApiError(500, "Failed to retrieve learning paths");
    }
  }

  async updateLearningPath(id, data) {
    try {
      const learningPath = await LearningPath.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
      )
        .populate("targetExam", "name")
        .populate("levels.modules", "title")
        .populate("levels.prerequisites", "name")
        .populate("adaptiveLearning.remediationPaths.topicId", "name")
        .populate(
          "adaptiveLearning.remediationPaths.alternativeResources",
          "title"
        )
        .populate(
          "adaptiveLearning.remediationPaths.practiceExercises",
          "question"
        )
        .populate("adaptiveLearning.adaptiveLearningId", "userId currentLevel");
      if (!learningPath) throw new ApiError(404, "Learning path not found");
      logger.info(`Updated learning path: ${id}`);
      return learningPath;
    } catch (error) {
      logger.error("Error updating learning path:", error);
      throw error instanceof ApiError
        ? error
        : new ApiError(500, "Failed to update learning path");
    }
  }

  async deleteLearningPath(id) {
    try {
      const learningPath = await LearningPath.findByIdAndDelete(id);
      if (!learningPath) throw new ApiError(404, "Learning path not found");
      logger.info(`Deleted learning path: ${id}`);
      return { message: "Learning path deleted successfully" };
    } catch (error) {
      logger.error("Error deleting learning path:", error);
      throw error instanceof ApiError
        ? error
        : new ApiError(500, "Failed to delete learning path");
    }
  }
}

module.exports = new LearningPathService();