const { StudyGroup } = require("../../../models/learning/study.group.model");
const { ApiError } = require("../../../utils/ApiError");
const createLogger = require("../../services/logging.service");

const logger = createLogger("StudyGroupService");

class StudyGroupService {
  async createStudyGroup(data) {
    try {
      const studyGroup = new StudyGroup(data);
      await studyGroup.save();
      logger.info(`Created study group: ${data.name}`);
      return studyGroup;
    } catch (error) {
      logger.error("Error creating study group:", error);
      throw error instanceof ApiError
        ? error
        : new ApiError(500, "Failed to create study group");
    }
  }

  async getStudyGroupById(id) {
    try {
      const studyGroup = await StudyGroup.findById(id)
        .populate(
          "memberIds createdBy roles.userId activities.createdBy",
          "name email"
        )
        .populate("challengeIds", "name")
        .populate("learningPathId", "name")
        .populate("activities.quizId", "name")
        .populate("activities.resourceId", "title")
        .populate("studySchedule.sessions.topic", "name")
        .populate("resourceIds", "title")
        .populate("groupProgressSummary.completedTopics", "name");
      if (!studyGroup) throw new ApiError(404, "Study group not found");
      logger.info(`Retrieved study group: ${id}`);
      return studyGroup;
    } catch (error) {
      logger.error("Error retrieving study group:", error);
      throw error instanceof ApiError
        ? error
        : new ApiError(500, "Failed to retrieve study group");
    }
  }

  async getStudyGroups(filters = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = options;
      const query = {};
      if (filters.createdBy) query.createdBy = filters.createdBy;
      if (filters.memberId) query.memberIds = filters.memberId;

      const skip = (page - 1) * limit;
      const sortOptions = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

      const [studyGroups, total] = await Promise.all([
        StudyGroup.find(query)
          .populate("createdBy", "name email")
          .populate("learningPathId", "name")
          .sort(sortOptions)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        StudyGroup.countDocuments(query),
      ]);

      logger.info(`Retrieved ${studyGroups.length} study groups`);
      return {
        studyGroups,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit),
        },
      };
    } catch (error) {
      logger.error("Error retrieving study groups:", error);
      throw new ApiError(500, "Failed to retrieve study groups");
    }
  }

  async updateStudyGroup(id, data) {
    try {
      const studyGroup = await StudyGroup.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
      )
        .populate(
          "memberIds createdBy roles.userId activities.createdBy",
          "name email"
        )
        .populate("challengeIds", "name")
        .populate("learningPathId", "name")
        .populate("activities.quizId", "name")
        .populate("activities.resourceId", "title")
        .populate("studySchedule.sessions.topic", "name")
        .populate("resourceIds", "title")
        .populate("groupProgressSummary.completedTopics", "name");
      if (!studyGroup) throw new ApiError(404, "Study group not found");
      logger.info(`Updated study group: ${id}`);
      return studyGroup;
    } catch (error) {
      logger.error("Error updating study group:", error);
      throw error instanceof ApiError
        ? error
        : new ApiError(500, "Failed to update study group");
    }
  }

  async deleteStudyGroup(id) {
    try {
      const studyGroup = await StudyGroup.findByIdAndDelete(id);
      if (!studyGroup) throw new ApiError(404, "Study group not found");
      logger.info(`Deleted study group: ${id}`);
      return { message: "Study group deleted successfully" };
    } catch (error) {
      logger.error("Error deleting study group:", error);
      throw error instanceof ApiError
        ? error
        : new ApiError(500, "Failed to delete study group");
    }
  }
}

module.exports = new StudyGroupService();