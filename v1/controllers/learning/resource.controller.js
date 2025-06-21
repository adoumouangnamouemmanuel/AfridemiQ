const { StatusCodes } = require("http-status-codes");
const resourceService = require("../../services/learning/resource/resource.service");
const createLogger = require("../../services/logging.service");

const logger = createLogger("ResourceController");

// =============== GET ALL RESOURCES ===============
const getAllResources = async (req, res) => {
  logger.info("===================getAllResources=======================");

  try {
    const result = await resourceService.getAllResources(req.query);

    logger.info(
      "++++++✅ GET ALL RESOURCES: Resources retrieved successfully ++++++"
    );
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Ressources récupérées avec succès",
      data: result,
    });
  } catch (error) {
    logger.error("❌ GET ALL RESOURCES ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Erreur lors de la récupération des ressources",
    });
  }
};

// =============== GET RESOURCE BY ID ===============
const getResourceById = async (req, res) => {
  logger.info("===================getResourceById=======================");

  try {
    const resource = await resourceService.getResourceById(req.params.id);

    logger.info(
      "++++++✅ GET RESOURCE BY ID: Resource retrieved successfully ++++++"
    );
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Ressource récupérée avec succès",
      data: { resource },
    });
  } catch (error) {
    logger.error("❌ GET RESOURCE BY ID ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message:
        error.message || "Erreur lors de la récupération de la ressource",
    });
  }
};

// =============== CREATE RESOURCE ===============
const createResource = async (req, res) => {
  logger.info("===================createResource=======================");

  try {
    const resource = await resourceService.createResource(req.body);

    logger.info(
      "++++++✅ CREATE RESOURCE: Resource created successfully ++++++"
    );
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Ressource créée avec succès",
      data: { resource },
    });
  } catch (error) {
    logger.error("❌ CREATE RESOURCE ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Erreur lors de la création de la ressource",
    });
  }
};

// =============== UPDATE RESOURCE ===============
const updateResource = async (req, res) => {
  logger.info("===================updateResource=======================");

  try {
    const resource = await resourceService.updateResource(
      req.params.id,
      req.body
    );

    logger.info(
      "++++++✅ UPDATE RESOURCE: Resource updated successfully ++++++"
    );
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Ressource mise à jour avec succès",
      data: { resource },
    });
  } catch (error) {
    logger.error("❌ UPDATE RESOURCE ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Erreur lors de la mise à jour de la ressource",
    });
  }
};

// =============== DELETE RESOURCE ===============
const deleteResource = async (req, res) => {
  logger.info("===================deleteResource=======================");

  try {
    await resourceService.deleteResource(req.params.id);

    logger.info(
      "++++++✅ DELETE RESOURCE: Resource deleted successfully ++++++"
    );
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Ressource supprimée avec succès",
    });
  } catch (error) {
    logger.error("❌ DELETE RESOURCE ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Erreur lors de la suppression de la ressource",
    });
  }
};

// =============== GET RESOURCES BY SUBJECT ===============
const getResourcesBySubject = async (req, res) => {
  logger.info(
    "===================getResourcesBySubject======================="
  );

  try {
    const { subjectId } = req.params;
    const result = await resourceService.getResourcesBySubject(
      subjectId,
      req.query
    );

    logger.info(
      "++++++✅ GET RESOURCES BY SUBJECT: Resources retrieved ++++++"
    );
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Ressources récupérées avec succès",
      data: result,
    });
  } catch (error) {
    logger.error("❌ GET RESOURCES BY SUBJECT ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Erreur lors de la récupération des ressources",
    });
  }
};

// =============== GET RESOURCES BY TOPIC ===============
const getResourcesByTopic = async (req, res) => {
  logger.info("===================getResourcesByTopic=======================");

  try {
    const { topicId } = req.params;
    const result = await resourceService.getResourcesByTopic(
      topicId,
      req.query
    );

    logger.info("++++++✅ GET RESOURCES BY TOPIC: Resources retrieved ++++++");
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Ressources récupérées avec succès",
      data: result,
    });
  } catch (error) {
    logger.error("❌ GET RESOURCES BY TOPIC ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Erreur lors de la récupération des ressources",
    });
  }
};

// Track download
const trackDownload = async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await resourceService.trackDownload(id);

    res.status(StatusCodes.OK).json({
      message: "Download tracked successfully",
      data: resource,
    });
  } catch (error) {
    logger.error("Error tracking download:", error);
    const statusCode =
      error.message === "Resource not found"
        ? StatusCodes.NOT_FOUND
        : StatusCodes.INTERNAL_SERVER_ERROR;

    res.status(statusCode).json({
      message: error.message || "Error tracking download",
      error: error.message,
    });
  }
};

// Get resources by subject
const getResourcesBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const options = {
      page: req.query.page,
      limit: req.query.limit,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
    };

    const result = await resourceService.getResourcesBySubject(
      subjectId,
      options
    );

    res.status(StatusCodes.OK).json({
      message: "Resources retrieved successfully",
      data: result,
    });
  } catch (error) {
    logger.error("Error getting resources by subject:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error retrieving resources",
      error: error.message,
    });
  }
};

// Get resources by topic
const getResourcesByTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const options = {
      page: req.query.page,
      limit: req.query.limit,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
    };

    const result = await resourceService.getResourcesByTopic(topicId, options);

    res.status(StatusCodes.OK).json({
      message: "Resources retrieved successfully",
      data: result,
    });
  } catch (error) {
    logger.error("Error getting resources by topic:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error retrieving resources",
      error: error.message,
    });
  }
};

// Get resources by exam
const getResourcesByExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const options = {
      page: req.query.page,
      limit: req.query.limit,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
    };

    const result = await resourceService.getResourcesByExam(examId, options);

    res.status(StatusCodes.OK).json({
      message: "Resources retrieved successfully",
      data: result,
    });
  } catch (error) {
    logger.error("Error getting resources by exam:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error retrieving resources",
      error: error.message,
    });
  }
};

// Search resources
const searchResources = async (req, res) => {
  try {
    const { q } = req.query;
    const options = {
      page: req.query.page,
      limit: req.query.limit,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
    };

    const result = await resourceService.searchResources(q, options);

    res.status(StatusCodes.OK).json({
      message: "Search completed successfully",
      data: result,
    });
  } catch (error) {
    logger.error("Error searching resources:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error searching resources",
      error: error.message,
    });
  }
};

// Get resource statistics
const getResourceStatistics = async (req, res) => {
  try {
    const statistics = await resourceService.getResourceStatistics();

    res.status(StatusCodes.OK).json({
      message: "Statistics retrieved successfully",
      data: statistics,
    });
  } catch (error) {
    logger.error("Error getting resource statistics:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error retrieving statistics",
      error: error.message,
    });
  }
};

// Get resource formats
const getResourceFormats = async (req, res) => {
  try {
    const formats = ["document", "video", "audio", "interactive", "past_exam"];

    res.status(StatusCodes.OK).json({
      message: "Resource formats retrieved successfully",
      data: formats,
    });
  } catch (error) {
    logger.error("Error getting resource formats:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error retrieving resource formats",
      error: error.message,
    });
  }
};

// Bulk create resources
const bulkCreateResources = async (req, res) => {
  try {
    const { resources } = req.body;
    const result = await resourceService.bulkCreateResources(resources);

    res.status(StatusCodes.CREATED).json({
      message: "Resources created successfully",
      data: result,
    });
  } catch (error) {
    logger.error("Error bulk creating resources:", error);
    res.status(StatusCodes.BAD_REQUEST).json({
      message: "Error creating resources",
      error: error.message,
    });
  }
};

// Get admin analytics
const getAdminAnalytics = async (req, res) => {
  try {
    const analytics = await resourceService.getAdminAnalytics();

    res.status(StatusCodes.OK).json({
      message: "Admin analytics retrieved successfully",
      data: analytics,
    });
  } catch (error) {
    logger.error("Error getting admin analytics:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error retrieving admin analytics",
      error: error.message,
    });
  }
};

module.exports = {
  getAllResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  addFeedback,
  trackView,
  trackDownload,
  getResourcesBySubject,
  getResourcesByTopic,
  getResourcesByExam,
  searchResources,
  getResourceStatistics,
  getResourceFormats,
  bulkCreateResources,
  getAdminAnalytics,
};