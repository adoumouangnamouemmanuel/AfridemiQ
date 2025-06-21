const { Topic } = require("../../../models/learning/topic.model");
const { Subject } = require("../../../models/learning/subject.model");
const NotFoundError = require("../../../errors/notFoundError");
const BadRequestError = require("../../../errors/badRequestError");
const ConflictError = require("../../../errors/conflictError");
const createLogger = require("../../logging.service");

const logger = createLogger("TopicService");

// =============== CREATE TOPIC ===============
const createTopic = async (topicData) => {
  logger.info("===================createTopic=======================");

      // Verify subject exists
      const subject = await Subject.findById(topicData.subjectId);
      if (!subject) {
    throw new NotFoundError("Matière non trouvée");
      }

      // Check if topic with same name exists for this subject
      const existingTopic = await Topic.findOne({
    name: { $regex: new RegExp(`^${topicData.name}$`, "i") },
        subjectId: topicData.subjectId,
      });
      if (existingTopic) {
    throw new ConflictError(
      "Un sujet avec ce nom existe déjà pour cette matière"
        );
      }

      const topic = new Topic(topicData);
      await topic.save();

  // Populate subject information
  await topic.populate("subjectId", "name code");

  logger.info("++++++✅ CREATE TOPIC: Topic created successfully ++++++");
  return topic;
};

// =============== GET ALL TOPICS ===============
const getTopics = async (query) => {
  logger.info("===================getTopics=======================");

      const {
        page = 1,
        limit = 10,
        subjectId,
        difficulty,
    isActive,
    isPremium,
    isPopular,
    hasQuestions,
    hasResources,
    search,
    sortBy = "order",
    sortOrder = "asc",
  } = query;

  // Build filter object
  const filter = { status: "active" };

  if (subjectId) filter.subjectId = subjectId;
  if (difficulty) filter.difficulty = difficulty;
  if (isActive !== undefined) filter.isActive = isActive === "true";
  if (isPremium !== undefined) filter.isPremium = isPremium === "true";
  if (isPopular !== undefined) filter.isPopular = isPopular === "true";
  if (hasQuestions !== undefined) filter.hasQuestions = hasQuestions === "true";
  if (hasResources !== undefined) filter.hasResources = hasResources === "true";

  // Add search functionality
      if (search) {
    filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
      { keywords: { $in: [search.toLowerCase()] } },
        ];
      }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === "desc" ? -1 : 1;

      // Calculate pagination
      const skip = (page - 1) * limit;

  // Execute query with pagination
      const [topics, total] = await Promise.all([
    Topic.find(filter)
      .populate("subjectId", "name code")
      .sort(sort)
          .skip(skip)
      .limit(parseInt(limit))
          .lean(),
    Topic.countDocuments(filter),
      ]);

  const pagination = {
    currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
    totalCount: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
  };

  logger.info("++++++✅ GET TOPICS: Topics retrieved successfully ++++++");
  return { topics, pagination };
};

  // Get topic by ID
  async getTopicById(id) {
    try {
      const topic = await Topic.findById(id)
        .populate("subjectId", "name code description")
        .lean();

      if (!topic) {
        throw new NotFoundError("Topic not found");
      }

      return topic;
    } catch (error) {
      if (error.name === "CastError") {
        throw new BadRequestError("Invalid topic ID format");
      }
      throw error;
    }
  }

  // Update topic
  async updateTopic(id, updateData) {
    try {
      // If updating subjectId, verify it exists
      if (updateData.subjectId) {
        const subject = await Subject.findById(updateData.subjectId);
        if (!subject) {
          throw new NotFoundError("Subject not found");
        }
      }

      // If updating name, check for duplicates
      if (updateData.name) {
        const existingTopic = await Topic.findOne({
          name: updateData.name,
          subjectId: updateData.subjectId,
          _id: { $ne: id },
        });

        if (existingTopic) {
          throw new BadRequestError(
            "Topic with this name already exists for this subject"
          );
        }
      }

      const topic = await Topic.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).populate("subjectId", "name code description");

      if (!topic) {
        throw new NotFoundError("Topic not found");
      }

      return topic;
    } catch (error) {
      if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map((err) => err.message);
        throw new BadRequestError(`Validation failed: ${messages.join(", ")}`);
      }
      if (error.name === "CastError") {
        throw new BadRequestError("Invalid topic ID format");
      }
      throw error;
    }
  }

  // Delete topic
  async deleteTopic(id) {
    try {
      const topic = await Topic.findByIdAndDelete(id);

      if (!topic) {
        throw new NotFoundError("Topic not found");
      }

      return { message: "Topic deleted successfully" };
    } catch (error) {
      if (error.name === "CastError") {
        throw new BadRequestError("Invalid topic ID format");
      }
      throw error;
    }
  }

  // Get topics by subject
  async getTopicsBySubject(subjectId, options = {}) {
    try {
      // Verify subject exists
      const subject = await Subject.findById(subjectId);
      if (!subject) {
        throw new NotFoundError("Subject not found");
      }

      return await this.getAllTopics({ subjectId }, options);
    } catch (error) {
      throw error;
    }
  }

  // Get topics by difficulty
  async getTopicsByDifficulty(difficulty, options = {}) {
    try {
      return await this.getAllTopics({ difficulty }, options);
    } catch (error) {
      throw error;
    }
  }

  // Get topics by series
  async getTopicsBySeries(series, options = {}) {
    try {
      return await this.getAllTopics({ series }, options);
    } catch (error) {
      throw error;
    }
  }

  // Search topics
  async searchTopics(searchTerm, options = {}) {
    try {
      return await this.getAllTopics({ search: searchTerm }, options);
    } catch (error) {
      throw error;
    }
  }

  // Get topic statistics
  async getTopicStatistics() {
    try {
      const stats = await Topic.aggregate([
        {
          $group: {
            _id: null,
            totalTopics: { $sum: 1 },
            avgEstimatedTime: { $avg: "$estimatedTime" },
            avgEstimatedTimeToMaster: { $avg: "$estimatedTimeToMaster" },
            topicsWithPractice: { $sum: { $cond: ["$hasPractice", 1, 0] } },
            topicsWithNotes: { $sum: { $cond: ["$hasNote", 1, 0] } },
            topicsWithStudyMaterial: {
              $sum: { $cond: ["$hasStudyMaterial", 1, 0] },
            },
          },
        },
      ]);

      const difficultyStats = await Topic.aggregate([
        {
          $group: {
            _id: "$difficulty",
            count: { $sum: 1 },
          },
        },
      ]);

      const subjectStats = await Topic.aggregate([
        {
          $group: {
            _id: "$subjectId",
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "subjects",
            localField: "_id",
            foreignField: "_id",
            as: "subject",
          },
        },
        {
          $unwind: "$subject",
        },
        {
          $project: {
            subjectName: "$subject.name",
            count: 1,
          },
        },
      ]);

      return {
        general: stats[0] || {
          totalTopics: 0,
          avgEstimatedTime: 0,
          avgEstimatedTimeToMaster: 0,
          topicsWithPractice: 0,
          topicsWithNotes: 0,
          topicsWithStudyMaterial: 0,
        },
        byDifficulty: difficultyStats,
        bySubject: subjectStats,
      };
    } catch (error) {
      throw error;
    }
  }

  // Bulk operations
  async bulkCreateTopics(topicsData) {
    try {
      const results = [];
      const errors = [];

      for (let i = 0; i < topicsData.length; i++) {
        try {
          const topic = await this.createTopic(topicsData[i]);
          results.push(topic);
        } catch (error) {
          errors.push({
            index: i,
            data: topicsData[i],
            error: error.message,
          });
        }
      }

      return {
        success: results,
        errors,
        summary: {
          total: topicsData.length,
          successful: results.length,
          failed: errors.length,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async bulkUpdateTopics(updates) {
    try {
      const results = [];
      const errors = [];

      for (const update of updates) {
        try {
          const topic = await this.updateTopic(update.id, update.data);
          results.push(topic);
        } catch (error) {
          errors.push({
            id: update.id,
            error: error.message,
          });
        }
      }

      return {
        success: results,
        errors,
        summary: {
          total: updates.length,
          successful: results.length,
          failed: errors.length,
        },
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new TopicService();
