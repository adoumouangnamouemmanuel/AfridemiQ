const { StatusCodes } = require("http-status-codes");
const topicService = require("../../services/learning/topic/topic.service");
const createLogger = require("../../services/logging.service");

class TopicController {
  // Create topic
  async createTopic(req, res, next) {
    try {
      const topic = await topicService.createTopic(req.body);

      res.status(201).json({
        success: true,
        message: "Topic created successfully",
        data: topic,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all topics
  async getAllTopics(req, res, next) {
    try {
      const {
        page,
        limit,
        sortBy,
        sortOrder,
        search,
        subjectId,
        difficulty,
        series,
        hasPractice,
        hasNote,
        hasStudyMaterial,
      } = req.query;

      const result = await topicService.getAllTopics({
        page,
        limit,
        sortBy,
        sortOrder,
        search,
        subjectId,
        difficulty,
        series,
        hasPractice:
          hasPractice === "true"
            ? true
            : hasPractice === "false"
            ? false
            : undefined,
        hasNote:
          hasNote === "true" ? true : hasNote === "false" ? false : undefined,
        hasStudyMaterial:
          hasStudyMaterial === "true"
            ? true
            : hasStudyMaterial === "false"
            ? false
            : undefined,
      });

      res.status(200).json({
        success: true,
        message: "Topics retrieved successfully",
        data: result.topics,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get topic by ID
  async getTopicById(req, res, next) {
    try {
      const topic = await topicService.getTopicById(req.params.id);

      res.status(200).json({
        success: true,
        message: "Topic retrieved successfully",
        data: topic,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update topic
  async updateTopic(req, res, next) {
    try {
      const topic = await topicService.updateTopic(req.params.id, req.body);

      res.status(200).json({
        success: true,
        message: "Topic updated successfully",
        data: topic,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete topic
  async deleteTopic(req, res, next) {
    try {
      const result = await topicService.deleteTopic(req.params.id);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get topics by subject
  async getTopicsBySubject(req, res, next) {
    try {
      const { page, limit, sortBy, sortOrder } = req.query;
      const result = await topicService.getTopicsBySubject(
        req.params.subjectId,
        {
          page,
          limit,
          sortBy,
          sortOrder,
        }
      );

      res.status(200).json({
        success: true,
        message: "Topics retrieved successfully",
        data: result.topics,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get topics by difficulty
  async getTopicsByDifficulty(req, res, next) {
    try {
      const { page, limit, sortBy, sortOrder } = req.query;
      const result = await topicService.getTopicsByDifficulty(
        req.params.difficulty,
        {
          page,
          limit,
          sortBy,
          sortOrder,
        }
      );

      res.status(200).json({
        success: true,
        message: "Topics retrieved successfully",
        data: result.topics,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get topics by series
  async getTopicsBySeries(req, res, next) {
    try {
      const { page, limit, sortBy, sortOrder } = req.query;
      const result = await topicService.getTopicsBySeries(req.params.series, {
        page,
        limit,
        sortBy,
        sortOrder,
      });

      res.status(200).json({
        success: true,
        message: "Topics retrieved successfully",
        data: result.topics,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  // Search topics
  async searchTopics(req, res, next) {
    try {
      const { q: searchTerm, page, limit, sortBy, sortOrder } = req.query;

      if (!searchTerm) {
        return res.status(400).json({
          success: false,
          message: "Search term is required",
        });
      }

      const result = await topicService.searchTopics(searchTerm, {
        page,
        limit,
        sortBy,
        sortOrder,
      });

      res.status(200).json({
        success: true,
        message: "Search completed successfully",
        data: result.topics,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get topic statistics
  async getTopicStatistics(req, res, next) {
    try {
      const stats = await topicService.getTopicStatistics();

      res.status(200).json({
        success: true,
        message: "Statistics retrieved successfully",
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get difficulty levels
  async getDifficultyLevels(req, res, next) {
    try {
      res.status(200).json({
        success: true,
        message: "Difficulty levels retrieved successfully",
        data: DIFFICULTY_LEVELS,
      });
    } catch (error) {
      next(error);
    }
  }

  // Bulk create topics
  async bulkCreateTopics(req, res, next) {
    try {
      const { topics } = req.body;

      if (!Array.isArray(topics) || topics.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Topics array is required and cannot be empty",
        });
      }

      const result = await topicService.bulkCreateTopics(topics);

      res.status(201).json({
        success: true,
        message: "Bulk create completed",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Bulk update topics
  async bulkUpdateTopics(req, res, next) {
    try {
      const { updates } = req.body;

      if (!Array.isArray(updates) || updates.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Updates array is required and cannot be empty",
        });
      }

      const result = await topicService.bulkUpdateTopics(updates);

      res.status(200).json({
        success: true,
        message: "Bulk update completed",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TopicController();