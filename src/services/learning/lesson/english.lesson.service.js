const LessonService = require("./lesson.service");
const { Lesson } = require("../../../models/learning/lesson/lesson.base.model");
const { ApiError } = require("../../../utils/ApiError");
const { ApiResponse } = require("../../../utils/ApiResponse");
const createLogger = require("../../logging.service");

const logger = createLogger("EnglishLessonService");

// Extend LessonService for EnglishLesson-specific logic
class EnglishLessonService extends LessonService {
  // Create a new English lesson
  async createLesson(lessonData, userId) {
    try {
      lessonData.subjectType = "english";
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
        { path: "grammar.grammarExerciseId", select: "title" },
        { path: "vocabulary.vocabularyQuizId", select: "title" },
        { path: "readingComprehension.comprehensionQuizId", select: "title" },
        { path: "writingSkills.writingExerciseId", select: "title" },
        { path: "listeningComprehension.listeningQuizId", select: "title" },
        { path: "speakingSkills.speakingExerciseId", select: "title" },
        { path: "practiceExercises.exerciseId", select: "title type" },
        { path: "prerequisites", select: "name" },
        { path: "summary.suggestedNextTopics", select: "name" },
      ]);

      logger.info(`Leçon d'anglais crée: ${lesson._id} par l'utilisateur ${userId}`);
      return new ApiResponse(201, lesson, "Leçon d'anglais créé avec succès");
    } catch (error) {
      logger.error(`Erreur lors de la création de la leçon d'anglais par l'utilisateur ${userId}:`, error);
      if (error instanceof ApiError) throw error;
      if (error.name === "ValidationError") {
        throw new ApiError(400, "Validation échouée", Object.values(error.errors).map((e) => e.message));
      }
      throw new ApiError(500, "Échec de la création de la leçon d'anglais", error.message);
    }
  }

  // Get English lesson by ID
  async getLessonById(id) {
    try {
      const lesson = await Lesson.findOne({ _id: id, subjectType: "english" })
        .populate([
          { path: "topicId", select: "name" },
          { path: "resourceIds", select: "title type" },
          { path: "exerciseIds", select: "title type" },
          { path: "metadata.createdBy", select: "name email" },
          { path: "metadata.updatedBy", select: "name email" },
          { path: "feedback.userId", select: "name" },
          { path: "grammar.grammarExerciseId", select: "title" },
          { path: "vocabulary.vocabularyQuizId", select: "title" },
          { path: "readingComprehension.comprehensionQuizId", select: "title" },
          { path: "writingSkills.writingExerciseId", select: "title" },
          { path: "listeningComprehension.listeningQuizId", select: "title" },
          { path: "speakingSkills.speakingExerciseId", select: "title" },
          { path: "practiceExercises.exerciseId", select: "title type" },
          { path: "prerequisites", select: "name" },
          { path: "summary.suggestedNextTopics", select: "name" },
        ])
        .lean();
      if (!lesson) {
        logger.warn(`Leçon d'anglais introuvable: ${id}`);
        throw new ApiError(404, "Leçon d'anglais introuvable");
      }
      logger.info(`Récupération de la leçon d'anglais: ${id}`);
      return new ApiResponse(200, lesson, "Leçon d'anglais récupérée avec succès");
    } catch (error) {
      logger.error(`Erreur lors de la récupération de la leçon d'anglais ${id}:`, error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Échec de la récupération de la leçon d'anglais", error.message);
    }
  }

  // Get English lessons with filters
  async getLessons(options = {}) {
    try {
      const { page = 1, limit = 20, topicId, series, interactivityLevel, premiumOnly, offlineAvailable } = options;
      const query = { subjectType: "english" };
      if (topicId) query.topicId = topicId;
      if (series) query.series = series;
      if (interactivityLevel) query.interactivityLevel = interactivityLevel;
      if (premiumOnly !== undefined) query.premiumOnly = premiumOnly;
      if (offlineAvailable !== undefined) query.offlineAvailable = offlineAvailable;

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
            { path: "grammar.grammarExerciseId", select: "title" },
            { path: "vocabulary.vocabularyQuizId", select: "title" },
            { path: "readingComprehension.comprehensionQuizId", select: "title" },
            { path: "writingSkills.writingExerciseId", select: "title" },
            { path: "listeningComprehension.listeningQuizId", select: "title" },
            { path: "speakingSkills.speakingExerciseId", select: "title" },
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

      logger.info(`Récupération de ${lessons.length} leçons d'anglais`);
      return new ApiResponse(200, {
        lessons,
        pagination: {
          currentPage: Number.parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: Number.parseInt(limit),
        },
      }, "Leçons d'anglais récupérées avec succès");
    } catch (error) {
      logger.error("Erreur lors de la récupération des leçons d'anglais:", error);
      throw new ApiError(500, "Échec de la récupération des leçons d'anglais", error.message);
    }
  }

  // Update English lesson
  async updateLesson(id, data, userId) {
    try {
      data.subjectType = "english";
      const lesson = await Lesson.findOneAndUpdate(
        { _id: id, subjectType: "english" },
        { $set: { ...data, metadata: { ...data.metadata, updatedBy: userId } } },
        { new: true, runValidators: true },
      )
        .populate([
          { path: "topicId", select: "name" },
          { path: "resourceIds", select: "title type" },
          { path: "exerciseIds", select: "title type" },
          { path: "metadata.createdBy", select: "name email" },
          { path: "metadata.updatedBy", select: "name email" },
          { path: "feedback.userId", select: "name" },
          { path: "grammar.grammarExerciseId", select: "title" },
          { path: "vocabulary.vocabularyQuizId", select: "title" },
          { path: "readingComprehension.comprehensionQuizId", select: "title" },
          { path: "writingSkills.writingExerciseId", select: "title" },
          { path: "listeningComprehension.listeningQuizId", select: "title" },
          { path: "speakingSkills.speakingExerciseId", select: "title" },
          { path: "practiceExercises.exerciseId", select: "title type" },
          { path: "prerequisites", select: "name" },
          { path: "summary.suggestedNextTopics", select: "name" },
        ])
        .lean();
      if (!lesson) {
        logger.warn(`Leçon d'anglais introuvable pour la mise à jour: ${id}`);
        throw new ApiError(404, "Leçon d'anglais introuvable");
      }
      logger.info(`Mise à jour de la leçon d'anglais: ${id} par l'utilisateur ${userId}`);
      return new ApiResponse(200, lesson, "Leçon d'anglais mise à jour avec succès");
    } catch (error) {
      logger.error(`Erreur lors de la mise à jour de la leçon d'anglais ${id}:`, error);
      if (error instanceof ApiError) throw error;
      if (error.name === "ValidationError") {
        throw new ApiError(400, "Validation échouée", Object.values(error.errors).map((e) => e.message));
      }
      throw new ApiError(500, "Échec de la mise à jour de la leçon d'anglais", error.message);
    }
  }

  // Delete English lesson
  async deleteLesson(id) {
    try {
      const lesson = await Lesson.findOneAndDelete({ _id: id, subjectType: "english" });
      if (!lesson) {
        logger.warn(`Leçon d'anglais introuvable pour la suppression: ${id}`);
        throw new ApiError(404, "Leçon d'anglais introuvable");
      }
      logger.info(`Suppression de la leçon d'anglais: ${id}`);
      return new ApiResponse(200, null, "Leçon d'anglais supprimée avec succès");
    } catch (error) {
      logger.error(`Erreur lors de la suppression de la leçon d'anglais ${id}:`, error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, "Échec de la suppression de la leçon d'anglais", error.message);
    }
  }

  // Add feedback to English lesson
  async addFeedback(id, feedbackData, userId) {
    try {
      const lesson = await Lesson.findOne({ _id: id, subjectType: "english" });
      if (!lesson) {
        logger.warn(`Leçon d'anglais introuvable pour l'ajout de feedback: ${id}`);
        throw new ApiError(404, "Leçon d'anglais introuvable");
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
        { path: "grammar.grammarExerciseId", select: "title" },
        { path: "vocabulary.vocabularyQuizId", select: "title" },
        { path: "readingComprehension.comprehensionQuizId", select: "title" },
        { path: "writingSkills.writingExerciseId", select: "title" },
        { path: "listeningComprehension.listeningQuizId", select: "title" },
        { path: "speakingSkills.speakingExerciseId", select: "title" },
        { path: "practiceExercises.exerciseId", select: "title type" },
        { path: "prerequisites", select: "name" },
        { path: "summary.suggestedNextTopics", select: "name" },
      ]);

      logger.info(`Feedback ajouté à la leçon d'anglais ${id} par l'utilisateur ${userId}`);
      return new ApiResponse(200, lesson, "Feedback ajouté avec succès");
    } catch (error) {
      logger.error(`Erreur lors de l'ajout de feedback à la leçon d'anglais ${id}:`, error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(400, "Échec de l'ajout du feedback", error.message);
    }
  }
}

module.exports = new EnglishLessonService();