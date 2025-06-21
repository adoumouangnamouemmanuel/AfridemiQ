const { StatusCodes } = require("http-status-codes");
const topicService = require("../../services/learning/topic/topic.service");
const createLogger = require("../../services/logging.service");

const logger = createLogger("TopicController");

// =============== CREATE TOPIC ===============
const createTopic = async (req, res) => {
  logger.info("===================createTopic=======================");

    try {
      const topic = await topicService.createTopic(req.body);

    logger.info("++++++✅ CREATE TOPIC: Topic created successfully ++++++");
    res.status(StatusCodes.CREATED).json({
        success: true,
      message: "Sujet créé avec succès",
      data: { topic },
      });
    } catch (error) {
    logger.error("❌ CREATE TOPIC ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Erreur lors de la création du sujet",
    });
  }
};

// =============== GET ALL TOPICS ===============
const getTopics = async (req, res) => {
  logger.info("===================getTopics=======================");

  try {
    const result = await topicService.getTopics(req.query);

    logger.info("++++++✅ GET TOPICS: Topics retrieved successfully ++++++");
    res.status(StatusCodes.OK).json({
        success: true,
      message: "Sujets récupérés avec succès",
      data: result,
      });
    } catch (error) {
    logger.error("❌ GET TOPICS ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Erreur lors de la récupération des sujets",
    });
    }
};

// =============== GET TOPIC BY ID ===============
const getTopicById = async (req, res) => {
  logger.info("===================getTopicById=======================");

    try {
      const topic = await topicService.getTopicById(req.params.id);

    logger.info(
      "++++++✅ GET TOPIC BY ID: Topic retrieved successfully ++++++"
    );
    res.status(StatusCodes.OK).json({
        success: true,
      message: "Sujet récupéré avec succès",
      data: { topic },
      });
    } catch (error) {
    logger.error("❌ GET TOPIC BY ID ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Erreur lors de la récupération du sujet",
    });
    }
};

// =============== UPDATE TOPIC ===============
const updateTopic = async (req, res) => {
  logger.info("===================updateTopic=======================");

    try {
      const topic = await topicService.updateTopic(req.params.id, req.body);

    logger.info("++++++✅ UPDATE TOPIC: Topic updated successfully ++++++");
    res.status(StatusCodes.OK).json({
        success: true,
      message: "Sujet mis à jour avec succès",
      data: { topic },
      });
    } catch (error) {
    logger.error("❌ UPDATE TOPIC ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Erreur lors de la mise à jour du sujet",
    });
    }
  }

// =============== DELETE TOPIC ===============
const deleteTopic = async (req, res) => {
  logger.info("===================deleteTopic=======================");

    try {
    await topicService.deleteTopic(req.params.id);

    logger.info("++++++✅ DELETE TOPIC: Topic deleted successfully ++++++");
    res.status(StatusCodes.OK).json({
        success: true,
      message: "Sujet supprimé avec succès",
      });
    } catch (error) {
    logger.error("❌ DELETE TOPIC ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Erreur lors de la suppression du sujet",
    });
  }
};

// =============== GET TOPICS BY SUBJECT ===============
const getTopicsBySubject = async (req, res) => {
  logger.info("===================getTopicsBySubject=======================");

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