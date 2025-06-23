const { UserProgress } = require("../../models/user/user.progress.model");
const { Lesson } = require("../../models/learning/lesson/lesson.base.model");
const createLogger = require("../logging.service");

const logger = createLogger("UserProgressService");

class UserProgressService {
  // Get or create user progress
  async getOrCreateUserProgress(userId) {
    try {
      let progress = await UserProgress.findOne({ userId })
        .populate("lessonProgress.lessonId", "title duration")
        .populate("courseProgress.courseId", "title")
        .lean();

      if (!progress) {
        progress = new UserProgress({
          userId,
          lessonProgress: [],
          courseProgress: [],
          overallMetrics: {
            totalLessonsStarted: 0,
            totalLessonsCompleted: 0,
            totalCoursesEnrolled: 0,
            totalCoursesCompleted: 0,
            totalStudyTime: 0,
            averageScore: 0,
            currentStreak: 0,
            longestStreak: 0,
          },
          learningGoals: {
            dailyStudyTime: 60,
            weeklyGoal: 5,
            prioritySubjects: [],
          },
        });
        await progress.save();
        logger.info(`Created new progress for user: ${userId}`);
      }

      return progress;
    } catch (error) {
      logger.error("Error getting or creating user progress:", error);
      throw error;
    }
  }

  // Start a lesson
  async startLesson(userId, lessonId) {
    try {
      const progress = await UserProgress.findOne({ userId });
      if (!progress) {
        throw new Error("User progress not found");
      }

      const result = await progress.startLesson(lessonId);

      // Update lesson tracking
      const lesson = await Lesson.findById(lessonId);
      if (lesson) {
        lesson.incrementAttempts();
        await lesson.save();
      }

      logger.info(`Lesson started: ${lessonId} for user: ${userId}`);
      return result;
    } catch (error) {
      logger.error("Error starting lesson:", error);
      throw error;
    }
  }

  // Complete a lesson
  async completeLesson(
    userId,
    lessonId,
    score,
    timeSpent,
    completionType = "manual"
  ) {
    try {
      const progress = await UserProgress.findOne({ userId });
      if (!progress) {
        throw new Error("User progress not found");
      }

      const result = await progress.completeLesson(
        lessonId,
        score,
        timeSpent,
        completionType
      );

      // Update lesson tracking
      const lesson = await Lesson.findById(lessonId);
      if (lesson) {
        await lesson.updateProgressTracking({
          userId,
          isCompleted: true,
          isNewAttempt: false,
        });
      }

      logger.info(`Lesson completed: ${lessonId} for user: ${userId}`);
      return result;
    } catch (error) {
      logger.error("Error completing lesson:", error);
      throw error;
    }
  }

  // Update lesson progress
  async updateLessonProgress(userId, lessonId, updates) {
    try {
      const progress = await UserProgress.findOne({ userId });
      if (!progress) {
        throw new Error("User progress not found");
      }

      const result = await progress.updateLessonProgress(lessonId, updates);

      logger.info(`Lesson progress updated: ${lessonId} for user: ${userId}`);
      return result;
    } catch (error) {
      logger.error("Error updating lesson progress:", error);
      throw error;
    }
  }

  // Enroll in course
  async enrollInCourse(userId, courseId, totalLessons = 0) {
    try {
      const progress = await UserProgress.findOne({ userId });
      if (!progress) {
        throw new Error("User progress not found");
      }

      const result = await progress.enrollInCourse(courseId, totalLessons);

      logger.info(`Course enrollment: ${courseId} for user: ${userId}`);
      return result;
    } catch (error) {
      logger.error("Error enrolling in course:", error);
      throw error;
    }
  }

  // Update course progress
  async updateCourseProgress(userId, courseId) {
    try {
      const progress = await UserProgress.findOne({ userId });
      if (!progress) {
        throw new Error("User progress not found");
      }

      const result = await progress.updateCourseProgress(courseId);

      logger.info(`Course progress updated: ${courseId} for user: ${userId}`);
      return result;
    } catch (error) {
      logger.error("Error updating course progress:", error);
      throw error;
    }
  }

  // Update learning goals
  async updateLearningGoals(userId, learningGoals) {
    try {
      const progress = await UserProgress.findOneAndUpdate(
        { userId },
        {
          $set: {
            learningGoals: {
              ...learningGoals,
            },
          },
        },
        { new: true, runValidators: true }
      );

      if (!progress) {
        throw new Error("User progress not found");
      }

      logger.info(`Learning goals updated for user: ${userId}`);
      return progress;
    } catch (error) {
      logger.error("Error updating learning goals:", error);
      throw error;
    }
  }

  // Get lesson progress
  async getLessonProgress(userId, lessonId) {
    try {
      const progress = await UserProgress.findOne({ userId });
      if (!progress) {
        return null;
      }

      return progress.getLessonProgress(lessonId);
    } catch (error) {
      logger.error("Error getting lesson progress:", error);
      throw error;
    }
  }

  // Get course progress
  async getCourseProgress(userId, courseId) {
    try {
      const progress = await UserProgress.findOne({ userId });
      if (!progress) {
        return null;
      }

      return progress.getCourseProgress(courseId);
    } catch (error) {
      logger.error("Error getting course progress:", error);
      throw error;
    }
  }

  // Get progress statistics
  async getProgressStatistics(userId) {
    try {
      const progress = await UserProgress.findOne({ userId });
      if (!progress) {
        throw new Error("User progress not found");
      }

      const stats = {
        overallMetrics: progress.overallMetrics,
        completionRate: progress.completionRate,
        averageDailyStudyTime: progress.averageDailyStudyTime,
        lessonStats: {
          total: progress.lessonProgress.length,
          completed: progress.lessonProgress.filter(
            (lp) => lp.status === "completed" || lp.status === "mastered"
          ).length,
          inProgress: progress.lessonProgress.filter(
            (lp) => lp.status === "in_progress"
          ).length,
        },
        courseStats: {
          total: progress.courseProgress.length,
          completed: progress.courseProgress.filter(
            (cp) => cp.status === "completed"
          ).length,
          inProgress: progress.courseProgress.filter(
            (cp) => cp.status === "in_progress"
          ).length,
        },
        learningGoals: progress.learningGoals,
        recentActivity: progress.lessonProgress
          .filter((lp) => lp.lastAccessedAt)
          .sort(
            (a, b) => new Date(b.lastAccessedAt) - new Date(a.lastAccessedAt)
          )
          .slice(0, 10),
      };

      return stats;
    } catch (error) {
      logger.error("Error getting progress statistics:", error);
      throw error;
    }
  }

  // Update streak
  async updateStreak(userId) {
    try {
      const progress = await UserProgress.findOne({ userId });
      if (!progress) {
        throw new Error("User progress not found");
      }

      progress.updateStreak();
      await progress.save();

      logger.info(`Streak updated for user: ${userId}`);
      return progress;
    } catch (error) {
      logger.error("Error updating streak:", error);
      throw error;
    }
  }

  // Reset user progress (admin only)
  async resetUserProgress(userId) {
    try {
      const progress = await UserProgress.findOneAndUpdate(
        { userId },
        {
          $set: {
            lessonProgress: [],
            courseProgress: [],
            overallMetrics: {
              totalLessonsStarted: 0,
              totalLessonsCompleted: 0,
              totalCoursesEnrolled: 0,
              totalCoursesCompleted: 0,
              totalStudyTime: 0,
              averageScore: 0,
              currentStreak: 0,
              longestStreak: 0,
            },
          },
        },
        { new: true }
      );

      if (!progress) {
        throw new Error("User progress not found");
      }

      logger.info(`Progress reset for user: ${userId}`);
      return progress;
    } catch (error) {
      logger.error("Error resetting user progress:", error);
      throw error;
    }
  }

  // Get all users progress (admin only)
  async getAllUsersProgress(options = {}) {
    try {
      const { page = 1, limit = 20 } = options;
      const skip = (page - 1) * limit;

      const [progress, total] = await Promise.all([
        UserProgress.find()
          .populate("userId", "name email")
          .populate("lessonProgress.lessonId", "title")
          .populate("courseProgress.courseId", "title")
          .skip(skip)
          .limit(limit)
          .sort({ lastSyncAt: -1 })
          .lean(),
        UserProgress.countDocuments(),
      ]);

      logger.info(`Retrieved ${progress.length} user progress records`);
      return {
        progress,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      logger.error("Error getting all users progress:", error);
      throw error;
    }
  }
}

module.exports = new UserProgressService();
