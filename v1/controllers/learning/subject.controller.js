const { StatusCodes } = require("http-status-codes");
const subjectService = require("../../services/learning/subject/subject.service");
const createLogger = require("../../services/logging.service");

const logger = createLogger("SubjectController");

// Create a new subject
const createSubject = async (req, res) => {
  try {
    const subject = await subjectService.createSubject(req.body);
    res.status(StatusCodes.CREATED).json({
      message: "Matière créée avec succès",
      data: subject,
    });
  } catch (error) {
    logger.error("Error in createSubject controller", error);
    throw error;
  }
};

// Get all subjects with advanced search
const getSubjects = async (req, res) => {
  try {
    const result = await subjectService.getSubjects(req.query);
    res.status(StatusCodes.OK).json({
      message: "Matières récupérées avec succès",
      data: result.subjects,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error("Error in getSubjects controller", error, {
      query: req.query,
    });
    throw error;
  }
};

// Get subject by ID
const getSubjectById = async (req, res) => {
  try {
    const result = await subjectService.getSubjectById(req.params.id);
    res.status(StatusCodes.OK).json({
      message: "Matière récupérée avec succès",
      data: result.subject,
    });
  } catch (error) {
    logger.error("Error in getSubjectById controller", error, {
      subjectId: req.params.id,
    });
    throw error;
  }
};

// Update subject
const updateSubject = async (req, res) => {
  try {
    const subject = await subjectService.updateSubject(req.params.id, req.body);
    res.status(StatusCodes.OK).json({
      message: "Matière mise à jour avec succès",
      data: subject,
    });
  } catch (error) {
    logger.error("Error in updateSubject controller", error, {
      subjectId: req.params.id,
    });
    throw error;
  }
};

// Delete subject
const deleteSubject = async (req, res) => {
  try {
    const result = await subjectService.deleteSubject(req.params.id);
    res.status(StatusCodes.OK).json({
      message: result.message,
    });
  } catch (error) {
    logger.error("Error in deleteSubject controller", error, {
      subjectId: req.params.id,
    });
    throw error;
  }
};

// Rate subject
const rateSubject = async (req, res) => {
  try {
    const { rating } = req.body;
    const subject = await subjectService.rateSubject(req.params.id, rating);
    res.status(StatusCodes.OK).json({
      message: "Note ajoutée avec succès",
      data: subject,
    });
  } catch (error) {
    logger.error("Error in rateSubject controller", error, {
      subjectId: req.params.id,
    });
    throw error;
  }
};

// Add exam to subject
const addExamToSubject = async (req, res) => {
  try {
    const subject = await subjectService.addExamToSubject(
      req.params.id,
      req.body.examId
    );
    res.status(StatusCodes.OK).json({
      message: "Examen ajouté à la matière avec succès",
      data: subject,
    });
  } catch (error) {
    logger.error("Error in addExamToSubject controller", error, {
      subjectId: req.params.id,
      examId: req.body.examId,
    });
    throw error;
  }
};

// Remove exam from subject
const removeExamFromSubject = async (req, res) => {
  try {
    const subject = await subjectService.removeExamFromSubject(
      req.params.id,
      req.params.examId
    );
    res.status(StatusCodes.OK).json({
      message: "Examen retiré de la matière avec succès",
      data: subject,
    });
  } catch (error) {
    logger.error("Error in removeExamFromSubject controller", error, {
      subjectId: req.params.id,
      examId: req.params.examId,
    });
    throw error;
  }
};

// Get subjects by series
const getSubjectsBySeries = async (req, res) => {
  try {
    // Merge series param with other query parameters
    const queryWithSeries = {
      ...req.query,
      series: req.params.series,
    };

    const subjects = await subjectService.getSubjects(queryWithSeries);

    res.status(StatusCodes.OK).json({
      message: "Matières récupérées par série avec succès",
      data: subjects.subjects,
      pagination: subjects.pagination,
    });
  } catch (error) {
    logger.error("Error in getSubjectsBySeries controller", error, {
      series: req.params.series,
      query: req.query,
    });
    throw error;
  }
};

// Advanced Search Controller
const advancedSearch = async (req, res) => {
  try {
    const result = await searchService.advancedSearch(req.query);
    res.status(StatusCodes.OK).json({
      message: "Recherche avancée exécutée avec succès",
      data: result.subjects,
      pagination: result.pagination,
      facets: result.facets,
      searchParams: result.searchParams,
    });
  } catch (error) {
    logger.error("Error in advancedSearch controller", error, {
      query: req.query,
    });
    throw error;
  }
};

// Search Suggestions Controller
const getSearchSuggestions = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    // Convert limit to number
    const limitNum = Number.parseInt(limit) || 10;
    const suggestions = await searchService.getSearchSuggestions(q, limitNum);
    res.status(StatusCodes.OK).json({
      message: "Suggestions de recherche récupérées avec succès",
      data: suggestions,
    });
  } catch (error) {
    logger.error("Error in getSearchSuggestions controller", error, {
      query: req.query,
    });
    throw error;
  }
};

// Trending Subjects Controller
const getTrendingSubjects = async (req, res) => {
  try {
    const { period = "week", limit = 10 } = req.query;
    // Convert limit to number
    const limitNum = Number.parseInt(limit) || 10;
    const trending = await analyticsService.getTrendingSubjects(
      period,
      limitNum
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
