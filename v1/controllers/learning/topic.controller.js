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
    const { subjectId } = req.params;
    const topics = await topicService.getTopicsBySubject(subjectId, req.query);

    logger.info("++++++✅ GET TOPICS BY SUBJECT: Topics retrieved ++++++");
    res.status(StatusCodes.OK).json({
        success: true,
      message: "Sujets récupérés avec succès",
      data: { topics },
      });
    } catch (error) {
    logger.error("❌ GET TOPICS BY SUBJECT ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Erreur lors de la récupération des sujets",
      });
  }
};

// =============== GET TOPICS BY DIFFICULTY ===============
const getTopicsByDifficulty = async (req, res) => {
  logger.info(
    "===================getTopicsByDifficulty======================="
  );

    try {
    const { difficulty } = req.params;
    const { subjectId } = req.query;
    const topics = await topicService.getTopicsByDifficulty(
      difficulty,
      subjectId
    );

    logger.info("++++++✅ GET TOPICS BY DIFFICULTY: Topics retrieved ++++++");
    res.status(StatusCodes.OK).json({
        success: true,
      message: "Sujets récupérés avec succès",
      data: { topics },
      });
    } catch (error) {
    logger.error("❌ GET TOPICS BY DIFFICULTY ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
          success: false,
      message: error.message || "Erreur lors de la récupération des sujets",
        });
      }
};

// =============== GET POPULAR TOPICS ===============
const getPopularTopics = async (req, res) => {
  logger.info("===================getPopularTopics=======================");

  try {
    const limit = parseInt(req.query.limit) || 10;
    const { subjectId } = req.query;
    const topics = await topicService.getPopularTopics(limit, subjectId);

    logger.info("++++++✅ GET POPULAR TOPICS: Popular topics retrieved ++++++");
    res.status(StatusCodes.OK).json({
        success: true,
      message: "Sujets populaires récupérés avec succès",
      data: { topics },
      });
    } catch (error) {
    logger.error("❌ GET POPULAR TOPICS ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message:
        error.message || "Erreur lors de la récupération des sujets populaires",
      });
  }
};

// =============== SEARCH TOPICS ===============
const searchTopics = async (req, res) => {
  logger.info("===================searchTopics=======================");

  try {
    const { q: searchTerm } = req.query;
    const filters = req.query;
    const topics = await topicService.searchTopics(searchTerm, filters);

    logger.info("++++++✅ SEARCH TOPICS: Search completed successfully ++++++");
    res.status(StatusCodes.OK).json({
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