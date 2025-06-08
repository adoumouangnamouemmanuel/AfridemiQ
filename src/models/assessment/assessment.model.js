const { Schema, model, Types } = require("mongoose");
const {
  ASSESSMENT_FORMATS,
  DIFFICULTY_LEVELS,
  EDUCATION_LEVELS,
  ASSESSMENT_STATUSES,
} = require("../../constants");

// =============== CONSTANTS =============
/**
 * Imported constants for assessment formats, difficulty levels, education levels, and statuses.
 * @see module:constants/index
 */

// ==================== SCHEMA ==================
/**
 * Mongoose schema for assessments, managing quizzes, exams, and other evaluations.
 * @module AssessmentSchema
 */
const AssessmentSchema = new Schema(
  {
    // Assessment details
    format: {
      type: String,
      enum: ASSESSMENT_FORMATS,
      required: [true, "Le format de l'évaluation est requis"],
      default: ASSESSMENT_FORMATS[0], // quiz
    },
    title: {
      type: String,
      required: [true, "Le titre est requis"],
      trim: true,
      maxlength: [200, "Le titre est trop long (max 200 caractères)"],
    },
    description: {
      type: String,
      required: [true, "La description est requise"],
      trim: true,
      maxlength: [1000, "La description est trop longue (max 1000 caractères)"],
    },
    subjectId: {
      type: Types.ObjectId,
      ref: "Subject",
      required: [true, "L'ID de la matière est requis"],
    },
    topicIds: {
      type: [{ type: Types.ObjectId, ref: "Topic" }],
      default: [],
    },
    questionIds: {
      type: [{ type: Types.ObjectId, ref: "Question" }],
      required: [true, "Les IDs des questions sont requis"],
      default: [],
    },
    creatorId: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "L'ID du créateur est requis"],
    },
    // Scoring and limits
    passingScore: {
      type: Number,
      required: [true, "Le score minimum requis est requis"],
      min: [0, "Le score minimum doit être au moins 0"],
      max: [100, "Le score minimum ne peut dépasser 100"],
    },
    totalMarks: {
      type: Number,
      required: [true, "Le total des points est requis"],
      min: [1, "Le total des points doit être au moins 1"],
    },
    timeLimit: {
      type: Number, // in minutes
      min: [1, "La durée doit être d'au moins 1 minute"],
      max: [480, "La durée ne peut dépasser 8 heures"],
    },
    attempts: {
      type: Number,
      required: [true, "Le nombre de tentatives est requis"],
      min: [1, "Le nombre de tentatives doit être au moins 1"],
      max: [10, "Le nombre de tentatives ne peut dépasser 10"],
      default: 3,
    },
    // Difficulty and categorization
    difficulty: {
      type: String,
      enum: DIFFICULTY_LEVELS,
      default: DIFFICULTY_LEVELS[1], // Medium
    },
    series: {
      type: [String],
      default: [],
    },
    level: {
      type: String,
      enum: EDUCATION_LEVELS,
      required: [true, "Le niveau d'éducation est requis"],
    },
    // Feedback settings
    feedback: {
      immediate: { type: Boolean, default: true },
      detailed: { type: Boolean, default: true },
      solutions: { type: Boolean, default: true },
      showCorrectAnswers: { type: Boolean, default: true },
    },
    // Assessment settings
    settings: {
      shuffleQuestions: { type: Boolean, default: false },
      shuffleOptions: { type: Boolean, default: false },
      allowReview: { type: Boolean, default: true },
      showProgress: { type: Boolean, default: true },
      preventCheating: { type: Boolean, default: false },
    },
    // Scheduling details
    scheduling: {
      startDate: { type: Date },
      endDate: { type: Date },
      timezone: { type: String, default: "Africa/Lagos" },
    },
    // Analytics data
    analytics: {
      totalAttempts: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
      passRate: { type: Number, default: 0 },
      averageTimeSpent: { type: Number, default: 0 },
    },
    // Metadata
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ASSESSMENT_STATUSES,
      default: ASSESSMENT_STATUSES[0], // draft
    },
    premiumOnly: {
      type: Boolean,
      default: false,
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

// =============== INDEXES =================
AssessmentSchema.index({ format: 1, subjectId: 1 });
AssessmentSchema.index({ creatorId: 1, status: 1 });
AssessmentSchema.index({ level: 1, difficulty: 1 });
AssessmentSchema.index({ "scheduling.startDate": 1, "scheduling.endDate": 1 });
AssessmentSchema.index({ tags: 1 });
AssessmentSchema.index({ premiumOnly: 1, isActive: 1 }, { sparse: true });

// =============== VIRTUALS =============
/**
 * Virtual field for the number of questions in the assessment.
 * @returns {number} Length of questionIds array.
 */
AssessmentSchema.virtual("questionCount").get(function () {
  return (this.questionIds ?? []).length;
});

/**
 * Virtual field for estimated duration of the assessment.
 * @returns {number} Time limit or estimated duration based on question count.
 */
AssessmentSchema.virtual("estimatedDuration").get(function () {
  if (this.timeLimit) return this.timeLimit;
  return this.questionCount * 2; // Estimate 2 minutes per question
});

/**
 * Virtual field to check if the assessment is scheduled.
 * @returns {boolean} True if startDate and endDate are set, false otherwise.
 */
AssessmentSchema.virtual("isScheduled").get(function () {
  return !!(this.scheduling?.startDate && this.scheduling?.endDate);
});

/**
 * Virtual field to check if the assessment is currently active.
 * @returns {boolean} True if published and within scheduling window, false otherwise.
 */
AssessmentSchema.virtual("isCurrentlyActive").get(function () {
  if (!this.isScheduled) return this.status === ASSESSMENT_STATUSES[1]; // published
  const now = new Date();
  return (
    this.status === ASSESSMENT_STATUSES[1] && // published
    this.scheduling.startDate <= now &&
    this.scheduling.endDate >= now
  );
});

// =============== METHODS =============
/**
 * Updates assessment analytics based on a new attempt.
 * @param {number} score - Score achieved in the attempt.
 * @param {number} timeSpent - Time spent on the attempt.
 * @returns {Promise<Document>} Updated assessment document.
 */
AssessmentSchema.methods.updateAnalytics = function (score, timeSpent) {
  this.analytics.totalAttempts += 1;

  // Update average score
  const totalScore =
    this.analytics.averageScore * (this.analytics.totalAttempts - 1) + score;
  this.analytics.averageScore = totalScore / this.analytics.totalAttempts;

  // Update pass rate
  if (score >= this.passingScore) {
    const currentPasses = Math.round(
      (this.analytics.passRate * (this.analytics.totalAttempts - 1)) / 100
    );
    this.analytics.passRate =
      ((currentPasses + 1) / this.analytics.totalAttempts) * 100;
  }

  // Update average time spent
  const totalTime =
    this.analytics.averageTimeSpent * (this.analytics.totalAttempts - 1) +
    timeSpent;
  this.analytics.averageTimeSpent = totalTime / this.analytics.totalAttempts;

  return this.save();
};

/**
 * Checks if a user can attempt the assessment.
 * @param {number} userAttempts - Number of attempts made by the user.
 * @returns {boolean} True if user has remaining attempts, false otherwise.
 */
AssessmentSchema.methods.canUserAttempt = function (userAttempts) {
  return userAttempts < this.attempts;
};

// =============== STATICS =============
/**
 * Finds assessments by subject with optional filters.
 * @param {string} subjectId - ID of the subject.
 * @param {Object} [options={}] - Optional filters (format, level, difficulty).
 * @returns {Promise<Document[]>} Array of matching assessment documents.
 */
AssessmentSchema.statics.findBySubject = function (subjectId, options = {}) {
  const query = { subjectId, isActive: true };
  if (options.format) query.format = options.format;
  if (options.level) query.level = options.level;
  if (options.difficulty) query.difficulty = options.difficulty;

  return this.find(query)
    .populate("subjectId", "name code")
    .populate("topicIds", "name")
    .populate("creatorId", "name email")
    .sort({ createdAt: -1 });
};

/**
 * Finds published assessments with optional filters.
 * @param {Object} [filters={}] - Optional filters (subjectId, level, format, premiumOnly).
 * @returns {Promise<Document[]>} Array of published assessment documents.
 */
AssessmentSchema.statics.findPublished = function (filters = {}) {
  const query = { status: ASSESSMENT_STATUSES[1], isActive: true }; // published

  if (filters.subjectId) query.subjectId = filters.subjectId;
  if (filters.level) query.level = filters.level;
  if (filters.format) query.format = filters.format;
  if (filters.premiumOnly !== undefined)
    query.premiumOnly = filters.premiumOnly;

  return this.find(query)
    .populate("subjectId", "name code")
    .populate("topicIds", "name")
    .sort({ createdAt: -1 });
};

/**
 * Assessment model for interacting with the Assessment collection.
 * @type {mongoose.Model}
 */
module.exports = {
  Assessment: model("Assessment", AssessmentSchema),
};
