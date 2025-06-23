const { Schema, model, Types } = require("mongoose");
const { HINT_TYPES, DIFFICULTY_LEVELS } = require("../../constants");

// =============== CONSTANTS =============
/**
 * Imported constants for hint types and difficulty levels.
 * @see module:constants/index
 */

// =============== SUBSCHEMAS =============
/**
 * Subschema for device information in hint usage.
 * @module DeviceInfoSchema
 */
const DeviceInfoSchema = new Schema({
  platform: {
    type: String,
    trim: true,
  },
  browser: {
    type: String,
    trim: true,
  },
  screenSize: {
    type: String,
    trim: true,
  },
});

/**
 * Subschema for context details in hint usage.
 * @module ContextSchema
 */
const ContextSchema = new Schema({
  attemptNumber: {
    type: Number,
    default: 1,
    min: [1, "Le numéro de tentative doit être au moins 1"],
  },
  timeBeforeHint: {
    type: Number,
    min: [0, "Le temps avant l'indice ne peut pas être négatif"],
  },
  previousAnswers: {
    type: [Schema.Types.Mixed],
    default: [],
    validate: {
      validator: (v) => v.length <= 10,
      message: "Trop de réponses précédentes",
    },
  },
  difficulty: {
    type: String,
    enum: {
      values: DIFFICULTY_LEVELS,
      message: `La difficulté doit être l'une des suivantes : ${DIFFICULTY_LEVELS.join(
        ", "
      )}`,
    },
  },
});

// ================= SCHEMA =================
/**
 * Mongoose schema for hint usage, tracking when and how hints are used.
 * @module HintUsageSchema
 */
const HintUsageSchema = new Schema(
  {
    // Core identifiers
    questionId: {
      type: Types.ObjectId,
      ref: "Question",
      required: [true, "L'ID de la question est requis"],
    },
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "L'ID de l'utilisateur est requis"],
    },
    quizId: {
      type: Types.ObjectId,
      ref: "Quiz",
    },
    series: {
      type: [
        {
          type: String,
          trim: true,
          minlength: [1, "L'élément de série ne peut pas être vide"],
        },
      ],
      default: [],
    },
    sessionId: {
      type: String,
      match: [
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        "L'ID de session doit être un UUID valide",
      ],
    },
    // Usage details
    usedAt: {
      type: Date,
      default: Date.now,
    },
    stepsViewed: {
      type: [Number],
      default: [],
      validate: {
        validator: (v) => v.every((step) => step >= 0),
        message: "Les numéros d'étape doivent être non négatifs",
      },
    },
    totalStepsAvailable: {
      type: Number,
      min: [1, "Le nombre total d'étapes doit être au moins 1"],
    },
    hintType: {
      type: String,
      enum: {
        values: HINT_TYPES,
        message: `Le type d'indice doit être l'un des suivants : ${HINT_TYPES.join(
          ", "
        )}`,
      },
      default: HINT_TYPES[0], // step
    },
    pointsDeducted: {
      type: Number,
      default: 0,
      min: [0, "Les points déduits ne peuvent pas être négatifs"],
    },
    timeSpentOnHint: {
      type: Number, // in seconds
      default: 0,
      min: [0, "Le temps passé sur l'indice ne peut pas être négatif"],
    },
    // Additional context
    deviceInfo: {
      type: DeviceInfoSchema,
    },
    context: {
      type: ContextSchema,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// =============== INDEXES =================
HintUsageSchema.index({ userId: 1, questionId: 1 });
HintUsageSchema.index({ userId: 1, usedAt: -1 });
HintUsageSchema.index({ questionId: 1, usedAt: -1 });
HintUsageSchema.index({ quizId: 1, userId: 1 }, { sparse: true });
HintUsageSchema.index({ hintType: 1 });

// =============== MIDDLEWARE =================
/**
 * Pre-save middleware to validate references and steps viewed.
 */
HintUsageSchema.pre("save", async function (next) {
  try {
    if (this.stepsViewed?.length > 0) {
      this.stepsViewed = [...new Set(this.stepsViewed)].sort((a, b) => a - b);
    }
    const [question, user, quiz] = await Promise.all([
      model("Question").findById(this.questionId),
      model("User").findById(this.userId),
      this.quizId ? model("Quiz").findById(this.quizId) : Promise.resolve(null),
    ]);
    if (!question) return next(new Error("Identifiant de question invalide"));
    if (!user) return next(new Error("Identifiant d'utilisateur invalide"));
    if (this.quizId && !quiz)
      return next(new Error("Identifiant de quiz invalide"));
    if (
      this.totalStepsAvailable &&
      this.stepsViewed.some((step) => step >= this.totalStepsAvailable)
    ) {
      return next(
        new Error("Le numéro d'étape dépasse le total des étapes disponibles")
      );
    }
    next();
  } catch (error) {
    next(error);
  }
});

// =============== VIRTUALS =============
/**
 * Virtual field for completion percentage of hint steps viewed.
 * @returns {number} Percentage of steps viewed.
 */
HintUsageSchema.virtual("completionPercentage").get(function () {
  if (!(this.totalStepsAvailable ?? 0)) return 0;
  return Math.round(
    ((this.stepsViewed ?? []).length / this.totalStepsAvailable) * 100
  );
});

/**
 * Virtual field to check if the hint was helpful based on quiz results.
 * @returns {Promise<boolean>} True if the hint led to a correct answer.
 */
HintUsageSchema.virtual("wasHelpful").get(async function () {
  const quizResult = await model("QuizResult").findOne({
    userId: this.userId,
    quizId: this.quizId,
    questionIds: this.questionId,
    completedAt: { $gte: this.usedAt ?? new Date() },
  });
  return !!(quizResult && quizResult.correctCount > 0);
});

// =============== METHODS =============
/**
 * Adds a viewed step to the stepsViewed array, ensuring uniqueness and sorting.
 * @param {number} stepNumber - The step number to add.
 * @returns {number[]} Updated stepsViewed array.
 */
HintUsageSchema.methods.addViewedStep = function (stepNumber) {
  if (!this.stepsViewed.includes(stepNumber)) {
    this.stepsViewed.push(stepNumber);
    this.stepsViewed.sort((a, b) => a - b);
  }
  return this.stepsViewed;
};

/**
 * Checks if all available steps have been viewed.
 * @returns {boolean} True if all steps are viewed.
 */
HintUsageSchema.methods.hasViewedAllSteps = function () {
  return (
    this.totalStepsAvailable &&
    (this.stepsViewed ?? []).length >= this.totalStepsAvailable
  );
};

// =============== STATICS =============
/**
 * Aggregates hint usage statistics for a specific question.
 * @param {string} questionId - The ID of the question.
 * @returns {Promise<object>} Statistics including total usages, unique users, etc.
 */
HintUsageSchema.statics.getQuestionHintStats = function (questionId) {
  return this.aggregate([
    { $match: { questionId: new Types.ObjectId(questionId) } },
    {
      $group: {
        _id: null,
        totalUsages: { $sum: 1 },
        uniqueUsers: { $addToSet: "$userId" },
        averageStepsViewed: { $avg: { $size: "$stepsViewed" } },
        averageTimeSpent: { $avg: "$timeSpentOnHint" },
        totalPointsDeducted: { $sum: "$pointsDeducted" },
      },
    },
    {
      $project: {
        _id: 0,
        totalUsages: 1,
        uniqueUsers: { $size: "$uniqueUsers" },
        averageStepsViewed: { $round: ["$averageStepsViewed", 2] },
        averageTimeSpent: { $round: ["$averageTimeSpent", 2] },
        totalPointsDeducted: 1,
      },
    },
  ]);
};

/**
 * Retrieves recent hint usage patterns for a user.
 * @param {string} userId - The ID of the user.
 * @param {number} [limit=50] - Maximum number of records to return.
 * @returns {Promise<object[]>} Array of hint usage records with populated fields.
 */
HintUsageSchema.statics.getUserHintPattern = function (userId, limit = 50) {
  return this.find({ userId })
    .populate("questionId", "question difficulty")
    .populate("quizId", "title")
    .sort({ usedAt: -1 })
    .limit(limit)
    .lean();
};

/**
 * Identifies questions needing better hints based on usage patterns.
 * @returns {Promise<object[]>} Array of questions with high hint usage.
 */
HintUsageSchema.statics.findQuestionsNeedingBetterHints = function () {
  return this.aggregate([
    {
      $group: {
        _id: "$questionId",
        totalUsages: { $sum: 1 },
        averageStepsViewed: { $avg: { $size: "$stepsViewed" } },
        averageTimeSpent: { $avg: "$timeSpentOnHint" },
      },
    },
    {
      $match: {
        totalUsages: { $gte: 10 },
        averageStepsViewed: { $gte: 3 },
        averageTimeSpent: { $gte: 120 },
      },
    },
    { $sort: { totalUsages: -1 } },
  ]);
};

/**
 * HintUsage model for interacting with the HintUsage collection.
 * @type {mongoose.Model}
 */
module.exports = {
  HintUsage: model("HintUsage", HintUsageSchema),
};