const { StatusCodes } = require("http-status-codes");
const userProgressService = require("../../services/user/user.progress.service");
const { asyncHandler } = require("../../utils/asyncHandler");
const { ApiError } = require("../../utils/ApiError");
const createLogger = require("../../services/logging.service");

const logger = createLogger("UserProgressController");

class UserProgressController {
  // Get user's progress
  getUserProgress = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const progress = await userProgressService.getOrCreateUserProgress(userId);

    logger.info(`User progress retrieved for user: ${userId}`);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Progression utilisateur récupérée avec succès",
      data: progress,
    });
  });

  // Start a lesson
  startLesson = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { lessonId } = req.params;

    const progress = await userProgressService.startLesson(userId, lessonId);

    logger.info(`Lesson started: ${lessonId} by user: ${userId}`);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Leçon commencée avec succès",
      data: progress,
    });
  });

  // Complete a lesson
  completeLesson = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { lessonId } = req.params;
    const { score, timeSpent, completionType } = req.body;

    const progress = await userProgressService.completeLesson(
      userId,
      lessonId,
      score,
      timeSpent,
      completionType
    );

    logger.info(`Lesson completed: ${lessonId} by user: ${userId}`);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Leçon terminée avec succès",
      data: progress,
    });
  });

  // Update lesson progress
  updateLessonProgress = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { lessonId } = req.params;
    const updates = req.body;

    const progress = await userProgressService.updateLessonProgress(
      userId,
      lessonId,
      updates
    );

    logger.info(`Lesson progress updated: ${lessonId} by user: ${userId}`);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Progression de la leçon mise à jour avec succès",
      data: progress,
    });
  });

  // Enroll in course
  enrollInCourse = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { courseId } = req.params;
    const { totalLessons } = req.body;

    const progress = await userProgressService.enrollInCourse(
      userId,
      courseId,
      totalLessons
    );

    logger.info(`Course enrollment: ${courseId} by user: ${userId}`);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Inscription au cours réussie",
      data: progress,
    });
  });

  // Update course progress
  updateCourseProgress = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { courseId } = req.params;

    const progress = await userProgressService.updateCourseProgress(
      userId,
      courseId
    );

    logger.info(`Course progress updated: ${courseId} by user: ${userId}`);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Progression du cours mise à jour avec succès",
      data: progress,
    });
  });

  // Update learning goals
  updateLearningGoals = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const learningGoals = req.body;

    const progress = await userProgressService.updateLearningGoals(
      userId,
      learningGoals
    );

    logger.info(`Learning goals updated for user: ${userId}`);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Objectifs d'apprentissage mis à jour avec succès",
      data: progress,
    });
  });

  // Get lesson progress
  getLessonProgress = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { lessonId } = req.params;

    const lessonProgress = await userProgressService.getLessonProgress(
      userId,
      lessonId
    );

    if (!lessonProgress) {
      throw new ApiError(404, "Progression de la leçon introuvable");
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Progression de la leçon récupérée avec succès",
      data: lessonProgress,
    });
  });

  // Get course progress
  getCourseProgress = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { courseId } = req.params;

    const courseProgress = await userProgressService.getCourseProgress(
      userId,
      courseId
    );

    if (!courseProgress) {
      throw new ApiError(404, "Progression du cours introuvable");
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Progression du cours récupérée avec succès",
      data: courseProgress,
    });
  });

  // Get progress statistics
  getProgressStatistics = asyncHandler(async (req, res) => {
    const userId = req.user.userId;

    const statistics = await userProgressService.getProgressStatistics(userId);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Statistiques de progression récupérées avec succès",
      data: statistics,
    });
  });

  // Update streak
  updateStreak = asyncHandler(async (req, res) => {
    const userId = req.user.userId;

    const progress = await userProgressService.updateStreak(userId);

    logger.info(`Streak updated for user: ${userId}`);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Série mise à jour avec succès",
      data: progress,
    });
  });

  // Reset progress (admin only)
  resetUserProgress = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const progress = await userProgressService.resetUserProgress(userId);

    logger.info(
      `Progress reset for user: ${userId} by admin: ${req.user.userId}`
    );
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Progression utilisateur réinitialisée avec succès",
      data: progress,
    });
  });

  // Get all users progress (admin only)
  getAllUsersProgress = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;

    const result = await userProgressService.getAllUsersProgress({
      page: Number.parseInt(page),
      limit: Number.parseInt(limit),
    });

    logger.info("All users progress retrieved by admin");
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Progression de tous les utilisateurs récupérée avec succès",
      data: result.progress,
      pagination: result.pagination,
    });
  });

  // Get user progress by ID (admin only)
  getUserProgressById = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const progress = await userProgressService.getOrCreateUserProgress(userId);

    logger.info(`User progress retrieved by admin for user: ${userId}`);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Progression utilisateur récupérée avec succès",
      data: progress,
    });
  });
}

module.exports = new UserProgressController();
