const { Schema, model, Types } = require("mongoose");
const {
  EXERCISE_DIFFICULTY_LEVELS,
  DIFFICULTY_LEVELS,
} = require("../../constants");

// =============== CONSTANTS =============
/**
 * Imported constants for quiz levels (EXERCISE_DIFFICULTY_LEVELS) and difficulty (DIFFICULTY_LEVELS).
 * @see module:constants/index
 */

// =============== SUBSCHEMAS =============
/**
 * Subschema for quiz retake policy.
 * @module RetakePolicySchema
 */
const RetakePolicySchema = new Schema({
  maxAttempts: {
    type: Number,
    default: 3,
    min: [1, "Le nombre maximum de tentatives doit être au moins 1"],
    max: [10, "Le nombre maximum de tentatives ne peut pas dépasser 10"],
  },
  cooldownMinutes: {
    type: Number,
    default: 0,
    min: [0, "La période de refroidissement ne peut pas être négative"],
    max: [1440, "La période de refroidissement ne peut pas dépasser 24 heures"],
  },
});

/**
 * Subschema for quiz settings.
 * @module SettingsSchema
 */
const SettingsSchema = new Schema({
  shuffleQuestions: {
    type: Boolean,
    default: false,
  },
  shuffleOptions: {
    type: Boolean,
    default: false,
  },
  showCorrectAnswers: {
    type: Boolean,
    default: true,
  },
  allowReview: {
    type: Boolean,
    default: true,
  },
});

/**
 * Subschema for quiz analytics.
 * @module AnalyticsSchema
 */
const AnalyticsSchema = new Schema({
  totalAttempts: {
    type: Number,
    default: 0,
  },
  averageScore: {
    type: Number,
    default: 0,
  },
  averageTime: {
    type: Number,
    default: 0,
  },
  completionRate: {
    type: Number,
    default: 0,
  },
});

// ================= SCHEMA =================
/**
 * Mongoose schema for quizzes, supporting various subjects and configurations.
 * @module QuizSchema
 */
const QuizSchema = new Schema(
  {
    // Quiz details
    title: {
      type: String,
      required: [true, "Le titre est requis"],
      trim: true,
      maxlength: [200, "Le titre ne peut pas dépasser 200 caractères"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "La description ne peut pas dépasser 1000 caractères"],
    },
    subjectId: {
      type: Types.ObjectId,
      ref: "Subject",
      required: [true, "L'ID de la matière est requis"],
    },
    series: {
      type: [String],
      default: [],
    },
    topicIds: {
      type: [{ type: Types.ObjectId, ref: "Topic" }],
      default: [],
    },
    questionIds: {
      type: [{ type: Types.ObjectId, ref: "Question" }],
      default: [],
    },
    totalQuestions: {
      type: Number,
      required: [true, "Le nombre total de questions est requis"],
      min: [1, "Le quiz doit avoir au moins 1 question"],
      max: [100, "Le quiz ne peut pas avoir plus de 100 questions"],
    },
    totalPoints: {
      type: Number,
      required: [true, "Le total des points est requis"],
      min: [1, "Le total des points doit être au moins 1"],
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "L'ID du créateur est requis"],
    },
    level: {
      type: String,
      enum: EXERCISE_DIFFICULTY_LEVELS,
      required: [true, "Le niveau est requis"],
    },
    timeLimit: {
      type: Number,
      required: [true, "La limite de temps est requise"],
      min: [60, "La limite de temps doit être d'au moins 1 minute"],
      max: [10800, "La limite de temps ne peut pas dépasser 3 heures"],
    },
    // Configuration
    retakePolicy: {
      type: RetakePolicySchema,
      default: () => ({}),
    },
    resultIds: {
      type: [{ type: Types.ObjectId, ref: "QuizResult" }],
      default: [],
    },
    settings: {
      type: SettingsSchema,
      default: () => ({}),
    },
    difficulty: {
      type: String,
      enum: DIFFICULTY_LEVELS,
      default: DIFFICULTY_LEVELS[1], // Medium
    },
    tags: {
      type: [String],
      trim: true,
      lowercase: true,
      default: [],
    },
    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
    offlineAvailable: {
      type: Boolean,
      default: false,
    },
    premiumOnly: {
      type: Boolean,
      default: false,
    },
    // Analytics
    analytics: {
      type: AnalyticsSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    validate: {
      validator: function () {
        return this.questionIds.length > 0;
      },
      message: "Le quiz doit avoir au moins une question",
    },
  }
);

// =============== INDEXES =================
QuizSchema.index({ subjectId: 1, level: 1 });
QuizSchema.index({ createdBy: 1, createdAt: -1 });
QuizSchema.index({ isActive: 1, premiumOnly: 1 }, { sparse: true });
QuizSchema.index({ tags: 1 }, { sparse: true });

// =============== VIRTUALS =============
/**
 * Virtual field for average score percentage.
 * @returns {number} Percentage of average score relative to total points.
 */
QuizSchema.virtual("averageScorePercentage").get(function () {
  return (this.totalPoints ?? 0) === 0
    ? 0
    : Math.round((this.analytics?.averageScore / this.totalPoints) * 100);
});

/**
 * Virtual field for difficulty rating.
 * @returns {number} Numeric rating based on difficulty level.
 */
QuizSchema.virtual("difficultyRating").get(function () {
  const ratings = {
    [DIFFICULTY_LEVELS[0]]: 1, // Easy
    [DIFFICULTY_LEVELS[1]]: 2, // Medium
    [DIFFICULTY_LEVELS[2]]: 3, // Hard
    [DIFFICULTY_LEVELS[3]]: 2, // Mixed
  };
  return ratings[this.difficulty] ?? 2;
});

/**
 * Virtual field for estimated duration in minutes.
 * @returns {number} Time limit in minutes, rounded up.
 */
QuizSchema.virtual("estimatedDurationMinutes").get(function () {
  return Math.ceil((this.timeLimit ?? 60) / 60);
});

// =============== MIDDLEWARE =============
/**
 * Pre-save middleware to sync totalQuestions with questionIds length.
 * @param {Function} next - Callback to proceed with save.
 */
QuizSchema.pre("save", function (next) {
  if (this.questionIds.length !== this.totalQuestions) {
    this.totalQuestions = this.questionIds.length;
  }
  next();
});

// =============== METHODS =============
/**
 * Checks if a user can retake the quiz based on attempts.
 * @param {number} userAttempts - Number of user attempts.
 * @returns {boolean} True if user can retake the quiz.
 */
QuizSchema.methods.canUserRetake = function (userAttempts) {
  return userAttempts < (this.retakePolicy?.maxAttempts ?? 3);
};

/**
 * Calculates the next available retake time based on cooldown.
 * @param {Date} lastAttemptTime - Time of the last attempt.
 * @returns {Date} Next available retake time.
 */
QuizSchema.methods.getNextRetakeTime = function (lastAttemptTime) {
  if ((this.retakePolicy?.cooldownMinutes ?? 0) === 0) return new Date();
  return new Date(
    lastAttemptTime.getTime() + this.retakePolicy.cooldownMinutes * 60 * 1000
  );
};

// =============== STATICS =============
/**
 * Finds quizzes by subject and level.
 * @param {string} subjectId - ID of the subject.
 * @param {string} level - Level of the quiz.
 * @returns {Promise<Document[]>} Array of quiz documents.
 */
QuizSchema.statics.findBySubjectAndLevel = function (subjectId, level) {
  return this.find({
    subjectId,
    level,
    isActive: true,
  }).populate("subjectId", "name");
};

/**
 * Retrieves popular quizzes based on total attempts.
 * @param {number} [limit=10] - Maximum number of quizzes to return.
 * @returns {Promise<Document[]>} Array of popular quiz documents.
 */
QuizSchema.statics.getPopularQuizzes = function (limit = 10) {
  return this.find({ isActive: true })
    .sort({ "analytics.totalAttempts": -1 })
    .limit(limit)
    .populate("subjectId", "name");
};

/**
 * Quiz model for interacting with the Quiz collection.
 * @type {mongoose.Model}
 */
module.exports = {
  Quiz: model("Quiz", QuizSchema),
};
