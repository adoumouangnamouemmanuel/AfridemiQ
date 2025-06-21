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

// =============== GET TOPIC BY ID ===============
const getTopicById = async (topicId) => {
  logger.info("===================getTopicById=======================");

  const topic = await Topic.findById(topicId).populate(
    "subjectId",
    "name code"
  );
      if (!topic) {
    throw new NotFoundError("Sujet non trouvé");
      }

  logger.info("++++++✅ GET TOPIC BY ID: Topic retrieved successfully ++++++");
      return topic;
};

// =============== UPDATE TOPIC ===============
const updateTopic = async (topicId, updateData) => {
  logger.info("===================updateTopic=======================");

  // Check if topic exists
  const existingTopic = await Topic.findById(topicId);
  if (!existingTopic) {
    throw new NotFoundError("Sujet non trouvé");
  }

      // If updating subjectId, verify it exists
      if (updateData.subjectId) {
        const subject = await Subject.findById(updateData.subjectId);
        if (!subject) {
      throw new NotFoundError("Matière non trouvée");
        }
      }

  // Check for duplicate name if name is being updated
  if (updateData.name && updateData.name !== existingTopic.name) {
    const duplicateName = await Topic.findOne({
      name: { $regex: new RegExp(`^${updateData.name}$`, "i") },
      subjectId: updateData.subjectId || existingTopic.subjectId,
      _id: { $ne: topicId },
        });
    if (duplicateName) {
      throw new ConflictError(
        "Un sujet avec ce nom existe déjà pour cette matière"
          );
        }
      }

      const topic = await Topic.findByIdAndUpdate(
    topicId,
        { $set: updateData },
        { new: true, runValidators: true }
  ).populate("subjectId", "name code");

  logger.info("++++++✅ UPDATE TOPIC: Topic updated successfully ++++++");
      return topic;
};

// =============== DELETE TOPIC ===============
const deleteTopic = async (topicId) => {
  logger.info("===================deleteTopic=======================");

  const topic = await Topic.findById(topicId);
      if (!topic) {
    throw new NotFoundError("Sujet non trouvé");
      }

  // Soft delete - just mark as inactive
  await Topic.findByIdAndUpdate(topicId, {
    isActive: false,
    status: "inactive",
  });

  logger.info("++++++✅ DELETE TOPIC: Topic deleted successfully ++++++");
};

// =============== GET TOPICS BY SUBJECT ===============
const getTopicsBySubject = async (subjectId, options = {}) => {
  logger.info("===================getTopicsBySubject=======================");

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
