const { Resource } = require("../../../models/learning/resource.model");
const { Subject } = require("../../../models/learning/subject.model");
const { Topic } = require("../../../models/learning/topic.model");
const NotFoundError = require("../../../errors/notFoundError");
const BadRequestError = require("../../../errors/badRequestError");
const ConflictError = require("../../../errors/conflictError");
const createLogger = require("../../logging.service");

const logger = createLogger("ResourceService");

class ResourceService {
  // Get all resources with filtering and pagination
  async getAllResources(filters = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
        search,
        subjectId,
        topicId,
        examId,
        format,
        level,
        series,
        premiumOnly,
        offlineAvailable,
        minRating,
      } = { ...filters, ...options };

      // Build query
      const query = {};

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { "metadata.tags": { $regex: search, $options: "i" } },
        ];
      }

      if (subjectId) query.subjectId = subjectId;
      if (topicId) query.topicIds = topicId;
      if (examId) query.examIds = examId;
      if (format) query.format = format;
      if (level) query.level = level;
      if (series) query.series = series;
      if (premiumOnly !== undefined) query.premiumOnly = premiumOnly;
      if (offlineAvailable !== undefined)
        query.offlineAvailable = offlineAvailable;
      if (minRating) query["analytics.averageRating"] = { $gte: minRating };

      // Execute query with pagination
      const skip = (page - 1) * limit;
      const sortOptions = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

      const [resources, total] = await Promise.all([
        Resource.find(query)
          .populate("subjectId", "name")
          .populate("topicIds", "name")
          .populate("examIds", "title")
          .sort(sortOptions)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Resource.countDocuments(query),
      ]);

      return {
        resources,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit),
        },
      };
    } catch (error) {
      logger.error("Error getting resources:", error);
      throw error;
    }
  }

  // Get resource by ID
  async getResourceById(id) {
    try {
      const resource = await Resource.findById(id)
        .populate("subjectId", "name")
        .populate("topicIds", "name")
        .populate("examIds", "title")
        .populate("analytics.userFeedback.userId", "name email");

      if (!resource) {
        throw new Error("Resource not found");
      }

      return resource;
    } catch (error) {
      logger.error("Error getting resource by ID:", error);
      throw error;
    }
  }

  // Create new resource
  async createResource(resourceData) {
    try {
      // Validate references
      await this.validateReferences(resourceData);

      const resource = new Resource(resourceData);
      await resource.save();

      logger.info(`Resource created: ${resource.title}`);
      return resource;
    } catch (error) {
      logger.error("Error creating resource:", error);
      throw error;
    }
  }

  // Update resource
  async updateResource(id, updateData) {
    try {
      // Validate references if they're being updated
      if (updateData.subjectId || updateData.topicIds || updateData.examIds) {
        await this.validateReferences(updateData);
      }

      const resource = await Resource.findByIdAndUpdate(
        id,
        { ...updateData, "metadata.lastUpdated": new Date() },
        { new: true, runValidators: true }
      )
        .populate("subjectId", "name")
        .populate("topicIds", "name")
        .populate("examIds", "title");

      if (!resource) {
        throw new Error("Resource not found");
      }

      logger.info(`Resource updated: ${resource.title}`);
      return resource;
    } catch (error) {
      logger.error("Error updating resource:", error);
      throw error;
    }
  }

  // Delete resource
  async deleteResource(id) {
    try {
      const resource = await Resource.findByIdAndDelete(id);

      if (!resource) {
        throw new Error("Resource not found");
      }

      logger.info(`Resource deleted: ${resource.title}`);
      return { message: "Resource deleted successfully" };
    } catch (error) {
      logger.error("Error deleting resource:", error);
      throw error;
    }
  }

  // Add feedback to resource
  async addFeedback(resourceId, userId, rating, comments) {
    try {
      const resource = await Resource.findById(resourceId);
      if (!resource) {
        throw new Error("Resource not found");
      }

      // Check if user already provided feedback
      const existingFeedback = resource.analytics.userFeedback.find(
        (feedback) => feedback.userId.toString() === userId.toString()
      );

      if (existingFeedback) {
        // Update existing feedback
        existingFeedback.rating = rating;
        existingFeedback.comments = comments;
        existingFeedback.createdAt = new Date();
      } else {
        // Add new feedback
        resource.analytics.userFeedback.push({
          userId,
          rating,
          comments,
        });
      }

      // Recalculate average rating
      const totalRatings = resource.analytics.userFeedback.reduce(
        (sum, feedback) => sum + feedback.rating,
        0
      );
      resource.analytics.averageRating =
        totalRatings / resource.analytics.userFeedback.length;

      await resource.save();

      logger.info(`Feedback added to resource: ${resource.title}`);
      return resource;
    } catch (error) {
      logger.error("Error adding feedback:", error);
      throw error;
    }
  }

  // Track resource view
  async trackView(resourceId) {
    try {
      const resource = await Resource.findByIdAndUpdate(
        resourceId,
        { $inc: { "analytics.views": 1 } },
        { new: true }
      );

      if (!resource) {
        throw new Error("Resource not found");
      }

      return resource;
    } catch (error) {
      logger.error("Error tracking view:", error);
      throw error;
    }
  }

  // Track resource download
  async trackDownload(resourceId) {
    try {
      const resource = await Resource.findByIdAndUpdate(
        resourceId,
        { $inc: { "analytics.downloads": 1 } },
        { new: true }
      );

      if (!resource) {
        throw new Error("Resource not found");
      }

      return resource;
    } catch (error) {
      logger.error("Error tracking download:", error);
      throw error;
    }
  }

  // Get resources by subject
  async getResourcesBySubject(subjectId, options = {}) {
    try {
      return await this.getAllResources({ subjectId }, options);
    } catch (error) {
      logger.error("Error getting resources by subject:", error);
      throw error;
    }
  }

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