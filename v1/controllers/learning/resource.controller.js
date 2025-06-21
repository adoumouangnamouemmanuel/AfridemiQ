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

// =============== SEARCH RESOURCES ===============
const searchResources = async (req, res) => {
  logger.info("===================searchResources=======================");

  try {
    const { q: searchTerm } = req.query;
    const result = await resourceService.searchResources(searchTerm, req.query);

    logger.info(
      "++++++✅ SEARCH RESOURCES: Search completed successfully ++++++"
    );
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Recherche effectuée avec succès",
      data: result,
    });
  } catch (error) {
    logger.error("❌ SEARCH RESOURCES ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Erreur lors de la recherche",
    });
  }
};

// =============== GET RESOURCE STATISTICS ===============
const getResourceStatistics = async (req, res) => {
  logger.info(
    "===================getResourceStatistics======================="
  );

  try {
    const statistics = await resourceService.getResourceStatistics();

    logger.info(
      "++++++✅ GET RESOURCE STATISTICS: Statistics retrieved ++++++"
    );
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Statistiques récupérées avec succès",
      data: { statistics },
    });
  } catch (error) {
    logger.error("❌ GET RESOURCE STATISTICS ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message:
        error.message || "Erreur lors de la récupération des statistiques",
    });
  }
};

// =============== GET RESOURCE FORMATS ===============
const getResourceFormats = async (req, res) => {
  logger.info("===================getResourceFormats=======================");

  try {
    const formats = await resourceService.getResourceFormats();

    logger.info("++++++✅ GET RESOURCE FORMATS: Formats retrieved ++++++");
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Formats récupérés avec succès",
      data: { formats },
    });
  } catch (error) {
    logger.error("❌ GET RESOURCE FORMATS ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Erreur lors de la récupération des formats",
    });
  }
};

// =============== ADD FEEDBACK ===============
const addFeedback = async (req, res) => {
  logger.info("===================addFeedback=======================");

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

    logger.info("++++++✅ ADD FEEDBACK: Feedback added successfully ++++++");
    res.status(StatusCodes.OK).json({
      message: "Search completed successfully",
      data: result,
    });
  } catch (error) {
    logger.error("❌ ADD FEEDBACK ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Erreur lors de l'ajout du commentaire",
    });
  }
};

// =============== TRACK VIEW ===============
const trackView = async (req, res) => {
  logger.info("===================trackView=======================");

  try {
    const resource = await resourceService.trackView(req.params.id);

    logger.info("++++++✅ TRACK VIEW: View tracked successfully ++++++");
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Vue enregistrée avec succès",
      data: { resource },
    });
  } catch (error) {
    logger.error("❌ TRACK VIEW ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Erreur lors de l'enregistrement de la vue",
    });
  }
};

// =============== TRACK DOWNLOAD ===============
const trackDownload = async (req, res) => {
  logger.info("===================trackDownload=======================");

  try {
    const resource = await resourceService.trackDownload(req.params.id);

    logger.info(
      "++++++✅ TRACK DOWNLOAD: Download tracked successfully ++++++"
    );
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Téléchargement enregistré avec succès",
      data: { resource },
    });
  } catch (error) {
    logger.error("❌ TRACK DOWNLOAD ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message:
        error.message || "Erreur lors de l'enregistrement du téléchargement",
    });
  }
};

// =============== BULK CREATE RESOURCES ===============
const bulkCreateResources = async (req, res) => {
  logger.info("===================bulkCreateResources=======================");

  try {
    const { resources } = req.body;
    const result = await resourceService.bulkCreateResources(resources);

    logger.info(
      "++++++✅ BULK CREATE RESOURCES: Resources created successfully ++++++"
    );
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Ressources créées avec succès",
      data: { resources: result },
    });
  } catch (error) {
    logger.error("❌ BULK CREATE RESOURCES ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Erreur lors de la création des ressources",
    });
  }
};

// =============== GET ADMIN ANALYTICS ===============
const getAdminAnalytics = async (req, res) => {
  logger.info("===================getAdminAnalytics=======================");

  try {
    const analytics = await resourceService.getAdminAnalytics();

    logger.info("++++++✅ GET ADMIN ANALYTICS: Analytics retrieved ++++++");
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Analyses administrateur récupérées avec succès",
      data: { analytics },
    });
  } catch (error) {
    logger.error("❌ GET ADMIN ANALYTICS ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Erreur lors de la récupération des analyses",
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