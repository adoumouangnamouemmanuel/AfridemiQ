const LessonService = require("./lesson.service");
const { Lesson } = require("../../../models/learning/lesson/lesson.base.model");
const { ApiError } = require("../../../utils/ApiError");
const { ApiResponse } = require("../../../utils/ApiResponse");
const createLogger = require("../../../services/logging.service");

const logger = createLogger("HistoryLessonService");

// Extend LessonService for HistoryLesson-specific logic
class HistoryLessonService extends LessonService {
  // Create a new history lesson
  async createLesson(lessonData, userId) {
    try {
      lessonData.subjectType = "history";
      const lesson = new Lesson({
        ...lessonData,
        metadata: { createdBy: userId, updatedBy: userId },
      });
      await lesson.save();
      await lesson.populate([
        { path: "topicId", select: "name" },
        { path: "resourceIds", select: "title type" },
        { path: "exerciseIds", select: "title type" },
        { path: "metadata.createdBy", select: "name email" },
        { path: "metadata.updatedBy", select: "name email" },
        { path: "feedback.userId", select: "name" },
        { path: "concepts.conceptQuizId", select: "title" },
        { path: "sourceAnalysis.sourceQuizId", select: "title" },
        { path: "timeline.timelineExerciseId", select: "title type" },
        { path: "practiceExercises.exerciseId", select: "title type" },
        { path: "prerequisites", select: "name" },
        { path: "summary.suggestedNextTopics", select: "name" },
      ]);

      logger.info(
        `Leçon d'histoire créée: ${lesson._id} par l'utilisateur ${userId}`
      );
      return new ApiResponse(201, lesson, "Leçon d'histoire créée avec succès");
    } catch (error) {
      logger.error(
        `Erreur lors de la création de la leçon d'histoire par l'utilisateur ${userId}:`,
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
        "Échec de la création de la leçon d'histoire",
        error.message
      );
    }
  }

  // Get history lesson by ID
  async getLessonById(id) {
    try {
      const lesson = await Lesson.findOne({ _id: id, subjectType: "history" })
        .populate([
          { path: "topicId", select: "name" },
          { path: "resourceIds", select: "title type" },
          { path: "exerciseIds", select: "title type" },
          { path: "metadata.createdBy", select: "name email" },
          { path: "metadata.updatedBy", select: "name email" },
          { path: "feedback.userId", select: "name" },
          { path: "concepts.conceptQuizId", select: "title" },
          { path: "sourceAnalysis.sourceQuizId", select: "title" },
          { path: "timeline.timelineExerciseId", select: "title type" },
          { path: "practiceExercises.exerciseId", select: "title type" },
          { path: "prerequisites", select: "name" },
          { path: "summary.suggestedNextTopics", select: "name" },
        ])
        .lean();
      if (!lesson) {
        logger.warn(`Leçon d'histoire introuvable: ${id}`);
        throw new ApiError(404, "Leçon d'histoire introuvable");
      }
      logger.info(`Récupération de la leçon d'histoire: ${id}`);
      return new ApiResponse(
        200,
        lesson,
        "Leçon d'histoire récupérée avec succès"
      );
    } catch (error) {
      logger.error(
        `Erreur lors de la récupération de la leçon d'histoire ${id}:`,
        error
      );
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        500,
        "Échec de la récupération de la leçon d'histoire",
        error.message
      );
    }
  }

  // Get history lessons with filters
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
      const query = { subjectType: "history" };
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
            { path: "feedback.userId", select: "name" },
            { path: "concepts.conceptQuizId", select: "title" },
            { path: "sourceAnalysis.sourceQuizId", select: "title" },
            { path: "timeline.timelineExerciseId", select: "title type" },
            { path: "practiceExercises.exerciseId", select: "title type" },
            { path: "prerequisites", select: "name" },
            { path: "summary.suggestedNextTopics", select: "name" },
          ])
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number.parseInt(limit))
          .lean(),
        Lesson.countDocuments(query),
      ]);

      logger.info(`Récupération de ${lessons.length} leçons d'histoire`);
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
        "Leçons d'histoire récupérées avec succès"
      );
    } catch (error) {
      logger.error(
        "Erreur lors de la récupération des leçons d'histoire:",
        error
      );
      throw new ApiError(
        500,
        "Échec de la récupération des leçons d'histoire",
        error.message
      );
    }
  }

  // Update history lesson
  async updateLesson(id, data, userId) {
    try {
      data.subjectType = "history";
      const lesson = await Lesson.findOneAndUpdate(
        { _id: id, subjectType: "history" },
        {
          $set: { ...data, metadata: { ...data.metadata, updatedBy: userId } },
        },
        { new: true, runValidators: true }
      )
        .populate([
          { path: "topicId", select: "name" },
          { path: "resourceIds", select: "title type" },
          { path: "exerciseIds", select: "title type" },
          { path: "metadata.createdBy", select: "name email" },
          { path: "metadata.updatedBy", select: "name email" },
          { path: "feedback.userId", select: "name" },
          { path: "concepts.conceptQuizId", select: "title" },
          { path: "sourceAnalysis.sourceQuizId", select: "title" },
          { path: "timeline.timelineExerciseId", select: "title type" },
          { path: "practiceExercises.exerciseId", select: "title type" },
          { path: "prerequisites", select: "name" },
          { path: "summary.suggestedNextTopics", select: "name" },
        ])
        .lean();
      if (!lesson) {
        logger.warn(`Leçon d'histoire introuvable pour la mise à jour: ${id}`);
        throw new ApiError(404, "Leçon d'histoire introuvable");
      }
      logger.info(
        `Mise à jour de la leçon d'histoire: ${id} par l'utilisateur ${userId}`
      );
      return new ApiResponse(
        200,
        lesson,
        "Leçon d'histoire mise à jour avec succès"
      );
    } catch (error) {
      logger.error(
        `Erreur lors de la mise à jour de la leçon d'histoire ${id}:`,
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
        "Échec de la mise à jour de la leçon d'histoire",
        error.message
      );
    }
  }

  // Delete history lesson
  async deleteLesson(id) {
    try {
      const lesson = await Lesson.findOneAndDelete({
        _id: id,
        subjectType: "history",
      });
      if (!lesson) {
        logger.warn(`Leçon d'histoire introuvable pour la suppression: ${id}`);
        throw new ApiError(404, "Leçon d'histoire introuvable");
      }
      logger.info(`Suppression de la leçon d'histoire: ${id}`);
      return new ApiResponse(
        200,
        null,
        "Leçon d'histoire supprimée avec succès"
      );
    } catch (error) {
      logger.error(
        `Erreur lors de la suppression de la leçon d'histoire ${id}:`,
        error
      );
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        500,
        "Échec de la suppression de la leçon d'histoire",
        error.message
      );
    }
  }

  // Add feedback to history lesson
  async addFeedback(id, feedbackData, userId) {
    try {
      const lesson = await Lesson.findOne({ _id: id, subjectType: "history" });
      if (!lesson) {
        logger.warn(
          `Leçon d'histoire introuvable pour l'ajout de feedback: ${id}`
        );
        throw new ApiError(404, "Leçon d'histoire introuvable");
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
        { path: "concepts.conceptQuizId", select: "title" },
        { path: "sourceAnalysis.sourceQuizId", select: "title" },
        { path: "timeline.timelineExerciseId", select: "title type" },
        { path: "practiceExercises.exerciseId", select: "title type" },
        { path: "prerequisites", select: "name" },
        { path: "summary.suggestedNextTopics", select: "name" },
      ]);

      logger.info(
        `Feedback ajouté à la leçon d'histoire ${id} par l'utilisateur ${userId}`
      );
      return new ApiResponse(200, lesson, "Feedback ajouté avec succès");
    } catch (error) {
      logger.error(
        `Erreur lors de l'ajout de feedback à la leçon d'histoire ${id}:`,
        error
      );
      if (error instanceof ApiError) throw error;
      throw new ApiError(400, "Échec de l'ajout du feedback", error.message);
    }
  }
}

module.exports = new HistoryLessonService();
