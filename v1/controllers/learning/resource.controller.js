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
  try {
    const resource = await resourceService.createResource(req.body);

    res.status(StatusCodes.CREATED).json({
      message: "Resource created successfully",
      data: resource,
    });
  } catch (error) {
    logger.error("Error creating resource:", error);
    res.status(StatusCodes.BAD_REQUEST).json({
      message: "Error creating resource",
      error: error.message,
    });
  }
};

// Update resource
const updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await resourceService.updateResource(id, req.body);

    res.status(StatusCodes.OK).json({
      message: "Resource updated successfully",
      data: resource,
    });
  } catch (error) {
    logger.error("Error updating resource:", error);
    const statusCode =
      error.message === "Resource not found"
        ? StatusCodes.NOT_FOUND
        : StatusCodes.BAD_REQUEST;

    res.status(statusCode).json({
      message: error.message || "Error updating resource",
      error: error.message,
    });
  }
};

// Delete resource
const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await resourceService.deleteResource(id);

    res.status(StatusCodes.OK).json({
      message: result.message,
      data: null,
    });
  } catch (error) {
    logger.error("Error deleting resource:", error);
    const statusCode =
      error.message === "Resource not found"
        ? StatusCodes.NOT_FOUND
        : StatusCodes.INTERNAL_SERVER_ERROR;

    res.status(statusCode).json({
      message: error.message || "Error deleting resource",
      error: error.message,
    });
  }
};

// Add feedback
const addFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comments } = req.body;
    const userId = req.user.userId;

    const resource = await resourceService.addFeedback(
      id,
      userId,
      rating,
      comments
    );

    res.status(StatusCodes.OK).json({
      message: "Feedback added successfully",
      data: resource,
    });
  } catch (error) {
    logger.error("Error adding feedback:", error);
    const statusCode =
      error.message === "Resource not found"
        ? StatusCodes.NOT_FOUND
        : StatusCodes.BAD_REQUEST;

    res.status(statusCode).json({
      message: error.message || "Error adding feedback",
      error: error.message,
    });
  }
};

// Track view
const trackView = async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await resourceService.trackView(id);

    res.status(StatusCodes.OK).json({
      message: "View tracked successfully",
      data: resource,
    });
  } catch (error) {
    logger.error("Error tracking view:", error);
    const statusCode =
      error.message === "Resource not found"
        ? StatusCodes.NOT_FOUND
        : StatusCodes.INTERNAL_SERVER_ERROR;

    res.status(statusCode).json({
      message: error.message || "Error tracking view",
      error: error.message,
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