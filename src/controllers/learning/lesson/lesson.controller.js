const { StatusCodes } = require("http-status-codes");
const lessonService = require("../../../services/learning/lesson/lesson.service");
const { asyncHandler } = require("../../../utils/asyncHandler");
const { ApiError } = require("../../../utils/ApiError");
const createLogger = require("../../../services/logging.service");
const { Lesson } = require("../../../models/learning/lesson/lesson.model");

const logger = createLogger("LessonController");

class LessonController {
  createLesson = asyncHandler(async (req, res) => {
    const lessonData = req.body;
    const result = await lessonService.createLesson(lessonData, req.user.id);
    res.status(result.statusCode).json(result);
  });

  getLessonById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await lessonService.getLessonById(id);
    res.status(result.statusCode).json(result);
  });

  getLessons = asyncHandler(async (req, res) => {
    const options = {
      page: Number.parseInt(req.query.page) || 1,
      limit: Number.parseInt(req.query.limit) || 20,
      topicId: req.query.topicId,
      series: req.query.series,
      interactivityLevel: req.query.interactivityLevel,
      premiumOnly: req.query.premiumOnly === "true",
      offlineAvailable: req.query.offlineAvailable === "true",
    };
    const result = await lessonService.getLessons(options);
    res.status(result.statusCode).json(result);
  });

  updateLesson = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const lesson = await Lesson.findById(id).select("metadata.createdBy");
    if (!lesson) {
      logger.warn(`Leçon introuvable pour la mise à jour: ${id}`);
      throw new ApiError(404, "Leçon introuvable");
    }
    if (
      lesson.metadata.createdBy.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      logger.warn(
        `Utilisateur non autorisé ${req.user.id} pour la mise à jour de la leçon ${id}`
      );
      throw new ApiError(403, "Non autorisé à mettre à jour cette leçon");
    }
    const result = await lessonService.updateLesson(id, req.body, req.user.id);
    res.status(result.statusCode).json(result);
  });

  deleteLesson = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const lesson = await Lesson.findById(id).select("metadata.createdBy");
    if (!lesson) {
      logger.warn(`Leçon introuvable pour la suppression: ${id}`);
      throw new ApiError(404, "Leçon introuvable");
    }
    if (
      lesson.metadata.createdBy.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      logger.warn(
        `Utilisateur non autorisé ${req.user.id} pour la suppression de la leçon ${id}`
      );
      throw new ApiError(403, "Non autorisé à supprimer cette leçon");
    }
    const result = await lessonService.deleteLesson(id);
    res.status(result.statusCode).json(result);
  });

  addFeedback = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await lessonService.addFeedback(id, req.body, req.user.id);
    res.status(result.statusCode).json(result);
  });
}

module.exports = new LessonController();