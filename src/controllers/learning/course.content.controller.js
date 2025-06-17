const { StatusCodes } = require("http-status-codes");
const courseContentService = require("../../services/learning/courseContent/course.content.service");
const createLogger  = require("../../services/logging.service");

const logger = createLogger("CourseContentController");

// Get all course contents
const getAllCourseContents = async (req, res) => {
  try {
    const filters = {
      search: req.query.search,
      subjectId: req.query.subjectId,
      examId: req.query.examId,
      topicId: req.query.topicId,
      level: req.query.level,
      series: req.query.series,
      premiumOnly: req.query.premiumOnly,
    };

    const options = {
      page: req.query.page,
      limit: req.query.limit,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
    };

    const result = await courseContentService.getAllCourseContents(
      filters,
      options
    );

    logger.info(`Retrieved ${result.courseContents.length} course contents`);
    res.status(StatusCodes.OK).json({
      message: "Contenus de cours récupérés avec succès",
      data: result,
    });
  } catch (error) {
    logger.error("Error getting all course contents:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Erreur lors de la récupération des contenus de cours",
      error: error.message,
    });
  }
};

// Get course content by ID
const getCourseContentById = async (req, res) => {
  try {
    const { id } = req.params;
    const courseContent = await courseContentService.getCourseContentById(id);

    logger.info(`Retrieved course content: ${courseContent.title}`);
    res.status(StatusCodes.OK).json({
      message: "Contenu de cours récupéré avec succès",
      data: courseContent,
    });
  } catch (error) {
    logger.error("Error getting course content by ID:", error);
    const statusCode = error.message.includes("non trouvé")
      ? StatusCodes.NOT_FOUND
      : StatusCodes.INTERNAL_SERVER_ERROR;

    res.status(statusCode).json({
      message: "Erreur lors de la récupération du contenu de cours",
      error: error.message,
    });
  }
};

// Create course content
const createCourseContent = async (req, res) => {
  try {
    const userId = req.user.userId;
    const courseContent = await courseContentService.createCourseContent(
      req.body,
      userId
    );

    logger.info(`Created course content: ${courseContent.title}`);
    res.status(StatusCodes.CREATED).json({
      message: "Contenu de cours créé avec succès",
      data: courseContent,
    });
  } catch (error) {
    logger.error("Error creating course content:", error);
    const statusCode = error.message.includes("existe déjà")
      ? StatusCodes.CONFLICT
      : StatusCodes.BAD_REQUEST;

    res.status(statusCode).json({
      message: "Erreur lors de la création du contenu de cours",
      error: error.message,
    });
  }
};

// Update course content
const updateCourseContent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const courseContent = await courseContentService.updateCourseContent(
      id,
      req.body,
      userId
    );

    logger.info(`Updated course content: ${courseContent.title}`);
    res.status(StatusCodes.OK).json({
      message: "Contenu de cours mis à jour avec succès",
      data: courseContent,
    });
  } catch (error) {
    logger.error("Error updating course content:", error);
    const statusCode = error.message.includes("non trouvé")
      ? StatusCodes.NOT_FOUND
      : StatusCodes.BAD_REQUEST;

    res.status(statusCode).json({
      message: "Erreur lors de la mise à jour du contenu de cours",
      error: error.message,
    });
  }
};

// Delete course content
const deleteCourseContent = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await courseContentService.deleteCourseContent(id);

    logger.info(`Deleted course content with ID: ${id}`);
    res.status(StatusCodes.OK).json({
      message: result.message,
      data: null,
    });
  } catch (error) {
    logger.error("Error deleting course content:", error);
    const statusCode = error.message.includes("non trouvé")
      ? StatusCodes.NOT_FOUND
      : StatusCodes.INTERNAL_SERVER_ERROR;

    res.status(statusCode).json({
      message: "Erreur lors de la suppression du contenu de cours",
      error: error.message,
    });
  }
};

// Get course contents by subject
const getCourseContentsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    
    // FIX: Extract filters from query parameters to handle topicId filtering
    const filters = {
      subjectId: subjectId,
      series: req.query.series,
      level: req.query.level,
      topicId: req.query.topicId, // ADD: Include topicId from query
      isActive: req.query.isActive !== undefined ? req.query.isActive : true,
    };

    console.log("🔍 CourseContent Controller - Filters received:", filters);

    const courseContents =
      await courseContentService.getCourseContentsBySubject(subjectId, filters);

    logger.info(
      `Retrieved ${courseContents.length} course contents for subject ${subjectId} with filters:`,
      filters
    );
    
    res.status(StatusCodes.OK).json({
      message: "Contenus de cours récupérés avec succès",
      data: courseContents,
    });
  } catch (error) {
    logger.error("Error getting course contents by subject:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message:
        "Erreur lors de la récupération des contenus de cours par matière",
      error: error.message,
    });
  }
};

// Get course contents by exam
const getCourseContentsByExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const options = {
      level: req.query.level,
      series: req.query.series,
    };

    const courseContents = await courseContentService.getCourseContentsByExam(
      examId,
      options
    );

    logger.info(
      `Retrieved ${courseContents.length} course contents for exam ${examId}`
    );
    res.status(StatusCodes.OK).json({
      message: "Contenus de cours récupérés avec succès",
      data: courseContents,
    });
  } catch (error) {
    logger.error("Error getting course contents by exam:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message:
        "Erreur lors de la récupération des contenus de cours par examen",
      error: error.message,
    });
  }
};

// Update progress tracking
const updateProgressTracking = async (req, res) => {
  try {
    const { id } = req.params;
    const courseContent = await courseContentService.updateProgressTracking(
      id,
      req.body
    );

    logger.info(
      `Updated progress tracking for course content: ${courseContent.title}`
    );
    res.status(StatusCodes.OK).json({
      message: "Suivi de progression mis à jour avec succès",
      data: courseContent,
    });
  } catch (error) {
    logger.error("Error updating progress tracking:", error);
    const statusCode = error.message.includes("non trouvé")
      ? StatusCodes.NOT_FOUND
      : StatusCodes.BAD_REQUEST;

    res.status(statusCode).json({
      message: "Erreur lors de la mise à jour du suivi de progression",
      error: error.message,
    });
  }
};

// Get course content statistics
const getCourseContentStatistics = async (req, res) => {
  try {
    const statistics = await courseContentService.getCourseContentStatistics();

    logger.info("Retrieved course content statistics");
    res.status(StatusCodes.OK).json({
      message: "Statistiques des contenus de cours récupérées avec succès",
      data: statistics,
    });
  } catch (error) {
    logger.error("Error getting course content statistics:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Erreur lors de la récupération des statistiques",
      error: error.message,
    });
  }
};

// Search course contents
const searchCourseContents = async (req, res) => {
  try {
    const { q: searchTerm } = req.query;
    if (!searchTerm) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Terme de recherche requis",
        error: "Le paramètre 'q' est obligatoire",
      });
    }

    const options = {
      limit: req.query.limit,
      level: req.query.level,
      series: req.query.series,
      subjectId: req.query.subjectId,
    };

    const courseContents = await courseContentService.searchCourseContents(
      searchTerm,
      options
    );

    logger.info(
      `Found ${courseContents.length} course contents for search: ${searchTerm}`
    );
    res.status(StatusCodes.OK).json({
      message: "Recherche effectuée avec succès",
      data: courseContents,
    });
  } catch (error) {
    logger.error("Error searching course contents:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Erreur lors de la recherche",
      error: error.message,
    });
  }
};

// Get difficulty levels
const getDifficultyLevels = async (req, res) => {
  try {
    const levels = await courseContentService.getDifficultyLevels();

    res.status(StatusCodes.OK).json({
      message: "Niveaux de difficulté récupérés avec succès",
      data: levels,
    });
  } catch (error) {
    logger.error("Error getting difficulty levels:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Erreur lors de la récupération des niveaux de difficulté",
      error: error.message,
    });
  }
};

// Bulk create course contents
const bulkCreateCourseContents = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { courseContents } = req.body;

    if (!Array.isArray(courseContents) || courseContents.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Liste de contenus de cours requise",
        error: "Le champ 'courseContents' doit être un tableau non vide",
      });
    }

    const result = await courseContentService.bulkCreateCourseContents(
      courseContents,
      userId
    );

    logger.info(
      `Bulk created ${result.results.length} course contents with ${result.errors.length} errors`
    );
    res.status(StatusCodes.CREATED).json({
      message: "Création en lot effectuée",
      data: result,
    });
  } catch (error) {
    logger.error("Error bulk creating course contents:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Erreur lors de la création en lot",
      error: error.message,
    });
  }
};

module.exports = {
  getAllCourseContents,
  getCourseContentById,
  createCourseContent,
  updateCourseContent,
  deleteCourseContent,
  getCourseContentsBySubject,
  getCourseContentsByExam,
  updateProgressTracking,
  getCourseContentStatistics,
  searchCourseContents,
  getDifficultyLevels,
  bulkCreateCourseContents,
};