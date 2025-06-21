const { StatusCodes } = require("http-status-codes");
const subjectService = require("../../services/learning/subject/subject.service");
const createLogger = require("../../services/logging.service");

const logger = createLogger("SubjectController");

// =============== CREATE SUBJECT ===============
const createSubject = async (req, res) => {
  logger.info("===================createSubject=======================");

  try {
    const subject = await subjectService.createSubject(req.body);

    logger.info("++++++✅ CREATE SUBJECT: Subject created successfully ++++++");
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Matière créée avec succès",
      data: { subject },
    });
  } catch (error) {
    logger.error("❌ CREATE SUBJECT ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Erreur lors de la création de la matière",
    });
  }
};

// =============== GET ALL SUBJECTS ===============
const getSubjects = async (req, res) => {
  logger.info("===================getSubjects=======================");

  try {
    const result = await subjectService.getSubjects(req.query);

    logger.info(
      "++++++✅ GET SUBJECTS: Subjects retrieved successfully ++++++"
    );
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Matières récupérées avec succès",
      data: result,
    });
  } catch (error) {
    logger.error("❌ GET SUBJECTS ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Erreur lors de la récupération des matières",
    });
  }
};

// =============== GET SUBJECT BY ID ===============
const getSubjectById = async (req, res) => {
  logger.info("===================getSubjectById=======================");

  try {
    const subject = await subjectService.getSubjectById(req.params.id);

    logger.info(
      "++++++✅ GET SUBJECT BY ID: Subject retrieved successfully ++++++"
    );
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Matière récupérée avec succès",
      data: { subject },
    });
  } catch (error) {
    logger.error("❌ GET SUBJECT BY ID ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Erreur lors de la récupération de la matière",
    });
  }
};

// =============== UPDATE SUBJECT ===============
const updateSubject = async (req, res) => {
  logger.info("===================updateSubject=======================");

  try {
    const subject = await subjectService.updateSubject(req.params.id, req.body);

    logger.info("++++++✅ UPDATE SUBJECT: Subject updated successfully ++++++");
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Matière mise à jour avec succès",
      data: { subject },
    });
  } catch (error) {
    logger.error("❌ UPDATE SUBJECT ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Erreur lors de la mise à jour de la matière",
    });
  }
};

// =============== DELETE SUBJECT ===============
const deleteSubject = async (req, res) => {
  logger.info("===================deleteSubject=======================");

  try {
    await subjectService.deleteSubject(req.params.id);

    logger.info("++++++✅ DELETE SUBJECT: Subject deleted successfully ++++++");
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Matière supprimée avec succès",
    });
  } catch (error) {
    logger.error("❌ DELETE SUBJECT ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Erreur lors de la suppression de la matière",
    });
  }
};

// =============== GET FEATURED SUBJECTS ===============
const getFeaturedSubjects = async (req, res) => {
  logger.info("===================getFeaturedSubjects=======================");

  try {
    const limit = parseInt(req.query.limit) || 6;
    const subjects = await subjectService.getFeaturedSubjects(limit);

    logger.info(
      "++++++✅ GET FEATURED SUBJECTS: Featured subjects retrieved ++++++"
    );
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Matières populaires récupérées avec succès",
      data: { subjects },
    });
  } catch (error) {
    logger.error("❌ GET FEATURED SUBJECTS ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message:
        error.message ||
        "Erreur lors de la récupération des matières populaires",
    });
  }
};

// =============== GET POPULAR SUBJECTS ===============
const getPopularSubjects = async (req, res) => {
  logger.info("===================getPopularSubjects=======================");

  try {
    const limit = parseInt(req.query.limit) || 10;
    const subjects = await subjectService.getPopularSubjects(limit);

    logger.info(
      "++++++✅ GET POPULAR SUBJECTS: Popular subjects retrieved ++++++"
    );
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Matières populaires récupérées avec succès",
      data: { subjects },
    });
  } catch (error) {
    logger.error("❌ GET POPULAR SUBJECTS ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message:
        error.message ||
        "Erreur lors de la récupération des matières populaires",
    });
  }
};

// =============== GET SUBJECTS BY EDUCATION AND COUNTRY ===============
const getSubjectsByEducationAndCountry = async (req, res) => {
  logger.info(
    "===================getSubjectsByEducationAndCountry======================="
  );

  try {
    const { educationLevel, country } = req.params;
    const subjects = await subjectService.getSubjectsByEducationAndCountry(
      educationLevel,
      country
    );

    logger.info(
      "++++++✅ GET SUBJECTS BY EDUCATION AND COUNTRY: Subjects retrieved ++++++"
    );
    res.status(StatusCodes.OK).json({
      message: "Matières tendance récupérées avec succès",
      data: trending,
    });
  } catch (error) {
    logger.error("Error in getTrendingSubjects controller", error, {
      query: req.query,
    });
    throw error;
  }
};

// Analytics Controller
const getSubjectAnalytics = async (req, res) => {
  try {
    const analytics = await analyticsService.getSubjectAnalytics(req.query);
    res.status(StatusCodes.OK).json({
      message: "Analyses des matières récupérées avec succès",
      data: analytics,
    });
  } catch (error) {
    logger.error("Error in getSubjectAnalytics controller", error, {
      query: req.query,
    });
    throw error;
  }
};

// Subject Performance Controller
const getSubjectPerformance = async (req, res) => {
  try {
    const performance = await analyticsService.getSubjectPerformance(
      req.params.id
    );
    res.status(StatusCodes.OK).json({
      message: "Performance de la matière récupérée avec succès",
      data: performance,
    });
  } catch (error) {
    logger.error("Error in getSubjectPerformance controller", error, {
      subjectId: req.params.id,
    });
    throw error;
  }
};

// Compare Subjects Controller
const compareSubjects = async (req, res) => {
  try {
    const { ids } = req.body;
    const comparison = await analyticsService.compareSubjects(ids);
    res.status(StatusCodes.OK).json({
      message: "Comparaison des matières effectuée avec succès",
      data: comparison,
    });
  } catch (error) {
    logger.error("Error in compareSubjects controller", error, {
      ids: req.body.ids,
    });
    throw error;
  }
};

// Bulk Create Controller
const bulkCreateSubjects = async (req, res) => {
  try {
    const { subjects } = req.body;
    const result = await bulkService.bulkCreateSubjects(subjects);
    res.status(StatusCodes.CREATED).json({
      message: "Création en lot terminée",
      data: result,
    });
  } catch (error) {
    logger.error("Error in bulkCreateSubjects controller", error);
    throw error;
  }
};

// Bulk Update Controller
const bulkUpdateSubjects = async (req, res) => {
  try {
    const { updates } = req.body;
    const result = await bulkService.bulkUpdateSubjects(updates);
    res.status(StatusCodes.OK).json({
      message: "Mise à jour en lot terminée",
      data: result,
    });
  } catch (error) {
    logger.error("Error in bulkUpdateSubjects controller", error);
    throw error;
  }
};

// Bulk Export Controller
const exportSubjects = async (req, res) => {
  try {
    const { format = "json", ...filters } = req.query;
    const result = await bulkService.bulkExportSubjects(filters, format);

    if (format === "csv") {
      // Set proper UTF-8 headers for CSV
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", "attachment; filename=subjects.csv");

      // Add UTF-8 BOM for proper Excel display
      const BOM = "\uFEFF";

      // Convert to CSV string with proper encoding
      const csvContent =
        BOM +
        [
          result.headers.join(","),
          ...result.data.map((row) =>
            row
              .map((cell) => {
                // Properly escape and encode French characters
                const cellStr = String(cell || "");
                return `"${cellStr.replace(/"/g, '""')}"`;
              })
              .join(",")
          ),
        ].join("\n");

      res.send(csvContent);
    } else {
      res.status(StatusCodes.OK).json({
        message: "Export des matières réussi",
        data: result.data,
        count: result.count,
        format: result.format,
      });
    }
  } catch (error) {
    logger.error("Error in exportSubjects controller", error, {
      query: req.query,
    });
    throw error;
  }
};

module.exports = {
  createSubject,
  getSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
  rateSubject,
  addExamToSubject,
  removeExamFromSubject,
  getSubjectsBySeries,
  // New advanced controllers
  advancedSearch,
  getSearchSuggestions,
  getTrendingSubjects,
  getSubjectAnalytics,
  getSubjectPerformance,
  compareSubjects,
  bulkCreateSubjects,
  bulkUpdateSubjects,
  exportSubjects,
};
