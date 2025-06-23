const { Schema, model, Types } = require("mongoose");
const { QUIZ_SESSION_STATUSES } = require("../../constants");

// =============== CONSTANTS =============
/**
 * Imported constants for quiz session statuses.
 * @see module:constants/index
 */

// =============== SUBSCHEMAS =============
/**
 * Subschema for quiz session answers.
 * @module AnswerSchema
 */
const AnswerSchema = new Schema({
  questionId: {
    type: Types.ObjectId,
    ref: "Question",
    required: [true, "L'ID de la question est requis"],
  },
  selectedAnswer: Schema.Types.Mixed,
  isCorrect: {
    type: Boolean,
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0,
  },
  answeredAt: {
    type: Date,
    default: Date.now,
  },
  flagged: {
    type: Boolean,
    default: false,
  },
  skipped: {
    type: Boolean,
    default: false,
  },
});

/**
 * Subschema for quiz session progress.
 * @module ProgressSchema
 */
const ProgressSchema = new Schema({
  questionsAnswered: {
    type: Number,
    default: 0,
  },
  questionsSkipped: {
    type: Number,
    default: 0,
  },
  questionsFlagged: {
    type: Number,
    default: 0,
  },
  percentageComplete: {
    type: Number,
    default: 0,
    min: [0, "Le pourcentage complété ne peut pas être négatif"],
    max: [100, "Le pourcentage complété ne peut pas dépasser 100"],
  },
});

/**
 * Subschema for quiz session device information.
 * @module DeviceInfoSchema
 */
const DeviceInfoSchema = new Schema({
  platform: {
    type: String,
  },
  browser: {
    type: String,
  },
  version: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  screenResolution: {
    type: String,
  },
  lastSync: {
    type: Date,
    default: Date.now,
  },
  isOnline: {
    type: Boolean,
    default: true,
  },
});

/**
 * Subschema for quiz session settings.
 * @module SettingsSchema
 */
const SettingsSchema = new Schema({
  autoSave: {
    type: Boolean,
    default: true,
  },
  showTimer: {
    type: Boolean,
    default: true,
  },
  allowNavigation: {
    type: Boolean,
    default: true,
  },
});

/**
 * Subschema for quiz session metadata.
 * @module MetadataSchema
 */
const MetadataSchema = new Schema({
  ipAddress: {
    type: String,
  },
  location: {
    country: String,
    city: String,
    timezone: String,
  },
  sessionDuration: {
    type: Number, // in seconds
  },
  pausedDuration: {
    type: Number, // in seconds
  },
  totalInteractions: {
    type: Number,
    default: 0,
  },
});

// ================= SCHEMA =================
/**
 * Mongoose schema for quiz sessions, tracking user progress and interactions.
 * @module QuizSessionSchema
 */
const QuizSessionSchema = new Schema(
  {
    // Session details
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "L'ID de l'utilisateur est requis"],
    },
    quizId: {
      type: Types.ObjectId,
      ref: "Quiz",
      required: [true, "L'ID du quiz est requis"],
    },
    sessionId: {
      type: String,
      required: [true, "L'ID de la session est requis"],
      unique: [true, "L'ID de la session doit être unique"],
      default: () =>
        `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    timeRemaining: {
      type: Number, // in seconds
      default: 0,
    },
    // Answers
    answers: {
      type: [AnswerSchema],
      default: [],
    },
    currentQuestionIndex: {
      type: Number,
      default: 0,
      min: [0, "L'index de la question actuelle ne peut pas être négatif"],
    },
    status: {
      type: String,
      enum: {
        values: QUIZ_SESSION_STATUSES,
        message: `Le statut doit être l'un des suivants : ${QUIZ_SESSION_STATUSES.join(
          ", "
        )}`,
      },
      required: [true, "Le statut est requis"],
      default: QUIZ_SESSION_STATUSES[0], // not_started
    },
    // Progress
    progress: {
      type: ProgressSchema,
      default: () => ({}),
    },
    // Device info
    deviceInfo: {
      type: DeviceInfoSchema,
      default: () => ({}),
    },
    // Settings
    settings: {
      type: SettingsSchema,
      default: () => ({}),
    },
    // Metadata
    metadata: {
      type: MetadataSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// =============== INDEXES =================
QuizSessionSchema.index({ userId: 1, quizId: 1 });
QuizSessionSchema.index({ userId: 1, status: 1 });
QuizSessionSchema.index({ quizId: 1, status: 1 });
QuizSessionSchema.index({ startTime: 1, status: 1 });
QuizSessionSchema.index({ lastActive: 1, status: 1 });
QuizSessionSchema.index({ endTime: 1 }, { sparse: true });

// =============== VIRTUALS =============
/**
 * Virtual field for session duration in seconds.
 * @returns {number} Duration of the session in seconds.
 */
QuizSessionSchema.virtual("sessionDuration").get(function () {
  if (this.endTime && this.startTime) {
    return Math.floor((this.endTime - this.startTime) / 1000);
  }
  if (this.startTime) {
    return Math.floor((new Date() - this.startTime) / 1000);
  }
  return 0;
});

/**
 * Virtual field for time elapsed excluding paused duration.
 * @returns {number} Elapsed time in seconds.
 */
QuizSessionSchema.virtual("timeElapsed").get(function () {
  if (this.startTime) {
    const elapsed = Math.floor((new Date() - this.startTime) / 1000);
    return elapsed - (this.metadata?.pausedDuration ?? 0);
  }
  return 0;
});

/**
 * Virtual field for completion percentage.
 * @returns {number} Percentage of answered questions.
 */
QuizSessionSchema.virtual("completionPercentage").get(function () {
  if ((this.answers ?? []).length === 0) return 0;
  const totalQuestions = this.answers.length;
  const answeredQuestions = this.answers.filter(
    (answer) =>
      answer.selectedAnswer !== null &&
      answer.selectedAnswer !== undefined &&
      !answer.skipped
  ).length;
  return Math.round((answeredQuestions / totalQuestions) * 100);
});

/**
 * Virtual field to check if the session is expired.
 * @returns {boolean} True if the session is expired.
 */
QuizSessionSchema.virtual("isExpired").get(function () {
  if (!(this.timeRemaining ?? 0) || this.status === QUIZ_SESSION_STATUSES[3]) {
    // completed
    return false;
  }
  return this.timeRemaining <= 0;
});

// =============== MIDDLEWARE =============
/**
 * Pre-save middleware to update progress and last active time.
 * @param {Function} next - Callback to proceed with save.
 */
QuizSessionSchema.pre("save", function (next) {
  if (this.answers?.length > 0) {
    this.progress.questionsAnswered = this.answers.filter(
      (a) =>
        a.selectedAnswer !== null &&
        a.selectedAnswer !== undefined &&
        !a.skipped
    ).length;
    this.progress.questionsSkipped = this.answers.filter(
      (a) => a.skipped
    ).length;
    this.progress.questionsFlagged = this.answers.filter(
      (a) => a.flagged
    ).length;
    this.progress.percentageComplete = this.completionPercentage;
  }

  // Update last active time
  this.lastActive = new Date();

  next();
});

// =============== METHODS =============
/**
 * Checks if the session is active.
 * @returns {boolean} True if the session is in_progress or paused.
 */
QuizSessionSchema.methods.isActive = function () {
  return [QUIZ_SESSION_STATUSES[1], QUIZ_SESSION_STATUSES[2]].includes(
    this.status
  ); // in_progress, paused
};

/**
 * Checks if the session can be resumed.
 * @returns {boolean} True if the session is paused and not expired.
 */
QuizSessionSchema.methods.canResume = function () {
  return this.status === QUIZ_SESSION_STATUSES[2] && !this.isExpired; // paused
};

/**
 * Gets the index of the next question.
 * @returns {number|null} Index of the next question or null if none.
 */
QuizSessionSchema.methods.getNextQuestion = function () {
  if (this.currentQuestionIndex < (this.answers?.length ?? 0) - 1) {
    return this.currentQuestionIndex + 1;
  }
  return null;
};

/**
 * Gets the index of the previous question.
 * @returns {number|null} Index of the previous question or null if none.
 */
QuizSessionSchema.methods.getPreviousQuestion = function () {
  if (this.currentQuestionIndex > 0) {
    return this.currentQuestionIndex - 1;
  }
  return null;
};

/**
 * Calculates the score for the session.
 * @returns {Object} Score details including correct count, total questions, and percentage.
 */
QuizSessionSchema.methods.calculateScore = function () {
  const correctAnswers = this.answers.filter(
    (answer) => answer.isCorrect
  ).length;
  const totalQuestions = this.answers?.length ?? 0;
  return {
    correctCount: correctAnswers,
    totalQuestions,
    percentage:
      totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0,
  };
};

// =============== STATICS =============
/**
 * Finds active quiz sessions for a user.
 * @param {string} userId - ID of the user.
 * @returns {Promise<Document[]>} Array of active session documents.
 */
QuizSessionSchema.statics.findActiveSessions = function (userId) {
  return this.find({
    userId,
    status: {
      $in: [QUIZ_SESSION_STATUSES[1], QUIZ_SESSION_STATUSES[2]], // in_progress, paused
    },
  }).populate("quizId", "title timeLimit");
};

/**
 * Finds expired quiz sessions.
 * @returns {Promise<Document[]>} Array of expired session documents.
 */
QuizSessionSchema.statics.findExpiredSessions = function () {
  const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
  return this.find({
    status: {
      $in: [QUIZ_SESSION_STATUSES[1], QUIZ_SESSION_STATUSES[2]], // in_progress, paused
    },
    lastActive: { $lt: cutoffTime },
  });
};

/**
 * Cleans up old quiz sessions.
 * @param {number} [daysOld=30] - Age of sessions to delete in days.
 * @returns {Promise<Object>} Result of the deletion operation.
 */
QuizSessionSchema.statics.cleanupOldSessions = function (daysOld = 30) {
  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
  return this.deleteMany({
    status: {
      $in: [
        QUIZ_SESSION_STATUSES[3], // completed
        QUIZ_SESSION_STATUSES[4], // abandoned
        QUIZ_SESSION_STATUSES[5], // expired
      ],
    },
    createdAt: { $lt: cutoffDate },
  });
};

/**
 * QuizSession model for interacting with the QuizSession collection.
 * @type {mongoose.Model}
 */
module.exports = {
  QuizSession: model("QuizSession", QuizSessionSchema),
};
