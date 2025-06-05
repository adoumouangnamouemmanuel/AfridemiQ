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
      facets: result.facets,
    });
  } catch (error) {
    logger.error("Error in getSubjects controller", error, {
      query: req.query,
    });
    throw error;
  }
};

// Advanced search endpoint
const advancedSearch = async (req, res) => {
  try {
    const result = await subjectService.advancedSearch(req.query);
    res.status(StatusCodes.OK).json({
      message: "Recherche avancée effectuée avec succès",
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

// Get search suggestions
const getSearchSuggestions = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    const suggestions = await subjectService.getSearchSuggestions(
      q,
      Number.parseInt(limit)
    );
    res.status(StatusCodes.OK).json({
      message: "Suggestions récupérées avec succès",
      data: suggestions,
    });
  } catch (error) {
    logger.error("Error in getSearchSuggestions controller", error, {
      query: req.query,
    });
    throw error;
  }
};

// Get trending searches
const getTrendingSearches = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const trending = await subjectService.getTrendingSearches(
      Number.parseInt(limit)
    );
    res.status(StatusCodes.OK).json({
      message: "Recherches tendances récupérées avec succès",
      data: trending,
    });
  } catch (error) {
    logger.error("Error in getTrendingSearches controller", error);
    throw error;
  }
};

// Get subject by ID
const getSubjectById = async (req, res) => {
  try {
    const { includeRelated = false } = req.query;
    const result = await subjectService.getSubjectById(
      req.params.id,
      includeRelated === "true"
    );
    res.status(StatusCodes.OK).json({
      message: "Matière récupérée avec succès",
      data: result.subject,
      related: result.related,
      performance: result.performance,
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
    const subjects = await subjectService.getRelatedSubjects(req.params.series);
    res.status(StatusCodes.OK).json({
      message: "Matières récupérées par série avec succès",
      data: subjects,
    });
  } catch (error) {
    logger.error("Error in getSubjectsBySeries controller", error, {
      series: req.params.series,
    });
    throw error;
  }
};

// Get subject analytics
const getSubjectAnalytics = async (req, res) => {
  try {
    const analytics = await subjectService.getSubjectAnalytics(req.query);
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

// Get trending subjects
const getTrendingSubjects = async (req, res) => {
  try {
    const { period = "week", limit = 10 } = req.query;
    const trending = await subjectService.getTrendingSubjects(
      period,
      Number.parseInt(limit)
    );
    res.status(StatusCodes.OK).json({
      message: "Matières tendances récupérées avec succès",
      data: trending,
    });
  } catch (error) {
    logger.error("Error in getTrendingSubjects controller", error, {
      query: req.query,
    });
    throw error;
  }
};

// Compare subjects
const compareSubjects = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length < 2) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Au moins 2 IDs de matières sont requis pour la comparaison",
        status: "error",
      });
    }

    const comparison = await subjectService.compareSubjects(ids);
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

// Bulk operations
const bulkCreateSubjects = async (req, res) => {
  try {
    const { subjects } = req.body;
    const result = await subjectService.bulkCreateSubjects(subjects);
    res.status(StatusCodes.OK).json({
      message: "Création en lot effectuée",
      data: result,
    });
  } catch (error) {
    logger.error("Error in bulkCreateSubjects controller", error);
    throw error;
  }
};

const bulkUpdateSubjects = async (req, res) => {
  try {
    const { updates } = req.body;
    const result = await subjectService.bulkUpdateSubjects(updates);
    res.status(StatusCodes.OK).json({
      message: "Mise à jour en lot effectuée",
      data: result,
    });
  } catch (error) {
    logger.error("Error in bulkUpdateSubjects controller", error);
    throw error;
  }
};

const bulkDeleteSubjects = async (req, res) => {
  try {
    const { ids } = req.body;
    const result = await subjectService.bulkDeleteSubjects(ids);
    res.status(StatusCodes.OK).json({
      message: "Suppression en lot effectuée",
      data: result,
    });
  } catch (error) {
    logger.error("Error in bulkDeleteSubjects controller", error);
    throw error;
  }
};

const exportSubjects = async (req, res) => {
  try {
    const { format = "json" } = req.query;
    const result = await subjectService.bulkExportSubjects(req.query, format);

    if (format === "csv") {
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=subjects.csv");

      const csvContent = [
        result.headers.join(","),
        ...result.data.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      res.send(csvContent);
    } else {
      res.status(StatusCodes.OK).json({
        message: "Export effectué avec succès",
        data: result.data,
        count: result.count,
      });
    }
  } catch (error) {
    logger.error("Error in exportSubjects controller", error, {
      query: req.query,
    });
    throw error;
  }
};

const importSubjects = async (req, res) => {
  try {
    const { data, format = "json" } = req.body;
    const result = await subjectService.bulkImportSubjects(data, format);
    res.status(StatusCodes.OK).json({
      message: "Import effectué avec succès",
      data: result,
    });
  } catch (error) {
    logger.error("Error in importSubjects controller", error);
    throw error;
  }
};

module.exports = {
  createSubject,
  getSubjects,
  advancedSearch,
  getSearchSuggestions,
  getTrendingSearches,
  getSubjectById,
  updateSubject,
  deleteSubject,
  rateSubject,
  addExamToSubject,
  removeExamFromSubject,
  getSubjectsBySeries,
  getSubjectAnalytics,
  getTrendingSubjects,
  compareSubjects,
  bulkCreateSubjects,
  bulkUpdateSubjects,
  bulkDeleteSubjects,
  exportSubjects,
  importSubjects,
};