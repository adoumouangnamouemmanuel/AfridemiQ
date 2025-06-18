const { Schema, model, Types } = require("mongoose");

// Progress status options
const PROGRESS_STATUSES = [
  "not_started",
  "in_progress",
  "completed",
  "mastered",
];

// Completion types
const COMPLETION_TYPES = ["time_based", "score_based", "manual", "automatic"];

// Individual lesson progress tracking schema
const LessonProgressSchema = new Schema({
  lessonId: {
    type: Types.ObjectId,
    ref: "LessonBase",
    required: [true, "Lesson ID is required"],
  },
  status: {
    type: String,
    enum: {
      values: PROGRESS_STATUSES,
      message: "{VALUE} is not a valid progress status",
    },
    default: "not_started",
  },
  startedAt: {
    type: Date,
  },
  completedAt: {
    type: Date,
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now,
  },
  timeSpent: {
    type: Number,
    default: 0,
    min: [0, "Time spent cannot be negative"],
  },
  score: {
    type: Number,
    min: [0, "Score cannot be negative"],
    max: [100, "Score cannot exceed 100"],
  },
  attempts: {
    type: Number,
    default: 0,
    min: [0, "Attempts cannot be negative"],
  },
  hintsUsed: {
    type: Number,
    default: 0,
    min: [0, "Hints used cannot be negative"],
  },
  bookmarked: {
    type: Boolean,
    default: false,
  },
  notes: {
    type: String,
    maxlength: [1000, "Notes cannot exceed 1000 characters"],
  },
  completionType: {
    type: String,
    enum: {
      values: COMPLETION_TYPES,
      message: "{VALUE} is not a valid completion type",
    },
  },
});

// Course progress tracking schema
const CourseProgressSchema = new Schema({
  courseId: {
    type: Types.ObjectId,
    ref: "CourseContent",
    required: [true, "Course ID is required"],
  },
  status: {
    type: String,
    enum: {
      values: PROGRESS_STATUSES,
      message: "{VALUE} is not a valid progress status",
    },
    default: "not_started",
  },
  enrolledAt: {
    type: Date,
    default: Date.now,
  },
  startedAt: {
    type: Date,
  },
  completedAt: {
    type: Date,
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now,
  },
  overallProgress: {
    type: Number,
    default: 0,
    min: [0, "Progress cannot be negative"],
    max: [100, "Progress cannot exceed 100"],
  },
  lessonsCompleted: {
    type: Number,
    default: 0,
    min: [0, "Lessons completed cannot be negative"],
  },
  totalLessons: {
    type: Number,
    default: 0,
    min: [0, "Total lessons cannot be negative"],
  },
  averageScore: {
    type: Number,
    default: 0,
    min: [0, "Average score cannot be negative"],
    max: [100, "Average score cannot exceed 100"],
  },
  totalTimeSpent: {
    type: Number,
    default: 0,
    min: [0, "Total time spent cannot be negative"],
  },
});

// Main user progress schema
const UserProgressSchema = new Schema(
  {
    // User identification
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },

    // Individual lesson progress
    lessonProgress: {
      type: [LessonProgressSchema],
      default: [],
    },

    // Course progress
    courseProgress: {
      type: [CourseProgressSchema],
      default: [],
    },

    quizProgress: [
      {
        quizId: { type: Types.ObjectId, ref: "Quiz" },
        score: { type: Number, min: 0, max: 100 },
        completedAt: { type: Date },
        timeSpent: { type: Number, min: 0 },
        attempts: { type: Number, min: 0, default: 0 },
      },
    ],

    // from user to user progress
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    completedTopics: { type: [String], default: [] },
    weakSubjects: { type: [String], default: [] },
    badges: { type: [String], default: [] },
    achievements: {
      type: [{ type: Types.ObjectId, ref: "Achievement" }],
      default: [],
    },
    progressSummary: {
      completedPercentage: { type: Number },
      remainingTopics: { type: Number },
    },

    // Overall learning metrics
    overallMetrics: {
      totalLessonsStarted: {
        type: Number,
        default: 0,
        min: [0, "Total lessons started cannot be negative"],
      },
      totalLessonsCompleted: {
        type: Number,
        default: 0,
        min: [0, "Total lessons completed cannot be negative"],
      },
      totalCoursesEnrolled: {
        type: Number,
        default: 0,
        min: [0, "Total courses enrolled cannot be negative"],
      },
      totalCoursesCompleted: {
        type: Number,
        default: 0,
        min: [0, "Total courses completed cannot be negative"],
      },
      totalStudyTime: {
        type: Number,
        default: 0,
        min: [0, "Total study time cannot be negative"],
      },
      averageScore: {
        type: Number,
        default: 0,
        min: [0, "Average score cannot be negative"],
        max: [100, "Average score cannot exceed 100"],
      },
      currentStreak: {
        type: Number,
        default: 0,
        min: [0, "Current streak cannot be negative"],
      },
      longestStreak: {
        type: Number,
        default: 0,
        min: [0, "Longest streak cannot be negative"],
      },
      lastStudyDate: {
        type: Date,
      },
    },

    // Learning preferences and goals
    learningGoals: {
      dailyStudyTime: {
        type: Number,
        default: 60,
        min: [1, "Daily study time must be at least 1 minute"],
      },
      weeklyGoal: {
        type: Number,
        default: 5,
        min: [1, "Weekly goal must be at least 1 lesson"],
      },
      targetCompletionDate: {
        type: Date,
      },
      prioritySubjects: {
        type: [String],
        default: [],
      },
    },

    // Progress tracking metadata
    lastSyncAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance
UserProgressSchema.index({ "lessonProgress.lessonId": 1 });
UserProgressSchema.index({ "courseProgress.courseId": 1 });
UserProgressSchema.index({ "lessonProgress.status": 1 });
UserProgressSchema.index({ "courseProgress.status": 1 });
UserProgressSchema.index({ lastSyncAt: -1 });

// Virtual for completion rate
UserProgressSchema.virtual("completionRate").get(function () {
  const { totalLessonsStarted, totalLessonsCompleted } = this.overallMetrics;
  return totalLessonsStarted > 0
    ? Math.round((totalLessonsCompleted / totalLessonsStarted) * 100)
    : 0;
});

// Virtual for average daily study time
UserProgressSchema.virtual("averageDailyStudyTime").get(function () {
  const daysSinceStart = this.createdAt
    ? Math.ceil((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24))
    : 1;
  return Math.round((this.overallMetrics.totalStudyTime || 0) / daysSinceStart);
});

// Instance methods for lesson progress
UserProgressSchema.methods.startLesson = function (lessonId) {
  const existingProgress = this.lessonProgress.find(
    (p) => p.lessonId.toString() === lessonId.toString()
  );

  if (existingProgress) {
    existingProgress.status = "in_progress";
    existingProgress.startedAt = existingProgress.startedAt || new Date();
    existingProgress.lastAccessedAt = new Date();
  } else {
    this.lessonProgress.push({
      lessonId,
      status: "in_progress",
      startedAt: new Date(),
      lastAccessedAt: new Date(),
    });
    this.overallMetrics.totalLessonsStarted += 1;
  }

  return this.save();
};

UserProgressSchema.methods.completeLesson = function (
  lessonId,
  score,
  timeSpent,
  completionType = "manual"
) {
  const lessonProgress = this.lessonProgress.find(
    (p) => p.lessonId.toString() === lessonId.toString()
  );

  if (lessonProgress) {
    const wasCompleted =
      lessonProgress.status === "completed" ||
      lessonProgress.status === "mastered";

    lessonProgress.status = score >= 80 ? "mastered" : "completed";
    lessonProgress.completedAt = new Date();
    lessonProgress.lastAccessedAt = new Date();
    lessonProgress.score = score;
    lessonProgress.timeSpent += timeSpent;
    lessonProgress.completionType = completionType;

    // Update overall metrics only if lesson wasn't completed before
    if (!wasCompleted) {
      this.overallMetrics.totalLessonsCompleted += 1;
    }

    this.overallMetrics.totalStudyTime += timeSpent;
    this.overallMetrics.lastStudyDate = new Date();

    // Recalculate average score
    this.updateAverageScore();
  }

  return this.save();
};

UserProgressSchema.methods.updateLessonProgress = function (lessonId, updates) {
  const lessonProgress = this.lessonProgress.find(
    (p) => p.lessonId.toString() === lessonId.toString()
  );

  if (lessonProgress) {
    Object.assign(lessonProgress, {
      ...updates,
      lastAccessedAt: new Date(),
    });
  }

  return this.save();
};

// Instance methods for course progress
UserProgressSchema.methods.enrollInCourse = function (
  courseId,
  totalLessons = 0
) {
  const existingProgress = this.courseProgress.find(
    (p) => p.courseId.toString() === courseId.toString()
  );

  if (!existingProgress) {
    this.courseProgress.push({
      courseId,
      totalLessons,
      enrolledAt: new Date(),
      lastAccessedAt: new Date(),
    });
    this.overallMetrics.totalCoursesEnrolled += 1;
  }

  return this.save();
};

UserProgressSchema.methods.updateCourseProgress = function (courseId) {
  const courseProgress = this.courseProgress.find(
    (p) => p.courseId.toString() === courseId.toString()
  );

  if (courseProgress) {
    // Calculate progress based on completed lessons in this course
    const courseLessons = this.lessonProgress.filter((lp) => {
      // You would need to determine which lessons belong to which course
      // This is a simplified version
      return lp.status === "completed" || lp.status === "mastered";
    });

    courseProgress.lessonsCompleted = courseLessons.length;
    courseProgress.overallProgress =
      courseProgress.totalLessons > 0
        ? Math.round(
            (courseProgress.lessonsCompleted / courseProgress.totalLessons) *
              100
          )
        : 0;

    // Calculate average score for the course
    const courseScores = courseLessons
      .filter((lp) => lp.score !== undefined)
      .map((lp) => lp.score);

    courseProgress.averageScore =
      courseScores.length > 0
        ? Math.round(
            courseScores.reduce((sum, score) => sum + score, 0) /
              courseScores.length
          )
        : 0;

    // Calculate total time spent on course
    courseProgress.totalTimeSpent = courseLessons.reduce(
      (sum, lp) => sum + (lp.timeSpent || 0),
      0
    );

    courseProgress.lastAccessedAt = new Date();

    // Check if course is completed
    if (
      courseProgress.overallProgress === 100 &&
      courseProgress.status !== "completed"
    ) {
      courseProgress.status = "completed";
      courseProgress.completedAt = new Date();
      this.overallMetrics.totalCoursesCompleted += 1;
    }
  }

  return this.save();
};

// Utility methods
UserProgressSchema.methods.updateAverageScore = function () {
  const scoresWithValues = this.lessonProgress
    .filter((lp) => lp.score !== undefined && lp.score !== null)
    .map((lp) => lp.score);

  this.overallMetrics.averageScore =
    scoresWithValues.length > 0
      ? Math.round(
          scoresWithValues.reduce((sum, score) => sum + score, 0) /
            scoresWithValues.length
        )
      : 0;
};

UserProgressSchema.methods.updateStreak = function () {
  const today = new Date();
  const lastStudy = this.overallMetrics.lastStudyDate;

  if (!lastStudy) {
    this.overallMetrics.currentStreak = 1;
  } else {
    const daysDiff = Math.floor((today - lastStudy) / (1000 * 60 * 60 * 24));

    if (daysDiff === 1) {
      // Consecutive day
      this.overallMetrics.currentStreak += 1;
      if (
        this.overallMetrics.currentStreak > this.overallMetrics.longestStreak
      ) {
        this.overallMetrics.longestStreak = this.overallMetrics.currentStreak;
      }
    } else if (daysDiff > 1) {
      // Streak broken
      this.overallMetrics.currentStreak = 1;
    }
    // If daysDiff === 0, it's the same day, so don't change streak
  }

  this.overallMetrics.lastStudyDate = today;
};

UserProgressSchema.methods.getLessonProgress = function (lessonId) {
  return this.lessonProgress.find(
    (p) => p.lessonId.toString() === lessonId.toString()
  );
};

UserProgressSchema.methods.getCourseProgress = function (courseId) {
  return this.courseProgress.find(
    (p) => p.courseId.toString() === courseId.toString()
  );
};

// Pre-save middleware
UserProgressSchema.pre("save", function (next) {
  this.lastSyncAt = new Date();
  next();
});

// Export model and constants
module.exports = {
  UserProgress: model("UserProgress", UserProgressSchema),
  PROGRESS_STATUSES,
  COMPLETION_TYPES,
};
