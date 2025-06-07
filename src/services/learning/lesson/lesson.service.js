const { Lesson } = require("../../../models/learning/lesson/lesson.base.model");
const { ApiError } = require("../../../utils/ApiError");
const { ApiResponse } = require("../../../utils/ApiResponse");
const createLogger = require("../../../services/logging.service");

const logger = createLogger("LessonService");

class LessonService {
  // Create a new lesson
  async createLesson(lessonData, userId) {
    try {
      const lesson = new Lesson({
        ...lessonData,
        metadata: {
          ...lessonData.metadata,
          createdBy: userId,
          updatedBy: userId,
        },
      });
      await lesson.save();
      await lesson.populate([
        { path: "topicId", select: "name" },
        { path: "resourceIds", select: "title type" },
        { path: "exerciseIds", select: "title type" },
        { path: "metadata.createdBy", select: "name email" },
        { path: "metadata.updatedBy", select: "name email" },
        { path: "feedback.userId", select: "name" },
      ]);

      logger.info(`Leçon créée: ${lesson._id} par l'utilisateur ${userId}`);
      return new ApiResponse(201, lesson, "Leçon créée avec succès");
    } catch (error) {
      logger.error(
        `Erreur lors de la création de la leçon par l'utilisateur ${userId}:`,
        error
      );
      if (error instanceof ApiError) throw error;
      if (error.name === "ValidationError") {
        throw new ApiError(
          400,
          "Validation échouée",
          Object.values(error.errors).map((e) => e.message)
        );
      }
      throw new ApiError(
        500,
        "Échec de la création de la leçon",
        error.message
      );
    }
  }

  // Get lesson by ID
  async getLessonById(id) {
    try {
      const lesson = await Lesson.findById(id)
        .populate([
          { path: "topicId", select: "name" },
          { path: "resourceIds", select: "title type" },
          { path: "exerciseIds", select: "title type" },
          { path: "metadata.createdBy", select: "name email" },
          { path: "metadata.updatedBy", select: "name email" },
          { path: "feedback.userId", select: "name" },
        ])
        .lean();
      if (!lesson) {
        logger.warn(`Leçon introuvable: ${id}`);
        throw new ApiError(404, "Leçon introuvable");
      }
      logger.info(`Récupération de la leçon: ${id}`);
      return new ApiResponse(200, lesson, "Leçon récupérée avec succès");
    } catch (error) {
      logger.error(`Erreur lors de la récupération de la leçon ${id}:`, error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        500,
        "Échec de la récupération de la leçon",
        error.message
      );
    }
  }

  // Get lessons with filters
  async getLessons(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        topicId,
        series,
        interactivityLevel,
        premiumOnly,
        offlineAvailable,
      } = options;
      const query = {};
      if (topicId) query.topicId = topicId;
      if (series) query.series = series;
      if (interactivityLevel) query.interactivityLevel = interactivityLevel;
      if (premiumOnly !== undefined) query.premiumOnly = premiumOnly;
      if (offlineAvailable !== undefined)
        query.offlineAvailable = offlineAvailable;

      const skip = (page - 1) * limit;
      const [lessons, total] = await Promise.all([
        Lesson.find(query)
          .populate([
            { path: "topicId", select: "name" },
            { path: "resourceIds", select: "title type" },
            { path: "exerciseIds", select: "title type" },
            { path: "metadata.createdBy", select: "name email" },
            { path: "metadata.updatedBy", select: "name email" },
          ])
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number.parseInt(limit))
          .lean(),
        Lesson.countDocuments(query),
      ]);

      logger.info(`Récupération de ${lessons.length} leçons`);
      return new ApiResponse(
        200,
        {
          lessons,
          pagination: {
            currentPage: Number.parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: Number.parseInt(limit),
          },
        },
        "Leçons récupérées avec succès"
      );
    } catch (error) {
      logger.error("Erreur lors de la récupération des leçons:", error);
      throw new ApiError(
        500,
        "Échec de la récupération des leçons",
        error.message
      );
    }
  }

  // Update lesson
  async updateLesson(id, data, userId) {
    try {
      const updateData = {
        ...data,
        metadata: { ...data.metadata, updatedBy: userId },
      };
      const lesson = await Lesson.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      )
        .populate([
          { path: "topicId", select: "name" },
          { path: "resourceIds", select: "title type" },
          { path: "exerciseIds", select: "title type" },
          { path: "metadata.createdBy", select: "name email" },
          { path: "metadata.updatedBy", select: "name email" },
          { path: "feedback.userId", select: "name" },
        ])
        .lean();
      if (!lesson) {
        logger.warn(`Leçon introuvable pour la mise à jour: ${id}`);
        throw new ApiError(404, "Leçon introuvable");
      }
      logger.info(`Mise à jour de la leçon: ${id} par l'utilisateur ${userId}`);
      return new ApiResponse(200, lesson, "Leçon mise à jour avec succès");
    } catch (error) {
      logger.error(`Erreur lors de la mise à jour de la leçon ${id}:`, error);
      if (error instanceof ApiError) throw error;
      if (error.name === "ValidationError") {
        throw new ApiError(
          400,
          "Validation échouée",
          Object.values(error.errors).map((e) => e.message)
        );
      }
      throw new ApiError(
        500,
        "Échec de la mise à jour de la leçon",
        error.message
      );
    }
  }

  // Delete lesson
  async deleteLesson(id) {
    try {
      const lesson = await Lesson.findByIdAndDelete(id);
      if (!lesson) {
        logger.warn(`Leçon introuvable pour la suppression: ${id}`);
        throw new ApiError(404, "Leçon introuvable");
      }
      logger.info(`Suppression de la leçon: ${id}`);
      return new ApiResponse(200, null, "Leçon supprimée avec succès");
    } catch (error) {
      logger.error(`Erreur lors de la suppression de la leçon ${id}:`, error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        500,
        "Échec de la suppression de la leçon",
        error.message
      );
    }
  }

  // Add feedback to lesson
  async addFeedback(id, feedbackData, userId) {
    try {
      const lesson = await Lesson.findById(id);
      if (!lesson) {
        logger.warn(`Leçon introuvable pour l'ajout de feedback: ${id}`);
        throw new ApiError(404, "Leçon introuvable");
      }
      lesson.feedback.push({ ...feedbackData, userId });
      await lesson.save();
      await lesson.populate([
        { path: "topicId", select: "name" },
        { path: "resourceIds", select: "title type" },
        { path: "exerciseIds", select: "title type" },
        { path: "metadata.createdBy", select: "name email" },
        { path: "metadata.updatedBy", select: "name email" },
        { path: "feedback.userId", select: "name" },
      ]);

      logger.info(
        `Feedback ajouté à la leçon ${id} par l'utilisateur ${userId}`
      );
      return new ApiResponse(200, lesson, "Feedback ajouté avec succès");
    } catch (error) {
      logger.error(
        `Erreur lors de l'ajout de feedback à la leçon ${id}:`,
        error
      );
      if (error instanceof ApiError) throw error;
      throw new ApiError(400, "Échec de l'ajout du feedback", error.message);
    }
  }
}

module.exports = LessonService;
