const LessonService = require("./lesson.service");
const { Lesson } = require("../../../models/learning/lesson/lesson.base.model");
const { ApiError } = require("../../../utils/ApiError");
const { ApiResponse } = require("../../../utils/ApiResponse");
const createLogger = require("../../../services/logging.service");

const logger = createLogger("BiologyLessonService");

// Extend LessonService for BiologyLesson-specific logic
class BiologyLessonService extends LessonService {
  // Create a new biology lesson
  async createLesson(lessonData, userId) {
    try {
      // Ensure discriminator and user metadata
      lessonData.subjectType = "biology";
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
        { path: "caseStudies.caseStudyQuizId", select: "title" },
        { path: "practiceExercises.exerciseId", select: "title type" },
        { path: "prerequisites", select: "name" },
        { path: "summary.suggestedNextTopics", select: "name" },
      ]);

      logger.info(
        `Leçon de biologie créée: ${lesson._id} par l'utilisateur ${userId}`
      );
      return new ApiResponse(
        201,
        lesson,
        "Leçon de biologie créée avec succès"
      );
    } catch (error) {
      logger.error(
        `Erreur lors de la création de la leçon de biologie par l'utilisateur ${userId}:`,
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
        "Échec de la création de la leçon de biologie",
        error.message
      );
    }
  }

  // Get biology lesson by ID
  async getLessonById(id) {
    try {
      const lesson = await Lesson.findOne({ _id: id, subjectType: "biology" })
        .populate([
          { path: "topicId", select: "name" },
          { path: "resourceIds", select: "title type" },
          { path: "exerciseIds", select: "title type" },
          { path: "metadata.createdBy", select: "name email" },
          { path: "metadata.updatedBy", select: "name email" },
          { path: "feedback.userId", select: "name" },
          { path: "concepts.conceptQuizId", select: "title" },
          { path: "experiments.experimentExerciseId", select: "title type" },
          { path: "caseStudies.caseStudyQuizId", select: "title" },
          { path: "practiceExercises.exerciseId", select: "title type" },
          { path: "prerequisites", select: "name" },
          { path: "summary.suggestedNextTopics", select: "name" },
        ])
        .lean();
      if (!lesson) {
        logger.warn(`Leçon de biologie introuvable: ${id}`);
        throw new ApiError(404, "Leçon de biologie introuvable");
      }
      logger.info(`Récupération de la leçon de biologie: ${id}`);
      return new ApiResponse(
        200,
        lesson,
        "Leçon de biologie récupérée avec succès"
      );
    } catch (error) {
      logger.error(
        `Erreur lors de la récupération de la leçon de biologie ${id}:`,
        error
      );
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        500,
        "Échec de la récupération de la leçon de biologie",
        error.message
      );
    }
  }

  // Get biology lessons with filters
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
      const query = { subjectType: "biology" };
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
            { path: "concepts.conceptQuizId", select: "title" },
            { path: "experiments.experimentExerciseId", select: "title type" },
            { path: "caseStudies.caseStudyQuizId", select: "title" },
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

      logger.info(`Récupération de ${lessons.length} leçons de biologie`);
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
        "Leçons de biologie récupérées avec succès"
      );
    } catch (error) {
      logger.error(
        "Erreur lors de la récupération des leçons de biologie:",
        error
      );
      throw new ApiError(
        500,
        "Échec de la récupération des leçons de biologie",
        error.message
      );
    }
  }

  // Update biology lesson
  async updateLesson(id, data, userId) {
    try {
      // Ensure discriminator
      data.subjectType = "biology";
      const lesson = await Lesson.findOneAndUpdate(
        { _id: id, subjectType: "biology" },
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
          { path: "caseStudies.caseStudyQuizId", select: "title" },
          { path: "practiceExercises.exerciseId", select: "title type" },
          { path: "prerequisites", select: "name" },
          { path: "summary.suggestedNextTopics", select: "name" },
        ])
        .lean();
      if (!lesson) {
        logger.warn(`Leçon de biologie introuvable pour la mise à jour: ${id}`);
        throw new ApiError(404, "Leçon de biologie introuvable");
      }
      logger.info(
        `Mise à jour de la leçon de biologie: ${id} par l'utilisateur ${userId}`
      );
      return new ApiResponse(
        200,
        lesson,
        "Leçon de biologie mise à jour avec succès"
      );
    } catch (error) {
      logger.error(
        `Erreur lors de la mise à jour de la leçon de biologie ${id}:`,
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
        "Échec de la mise à jour de la leçon de biologie",
        error.message
      );
    }
  }

  // Delete biology lesson (inherited from LessonService)
  async deleteLesson(id) {
    try {
      const lesson = await Lesson.findOneAndDelete({
        _id: id,
        subjectType: "biology",
      });
      if (!lesson) {
        logger.warn(`Leçon de biologie introuvable pour la suppression: ${id}`);
        throw new ApiError(404, "Leçon de biologie introuvable");
      }
      logger.info(`Suppression de la leçon de biologie: ${id}`);
      return new ApiResponse(
        200,
        null,
        "Leçon de biologie supprimée avec succès"
      );
    } catch (error) {
      logger.error(
        `Erreur lors de la suppression de la leçon de biologie ${id}:`,
        error
      );
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        500,
        "Échec de la suppression de la leçon de biologie",
        error.message
      );
    }
  }

  // Add feedback (inherited from LessonService, but override for population)
  async addFeedback(id, feedbackData, userId) {
    try {
      const lesson = await Lesson.findOne({ _id: id, subjectType: "biology" });
      if (!lesson) {
        logger.warn(
          `Leçon de biologie introuvable pour l'ajout de feedback: ${id}`
        );
        throw new ApiError(404, "Leçon de biologie introuvable");
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
        { path: "caseStudies.caseStudyQuizId", select: "title" },
        { path: "practiceExercises.exerciseId", select: "title type" },
        { path: "prerequisites", select: "name" },
        { path: "summary.suggestedNextTopics", select: "name" },
      ]);

      logger.info(
        `Feedback ajouté à la leçon de biologie ${id} par l'utilisateur ${userId}`
      );
      return new ApiResponse(200, lesson, "Feedback ajouté avec succès");
    } catch (error) {
      logger.error(
        `Erreur lors de l'ajout de feedback à la leçon de biologie ${id}:`,
        error
      );
      if (error instanceof ApiError) throw error;
      throw new ApiError(400, "Échec de l'ajout du feedback", error.message);
    }
  }
}

// Create and export an instance
module.exports = new BiologyLessonService();
