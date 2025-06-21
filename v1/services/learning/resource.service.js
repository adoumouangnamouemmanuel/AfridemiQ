const { Resource } = require("../../../models/learning/resource.model");
const { Subject } = require("../../../models/learning/subject.model");
const { Topic } = require("../../../models/learning/topic.model");
const NotFoundError = require("../../../errors/notFoundError");
const BadRequestError = require("../../../errors/badRequestError");
const ConflictError = require("../../../errors/conflictError");
const createLogger = require("../../logging.service");

const logger = createLogger("ResourceService");

// =============== GET ALL RESOURCES ===============
const getAllResources = async (query) => {
  logger.info("===================getAllResources=======================");

      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
        search,
        subjectId,
        topicId,
    category,
    type,
    difficulty,
    targetLevel,
    isPremium,
    isFeatured,
    isVerified,
    examYear,
    examSession,
  } = query;

  // Build filter object
  const filter = { isActive: true, status: "active" };

  if (subjectId) filter.subjectId = subjectId;
  if (topicId) filter.topicId = topicId;
  if (category) filter.category = category;
  if (type) filter.type = type;
  if (difficulty) filter.difficulty = difficulty;
  if (targetLevel) filter.targetLevel = targetLevel;
  if (isPremium !== undefined) filter.isPremium = isPremium === "true";
  if (isFeatured !== undefined) filter.isFeatured = isFeatured === "true";
  if (isVerified !== undefined) filter.isVerified = isVerified === "true";
  if (examYear) filter.examYear = parseInt(examYear);
  if (examSession) filter.examSession = examSession;

  // Add search functionality
      if (search) {
    filter.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
      { tags: { $in: [search.toLowerCase()] } },
      { keywords: { $in: [search.toLowerCase()] } },
    ];
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === "desc" ? -1 : 1;

  // Calculate pagination
  const skip = (page - 1) * limit;

      // Execute query with pagination
      const [resources, total] = await Promise.all([
    Resource.find(filter)
      .populate("subjectId", "name code")
      .populate("topicId", "name")
      .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
    Resource.countDocuments(filter),
      ]);

  const pagination = {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
    totalCount: total,
    hasNextPage: page < Math.ceil(total / limit),
    hasPrevPage: page > 1,
      };

  logger.info(
    "++++++✅ GET ALL RESOURCES: Resources retrieved successfully ++++++"
  );
  return { resources, pagination };
};

// =============== GET RESOURCE BY ID ===============
const getResourceById = async (resourceId) => {
  logger.info("===================getResourceById=======================");

  const resource = await Resource.findById(resourceId)
    .populate("subjectId", "name code")
    .populate("topicId", "name");

  if (!resource) {
    throw new NotFoundError("Ressource non trouvée");
  }

  logger.info(
    "++++++✅ GET RESOURCE BY ID: Resource retrieved successfully ++++++"
  );
  return resource;
};

// =============== CREATE RESOURCE ===============
const createResource = async (resourceData) => {
  logger.info("===================createResource=======================");

  // Validate subject exists
  const subject = await Subject.findById(resourceData.subjectId);
  if (!subject) {
    throw new NotFoundError("Matière non trouvée");
      }

  // Validate topic exists if provided
  if (resourceData.topicId) {
    const topic = await Topic.findById(resourceData.topicId);
    if (!topic) {
      throw new NotFoundError("Sujet non trouvé");
    }

    // Verify topic belongs to the subject
    if (topic.subjectId.toString() !== resourceData.subjectId.toString()) {
      throw new BadRequestError("Le sujet ne correspond pas à la matière");
    }
  }

  // Check for duplicate title within the same subject
  const existingResource = await Resource.findOne({
    title: { $regex: new RegExp(`^${resourceData.title}$`, "i") },
    subjectId: resourceData.subjectId,
  });
  if (existingResource) {
    throw new ConflictError(
      "Une ressource avec ce titre existe déjà pour cette matière"
    );
  }

      const resource = new Resource(resourceData);
      await resource.save();

  // Populate before returning
  await resource.populate("subjectId", "name code");
  if (resource.topicId) {
    await resource.populate("topicId", "name");
  }

  logger.info("++++++✅ CREATE RESOURCE: Resource created successfully ++++++");
  return resource;
};

// =============== UPDATE RESOURCE ===============
const updateResource = async (resourceId, updateData) => {
  logger.info("===================updateResource=======================");

  // Check if resource exists
  const existingResource = await Resource.findById(resourceId);
  if (!existingResource) {
    throw new NotFoundError("Ressource non trouvée");
      }

  // Validate subject exists if being updated
  if (updateData.subjectId) {
    const subject = await Subject.findById(updateData.subjectId);
    if (!subject) {
      throw new NotFoundError("Matière non trouvée");
      }
  }

  // Validate topic exists if being updated
  if (updateData.topicId) {
    const topic = await Topic.findById(updateData.topicId);
    if (!topic) {
      throw new NotFoundError("Sujet non trouvé");
      }

    // Verify topic belongs to the subject
    const subjectId = updateData.subjectId || existingResource.subjectId;
    if (topic.subjectId.toString() !== subjectId.toString()) {
      throw new BadRequestError("Le sujet ne correspond pas à la matière");
    }
  }

  // Check for duplicate title if title is being updated
  if (updateData.title && updateData.title !== existingResource.title) {
    const subjectId = updateData.subjectId || existingResource.subjectId;
    const duplicateTitle = await Resource.findOne({
      title: { $regex: new RegExp(`^${updateData.title}$`, "i") },
      subjectId: subjectId,
      _id: { $ne: resourceId },
    });
    if (duplicateTitle) {
      throw new ConflictError(
        "Une ressource avec ce titre existe déjà pour cette matière"
      );
    }
  }

      const resource = await Resource.findByIdAndUpdate(
        resourceId,
    { $set: updateData },
    { new: true, runValidators: true }
  )
    .populate("subjectId", "name code")
    .populate("topicId", "name");

  logger.info("++++++✅ UPDATE RESOURCE: Resource updated successfully ++++++");
  return resource;
};

// =============== DELETE RESOURCE ===============
const deleteResource = async (resourceId) => {
  logger.info("===================deleteResource=======================");

  const resource = await Resource.findById(resourceId);
      if (!resource) {
    throw new NotFoundError("Ressource non trouvée");
      }

  // Soft delete - just mark as inactive
  await Resource.findByIdAndUpdate(resourceId, {
    isActive: false,
    status: "inactive",
  });

  logger.info("++++++✅ DELETE RESOURCE: Resource deleted successfully ++++++");
};

// =============== GET RESOURCES BY SUBJECT ===============
const getResourcesBySubject = async (subjectId, options = {}) => {
  logger.info(
    "===================getResourcesBySubject======================="
  );

  // Verify subject exists
  const subject = await Subject.findById(subjectId);
  if (!subject) {
    throw new NotFoundError("Matière non trouvée");
  }

  const query = { subjectId, ...options };
  const result = await getAllResources(query);

  logger.info("++++++✅ GET RESOURCES BY SUBJECT: Resources retrieved ++++++");
  return result;
};

  // Get resources by topic
  async getResourcesByTopic(topicId, options = {}) {
    try {
      return await this.getAllResources({ topicId }, options);
    } catch (error) {
      logger.error("Error getting resources by topic:", error);
      throw error;
    }
  }

  // Get resources by exam
  async getResourcesByExam(examId, options = {}) {
    try {
      return await this.getAllResources({ examId }, options);
    } catch (error) {
      logger.error("Error getting resources by exam:", error);
      throw error;
    }
  }

  // Search resources
  async searchResources(searchTerm, options = {}) {
    try {
      return await this.getAllResources({ search: searchTerm }, options);
    } catch (error) {
      logger.error("Error searching resources:", error);
      throw error;
    }
  }

  // Get resource statistics
  async getResourceStatistics() {
    try {
      const [
        totalResources,
        totalViews,
        totalDownloads,
        averageRating,
        formatStats,
        levelStats,
        topRatedResources,
        mostViewedResources,
      ] = await Promise.all([
        Resource.countDocuments(),
        Resource.aggregate([
          { $group: { _id: null, total: { $sum: "$analytics.views" } } },
        ]),
        Resource.aggregate([
          { $group: { _id: null, total: { $sum: "$analytics.downloads" } } },
        ]),
        Resource.aggregate([
          {
            $group: {
              _id: null,
              average: { $avg: "$analytics.averageRating" },
            },
          },
        ]),
        Resource.aggregate([
          { $group: { _id: "$format", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        Resource.aggregate([
          { $group: { _id: "$level", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        Resource.find()
          .sort({ "analytics.averageRating": -1 })
          .limit(5)
          .select("title analytics.averageRating")
          .lean(),
        Resource.find()
          .sort({ "analytics.views": -1 })
          .limit(5)
          .select("title analytics.views")
          .lean(),
      ]);

      return {
        totalResources,
        totalViews: totalViews[0]?.total || 0,
        totalDownloads: totalDownloads[0]?.total || 0,
        averageRating: averageRating[0]?.average || 0,
        formatDistribution: formatStats,
        levelDistribution: levelStats,
        topRatedResources,
        mostViewedResources,
      };
    } catch (error) {
      logger.error("Error getting resource statistics:", error);
      throw error;
    }
  }

  // Bulk create resources
  async bulkCreateResources(resourcesData) {
    try {
      // Validate all references
      for (const resourceData of resourcesData) {
        await this.validateReferences(resourceData);
      }

      const resources = await Resource.insertMany(resourcesData);

      logger.info(`Bulk created ${resources.length} resources`);
      return resources;
    } catch (error) {
      logger.error("Error bulk creating resources:", error);
      throw error;
    }
  }

  // Get admin analytics
  async getAdminAnalytics() {
    try {
      const [basicStats, recentResources, feedbackStats, popularityTrends] =
        await Promise.all([
          this.getResourceStatistics(),
          Resource.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate("subjectId", "name")
            .select("title format level createdAt analytics.views")
            .lean(),
          Resource.aggregate([
            { $unwind: "$analytics.userFeedback" },
            {
              $group: {
                _id: null,
                totalFeedback: { $sum: 1 },
                averageRating: { $avg: "$analytics.userFeedback.rating" },
              },
            },
          ]),
          Resource.aggregate([
            {
              $project: {
                title: 1,
                popularity: {
                  $add: [
                    "$analytics.views",
                    { $multiply: ["$analytics.downloads", 2] },
                  ],
                },
                createdAt: 1,
              },
            },
            { $sort: { popularity: -1 } },
            { $limit: 10 },
          ]),
        ]);

      return {
        ...basicStats,
        recentResources,
        feedbackStats: feedbackStats[0] || {
          totalFeedback: 0,
          averageRating: 0,
        },
        popularityTrends,
      };
    } catch (error) {
      logger.error("Error getting admin analytics:", error);
      throw error;
    }
  }

  // Validate references
  async validateReferences(resourceData) {
    try {
      // Validate subject
      if (resourceData.subjectId) {
        const subject = await Subject.findById(resourceData.subjectId);
        if (!subject) {
          throw new Error("Invalid subject ID");
        }
      }

      // Validate topics
      if (resourceData.topicIds && resourceData.topicIds.length > 0) {
        const topics = await Topic.find({
          _id: { $in: resourceData.topicIds },
        });
        if (topics.length !== resourceData.topicIds.length) {
          throw new Error("One or more invalid topic IDs");
        }
      }

      // Validate exams
      if (resourceData.examIds && resourceData.examIds.length > 0) {
        const exams = await Exam.find({ _id: { $in: resourceData.examIds } });
        if (exams.length !== resourceData.examIds.length) {
          throw new Error("One or more invalid exam IDs");
        }
      }
    } catch (error) {
      logger.error("Error validating references:", error);
      throw error;
    }
  }
}

module.exports = new ResourceService();