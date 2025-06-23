const { StudyPlan } = require("../../../models/learning/study.plan.model");
const { ApiError } = require("../../../utils/ApiError");
const createLogger = require("../../logging.service");

const logger = createLogger("StudyPlanService");

class StudyPlanService {
  async createStudyPlan(data) {
    try {
      const existingPlan = await StudyPlan.findOne({ userId: data.userId });
      if (existingPlan) {
        throw new ApiError(400, "Study plan already exists for this user");
      }

      const studyPlan = new StudyPlan(data);
      await studyPlan.save();
      logger.info(`Created study plan for user: ${data.userId}`);
      return await this.getStudyPlanById(studyPlan._id);
    } catch (error) {
      logger.error("Error creating study plan:", error);
      throw error instanceof ApiError
        ? error
        : new ApiError(500, "Failed to create study plan");
    }
  }

  async getStudyPlanById(id) {
    try {
      const studyPlan = await StudyPlan.findById(id)
        .populate("userId", "name email")
        .populate("targetExam", "name")
        .populate("dailyGoals.topics.topicId", "name")
        .populate("dailyGoals.exercises.exerciseId", "question")
        .populate("weeklyReview.topics", "name")
        .populate(
          "progressTracking.completedTopics progressTracking.weakAreas progressTracking.strongAreas",
          "name"
        )
        .populate("adaptiveLearningId", "currentLevel");
      if (!studyPlan) throw new ApiError(404, "Study plan not found");
      logger.info(`Retrieved study plan: ${id}`);
      return studyPlan;
    } catch (error) {
      logger.error("Error retrieving study plan:", error);
      throw error instanceof ApiError
        ? error
        : new ApiError(500, "Failed to retrieve study plan");
    }
  }

  async getStudyPlanByUserId(userId) {
    try {
      const studyPlan = await StudyPlan.findOne({ userId: userId })
        .populate("userId", "name email")
        .populate("targetExam", "name")
        .populate("dailyGoals.topics.topicId", "name")
        .populate("dailyGoals.exercises.exerciseId", "question")
        .populate("weeklyReview.topics", "name")
        .populate(
          "progressTracking.completedTopics progressTracking.weakAreas progressTracking.strongAreas",
          "name"
        )
        .populate("adaptiveLearningId", "currentLevel");
      
      logger.info(`Retrieved study plan for user: ${userId}`);
      return studyPlan;
    } catch (error) {
      logger.error("Error retrieving study plan by userId:", error);
      throw error instanceof ApiError
        ? error
        : new ApiError(500, "Failed to retrieve study plan");
    }
  }

  async getStudyPlans(filters = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = options;
      const query = {};
      if (filters.userId) query.userId = filters.userId;
      if (filters.targetExam) query.targetExam = filters.targetExam;

      const skip = (page - 1) * limit;
      const sortOptions = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

      const [studyPlans, total] = await Promise.all([
        StudyPlan.find(query)
          .populate("userId", "name email")
          .populate("targetExam", "name")
          .sort(sortOptions)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        StudyPlan.countDocuments(query),
      ]);

      logger.info(`Retrieved ${studyPlans.length} study plans`);
      return {
        studyPlans,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit),
        },
      };
    } catch (error) {
      logger.error("Error retrieving study plans:", error);
      throw new ApiError(500, "Failed to retrieve study plans");
    }
  }

  async updateStudyPlan(id, data) {
    try {
      const studyPlan = await StudyPlan.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
      )
        .populate("userId", "name email")
        .populate("targetExam", "name")
        .populate("dailyGoals.topics.topicId", "name")
        .populate("dailyGoals.exercises.exerciseId", "question")
        .populate("weeklyReview.topics", "name")
        .populate(
          "progressTracking.completedTopics progressTracking.weakAreas progressTracking.strongAreas",
          "name"
        )
        .populate("adaptiveLearningId", "currentLevel");
      if (!studyPlan) throw new ApiError(404, "Study plan not found");
      logger.info(`Updated study plan: ${id}`);
      return studyPlan;
    } catch (error) {
      logger.error("Error updating study plan:", error);
      throw error instanceof ApiError
        ? error
        : new ApiError(500, "Failed to update study plan");
    }
  }

  async deleteStudyPlan(id) {
    try {
      const studyPlan = await StudyPlan.findByIdAndDelete(id);
      if (!studyPlan) throw new ApiError(404, "Study plan not found");
      logger.info(`Deleted study plan: ${id}`);
      return { message: "Study plan deleted successfully" };
    } catch (error) {
      logger.error("Error deleting study plan:", error);
      throw error instanceof ApiError
        ? error
        : new ApiError(500, "Failed to delete study plan");
    }
  }
}

module.exports = new StudyPlanService();