const {
  CourseContent,
  DIFFICULTY_LEVELS,
} = require("../../../models/learning/course.content.model");
const { Subject } = require("../../../models/learning/subject.model");
const { Topic } = require("../../../models/learning/topic.model");
const { Exam } = require("../../../models/assessment/exam.model");
const createLogger  = require("../../services/logging.service");

const logger = createLogger("CourseContentService");

class CourseContentService {
  // Get all course contents with filtering and pagination
  async getAllCourseContents(filters = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
        search,
        subjectId,
        examId,
        topicId,
        level,
        series,
        premiumOnly,
      } = { ...filters, ...options };

      // Build query
      const query = {};

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { "metadata.tags": { $in: [new RegExp(search, "i")] } },
        ];
      }

      if (subjectId) query.subjectId = subjectId;
      if (examId) query.examId = { $in: [examId] };
      if (topicId) query.topicId = { $in: [topicId] };
      if (level) query.level = level;
      if (series) query.series = series;
      if (premiumOnly !== undefined) query.premiumOnly = premiumOnly;

      // Execute query with pagination
      const skip = (page - 1) * limit;
      const sortOptions = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

      const [courseContents, total] = await Promise.all([
        CourseContent.find(query)
          .populate("subjectId", "name code")
          .populate("topicId", "name difficulty")
          .populate("examId", "name type")
          .populate("metadata.createdBy", "name email")
          .populate("metadata.updatedBy", "name email")
          .sort(sortOptions)
          .skip(skip)
          .limit(Number.parseInt(limit))
          .lean(),
        CourseContent.countDocuments(query),
      ]);

      logger.info(`Retrieved ${courseContents.length} course contents`);

      return {
        courseContents,
        pagination: {
          currentPage: Number.parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: Number.parseInt(limit),
        },
      };
    } catch (error) {
      logger.error("Error getting course contents:", error);
      throw error;
    }
  }

  // Get course content by ID
  async getCourseContentById(id) {
    try {
      const courseContent = await CourseContent.findById(id)
        .populate("subjectId", "name code description")
        .populate("topicId", "name difficulty estimatedTime")
        .populate("examId", "name type series")
        .populate("metadata.createdBy", "name email")
        .populate("metadata.updatedBy", "name email")
        .populate("modules.lessons", "title duration")
        .populate("modules.exerciseIds", "title difficulty")
        .populate("modules.assessment", "title totalQuestions");

      if (!courseContent) {
        throw new Error("Contenu de cours non trouvé");
      }

      logger.info(`Retrieved course content: ${courseContent.title}`);
      return courseContent;
    } catch (error) {
      logger.error("Error getting course content by ID:", error);
      throw error;
    }
  }

  // Create new course content
  async createCourseContent(data, userId) {
    try {
      // Validate references
      await this.validateReferences(data);

      // Check for duplicates
      const existingContent = await CourseContent.findOne({
        title: data.title,
        subjectId: data.subjectId,
        series: data.series,
      });

      if (existingContent) {
        throw new Error(
          "Un contenu de cours avec ce titre existe déjà pour cette matière et série"
        );
      }

      // Calculate total lessons
      const totalLessons = data.modules
        ? data.modules.reduce(
            (total, module) =>
              total + (module.lessons ? module.lessons.length : 0),
            0
          )
        : 0;

      // Prepare course content data
      const courseContentData = {
        ...data,
        progressTracking: {
          completedLessons: 0,
          totalLessons,
        },
        metadata: {
          ...data.metadata,
          createdBy: userId,
          createdAt: new Date(),
        },
      };

      // Process modules
      if (courseContentData.modules) {
        courseContentData.modules = courseContentData.modules.map(
          (module, index) => ({
            ...module,
            id: module.id || `module_${index + 1}`,
            order: module.order || index + 1,
            progressTracking: {
              completedLessons: 0,
              totalLessons: module.lessons ? module.lessons.length : 0,
            },
          })
        );
      }

      const courseContent = new CourseContent(courseContentData);
      await courseContent.save();

      logger.info(`Created course content: ${courseContent.title}`);
      return await this.getCourseContentById(courseContent._id);
    } catch (error) {
      logger.error("Error creating course content:", error);
      throw error;
    }
  }

  // Update course content
  async updateCourseContent(id, data, userId) {
    try {
      const courseContent = await CourseContent.findById(id);
      if (!courseContent) {
        throw new Error("Contenu de cours non trouvé");
      }

      // Validate references if they're being updated
      if (data.subjectId || data.topicId || data.examId) {
        await this.validateReferences(data);
      }

      // Update metadata
      data.metadata = {
        ...courseContent.metadata,
        ...data.metadata,
        updatedBy: userId,
      };

      // Recalculate total lessons if modules are updated
      if (data.modules) {
        const totalLessons = data.modules.reduce(
          (total, module) =>
            total + (module.lessons ? module.lessons.length : 0),
          0
        );

        data.progressTracking = {
          ...courseContent.progressTracking,
          totalLessons,
        };

        // Process modules
        data.modules = data.modules.map((module, index) => ({
          ...module,
          id: module.id || `module_${index + 1}`,
          order: module.order || index + 1,
          progressTracking: {
            completedLessons: module.progressTracking?.completedLessons || 0,
            totalLessons: module.lessons ? module.lessons.length : 0,
          },
        }));
      }

      const updatedCourseContent = await CourseContent.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
      );

      logger.info(`Updated course content: ${updatedCourseContent.title}`);
      return await this.getCourseContentById(id);
    } catch (error) {
      logger.error("Error updating course content:", error);
      throw error;
    }
  }

  // Delete course content
  async deleteCourseContent(id) {
    try {
      const courseContent = await CourseContent.findById(id);
      if (!courseContent) {
        throw new Error("Contenu de cours non trouvé");
      }

      await CourseContent.findByIdAndDelete(id);
      logger.info(`Deleted course content: ${courseContent.title}`);

      return { message: "Contenu de cours supprimé avec succès" };
    } catch (error) {
      logger.error("Error deleting course content:", error);
      throw error;
    }
  }

  // Get course contents by subject
  async getCourseContentsBySubject(subjectId, options = {}) {
    try {
      const { series, level } = options;
      const query = { subjectId };

      if (series) query.series = series;
      if (level) query.level = level;

      const courseContents = await CourseContent.find(query)
        .populate("topicId", "name difficulty")
        .populate("examId", "name type")
        .sort({ createdAt: -1 });

      logger.info(
        `Retrieved ${courseContents.length} course contents for subject ${subjectId}`
      );
      return courseContents;
    } catch (error) {
      logger.error("Error getting course contents by subject:", error);
      throw error;
    }
  }

  // Get course contents by exam
  async getCourseContentsByExam(examId, options = {}) {
    try {
      const { level, series } = options;
      const query = { examId: { $in: [examId] } };

      if (level) query.level = level;
      if (series) query.series = series;

      const courseContents = await CourseContent.find(query)
        .populate("subjectId", "name code")
        .populate("topicId", "name difficulty")
        .sort({ createdAt: -1 });

      logger.info(
        `Retrieved ${courseContents.length} course contents for exam ${examId}`
      );
      return courseContents;
    } catch (error) {
      logger.error("Error getting course contents by exam:", error);
      throw error;
    }
  }

  // Update progress tracking
  async updateProgressTracking(id, progressData) {
    try {
      const courseContent = await CourseContent.findById(id);
      if (!courseContent) {
        throw new Error("Contenu de cours non trouvé");
      }

      const updateData = {
        progressTracking: {
          ...courseContent.progressTracking,
          ...progressData,
        },
      };

      const updatedCourseContent = await CourseContent.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      );

      logger.info(
        `Updated progress tracking for course content: ${updatedCourseContent.title}`
      );
      return updatedCourseContent;
    } catch (error) {
      logger.error("Error updating progress tracking:", error);
      throw error;
    }
  }

  // Get course content statistics
  async getCourseContentStatistics() {
    try {
      const [
        totalContents,
        contentsByLevel,
        contentsBySubject,
        premiumContents,
        averageModules,
      ] = await Promise.all([
        CourseContent.countDocuments(),
        CourseContent.aggregate([
          { $group: { _id: "$level", count: { $sum: 1 } } },
        ]),
        CourseContent.aggregate([
          {
            $lookup: {
              from: "subjects",
              localField: "subjectId",
              foreignField: "_id",
              as: "subject",
            },
          },
          { $unwind: "$subject" },
          { $group: { _id: "$subject.name", count: { $sum: 1 } } },
        ]),
        CourseContent.countDocuments({ premiumOnly: true }),
        CourseContent.aggregate([
          {
            $group: { _id: null, avgModules: { $avg: { $size: "$modules" } } },
          },
        ]),
      ]);

      const statistics = {
        totalContents,
        contentsByLevel: contentsByLevel.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        contentsBySubject: contentsBySubject.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        premiumContents,
        freeContents: totalContents - premiumContents,
        averageModulesPerContent: averageModules[0]?.avgModules || 0,
      };

      logger.info("Generated course content statistics");
      return statistics;
    } catch (error) {
      logger.error("Error getting course content statistics:", error);
      throw error;
    }
  }

  // Search course contents
  async searchCourseContents(searchTerm, options = {}) {
    try {
      const { limit = 10, level, series, subjectId } = options;

      const query = {
        $or: [
          { title: { $regex: searchTerm, $options: "i" } },
          { description: { $regex: searchTerm, $options: "i" } },
          { "metadata.tags": { $in: [new RegExp(searchTerm, "i")] } },
          { "modules.title": { $regex: searchTerm, $options: "i" } },
          { "modules.description": { $regex: searchTerm, $options: "i" } },
        ],
      };

      if (level) query.level = level;
      if (series) query.series = series;
      if (subjectId) query.subjectId = subjectId;

      const courseContents = await CourseContent.find(query)
        .populate("subjectId", "name code")
        .populate("topicId", "name")
        .limit(Number.parseInt(limit))
        .sort({ createdAt: -1 });

      logger.info(
        `Found ${courseContents.length} course contents matching search: ${searchTerm}`
      );
      return courseContents;
    } catch (error) {
      logger.error("Error searching course contents:", error);
      throw error;
    }
  }

  // Get difficulty levels
  async getDifficultyLevels() {
    return DIFFICULTY_LEVELS;
  }

  // Bulk operations
  async bulkCreateCourseContents(contentsData, userId) {
    try {
      const results = [];
      const errors = [];

      for (let i = 0; i < contentsData.length; i++) {
        try {
          const courseContent = await this.createCourseContent(
            contentsData[i],
            userId
          );
          results.push(courseContent);
        } catch (error) {
          errors.push({
            index: i,
            data: contentsData[i],
            error: error.message,
          });
        }
      }

      logger.info(
        `Bulk created ${results.length} course contents with ${errors.length} errors`
      );
      return { results, errors };
    } catch (error) {
      logger.error("Error in bulk create course contents:", error);
      throw error;
    }
  }

  // Helper method to validate references
  async validateReferences(data) {
    const promises = [];

    if (data.subjectId) {
      promises.push(
        Subject.findById(data.subjectId).then((subject) => {
          if (!subject) throw new Error("Matière non trouvée");
        })
      );
    }

    if (data.topicId && data.topicId.length > 0) {
      promises.push(
        Topic.find({ _id: { $in: data.topicId } }).then((topics) => {
          if (topics.length !== data.topicId.length) {
            throw new Error("Un ou plusieurs sujets non trouvés");
          }
        })
      );
    }

    if (data.examId && data.examId.length > 0) {
      promises.push(
        Exam.find({ _id: { $in: data.examId } }).then((exams) => {
          if (exams.length !== data.examId.length) {
            throw new Error("Un ou plusieurs examens non trouvés");
          }
        })
      );
    }

    await Promise.all(promises);
  }
}

module.exports = new CourseContentService();