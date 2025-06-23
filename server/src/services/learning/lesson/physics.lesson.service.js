const LessonService = require("./lesson.service");
const { Lesson } = require("../../../models/learning/lesson/lesson.base.model");
const { ApiError } = require("../../../utils/ApiError");
const { ApiResponse } = require("../../../utils/ApiResponse");
const createLogger = require("../../../services/logging.service");

const logger = createLogger("PhysicsLessonService");

// Extend LessonService for PhysicsLesson-specific logic
class PhysicsLessonService extends LessonService {
  // Create a new physics lesson
  async createLesson(lessonData, userId) {
    try {
      lessonData.subjectType = "physics";
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
        { path: "experiments.experimentExerciseId", select: "title type" },
        { path: "practiceExercises.exerciseId", select: "title type" },
        { path: "prerequisites", select: "name" },
        { path: "summary.suggestedNextTopics", select: "name" },
      ]);

      logger.info(
        `Leçon de physique créée: ${lesson._id} par l'utilisateur ${userId}`
      );
      return new ApiResponse(
        201,
        lesson,
        "Leçon de physique créée avec succès"
      );
    } catch (error) {
      logger.error(
        `Erreur lors de la création de la leçon de physique par l'utilisateur ${userId}:`,
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
        "Échec de la création de la leçon de physique",
        error.message
      );
    }
  }

  // Get physics lesson by ID
  async getLessonById(id) {
    try {
      const lesson = await Lesson.findOne({ _id: id, subjectType: "physics" })
        .populate([
          { path: "topicId", select: "name" },
          { path: "resourceIds", select: "title type" },
          { path: "exerciseIds", select: "title type" },
          { path: "metadata.createdBy", select: "name email" },
          { path: "metadata.updatedBy", select: "name email" },
          { path: "feedback.userId", select: "name" },
          { path: "concepts.conceptQuizId", select: "title" },
          { path: "experiments.experimentExerciseId", select: "title type" },
          { path: "practiceExercises.exerciseId", select: "title type" },
          { path: "prerequisites", select: "name" },
          { path: "summary.suggestedNextTopics", select: "name" },
        ])
        .lean();
      if (!lesson) {
        logger.warn(`Leçon de physique introuvable: ${id}`);
        throw new ApiError(404, "Leçon de physique introuvable");
      }
      logger.info(`Récupération de la leçon de physique: ${id}`);
      return new ApiResponse(
        200,
        lesson,
        "Leçon de physique récupérée avec succès"
      );
    } catch (error) {
      logger.error(
        `Erreur lors de la récupération de la leçon de physique ${id}:`,
        error
      );
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        500,
        "Échec de la récupération de la leçon de physique",
        error.message
      );
    }
  }

  // Get physics lessons with filters
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
      const query = { subjectType: "physics" };
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
            { path: "experiments.experimentExerciseId", select: "title type" },
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

      logger.info(`Récupération de ${lessons.length} leçons de physique`);
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
        "Leçons de physique récupérées avec succès"
      );
    } catch (error) {
      logger.error(
        "Erreur lors de la récupération des leçons de physique:",
        error
      );
      throw new ApiError(
        500,
        "Échec de la récupération des leçons de physique",
        error.message
      );
    }
  }

  // Update physics lesson
  async updateLesson(id, data, userId) {
    try {
      data.subjectType = "physics";
      const lesson = await Lesson.findOneAndUpdate(
        { _id: id, subjectType: "physics" },
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
          { path: "experiments.experimentExerciseId", select: "title type" },
          { path: "practiceExercises.exerciseId", select: "title type" },
          { path: "prerequisites", select: "name" },
          { path: "summary.suggestedNextTopics", select: "name" },
        ])
        .lean();
      if (!lesson) {
        logger.warn(`Leçon de physique introuvable pour la mise à jour: ${id}`);
        throw new ApiError(404, "Leçon de physique introuvable");
      }
      logger.info(
        `Mise à jour de la leçon de physique: ${id} par l'utilisateur ${userId}`
      );
      return new ApiResponse(
        200,
        lesson,
        "Leçon de physique mise à jour avec succès"
      );
    } catch (error) {
      logger.error(
        `Erreur lors de la mise à jour de la leçon de physique ${id}:`,
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
        "Échec de la mise à jour de la leçon de physique",
        error.message
      );
    }
  }

  // Delete physics lesson
  async deleteLesson(id) {
    try {
      const lesson = await Lesson.findOneAndDelete({
        _id: id,
        subjectType: "physics",
      });
      if (!lesson) {
        logger.warn(`Leçon de physique introuvable pour la suppression: ${id}`);
        throw new ApiError(404, "Leçon de physique introuvable");
      }
      logger.info(`Suppression de la leçon de physique: ${id}`);
      return new ApiResponse(
        200,
        null,
        "Leçon de physique supprimée avec succès"
      );
    } catch (error) {
      logger.error(
        `Erreur lors de la suppression de la leçon de physique ${id}:`,
        error
      );
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        500,
        "Échec de la suppression de la leçon de physique",
        error.message
      );
    }
  }

  // Add feedback to physics lesson
  async addFeedback(id, feedbackData, userId) {
    try {
      const lesson = await Lesson.findOne({ _id: id, subjectType: "physics" });
      if (!lesson) {
        logger.warn(
          `Leçon de physique introuvable pour l'ajout de feedback: ${id}`
        );
        throw new ApiError(404, "Leçon de physique introuvable");
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
        { path: "experiments.experimentExerciseId", select: "title type" },
        { path: "practiceExercises.exerciseId", select: "title type" },
        { path: "prerequisites", select: "name" },
        { path: "summary.suggestedNextTopics", select: "name" },
      ]);

      logger.info(
        `Feedback ajouté à la leçon de physique ${id} par l'utilisateur ${userId}`
      );
      return new ApiResponse(200, lesson, "Feedback ajouté avec succès");
    } catch (error) {
      logger.error(
        `Erreur lors de l'ajout de feedback à la leçon de physique ${id}:`,
        error
      );
      if (error instanceof ApiError) throw error;
      throw new ApiError(400, "Échec de l'ajout du feedback", error.message);
    }
  }
}

module.exports = new PhysicsLessonService();
