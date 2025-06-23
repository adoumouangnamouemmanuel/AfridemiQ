const { Schema, model, Types } = require("mongoose");
const {
  EXERCISE_DIFFICULTY_LEVELS,
  QUESTION_TYPES,
  QUESTION_LEVELS,
  QUESTION_STATUSES,
  MEDIA_TYPES,
} = require("../../constants");

// =============== CONSTANTS =============
/**
 * Imported constants for question difficulty levels, types, education levels, statuses, and media types.
 * @see module:constants/index
 */

// =============== SUBSCHEMAS =============
/**
 * Subschema for question media content.
 * @module MediaSubSchema
 */
const MediaSchema = new Schema({
  mediaType: {
    type: String,
    enum: MEDIA_TYPES,
  },
  url: {
    type: String,
    match: [/^https?:\/\/.+/, "L'URL du média doit être valide"],
  },
  altText: {
    type: String,
  },
  caption: {
    type: String,
  },
  size: {
    type: Number,
  },
  duration: {
    type: Number,
  },
});

// ================= SCHEMA =================
/**
 * Mongoose schema for questions, supporting various formats and subjects.
 * @module QuestionSchema
 */
const QuestionSchema = new Schema(
  {
    // Question details
    topicId: {
      type: Types.ObjectId,
      ref: "Topic",
      required: [true, "L'ID du sujet est requis"],
    },
    subjectId: {
      type: Types.ObjectId,
      ref: "Subject",
      required: [true, "L'ID de la matière est requis"],
    },
    creatorId: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "L'ID du créateur est requis"],
    },
    series: {
      type: [String],
      trim: true,
      minlength: [1, "Les séries doivent avoir au moins 1 caractère"],
      default: [],
    },
    level: {
      type: String,
      enum: QUESTION_LEVELS,
      required: [true, "Le niveau d'éducation est requis"],
    },
    question: {
      type: String,
      required: [true, "La question est requise"],
      trim: true,
      maxlength: [2000, "La question ne peut pas dépasser 2000 caractères"],
    },
    format: {
      type: String,
      enum: QUESTION_TYPES,
      required: [true, "Le format de la question est requis"],
    },
    options: {
      type: [String],
      default: [],
      validate: {
        validator: function (options) {
          if ([QUESTION_TYPES[0], QUESTION_TYPES[3]].includes(this.format)) {
            // multiple_choice, true_false
            return options && options.length >= 2;
          }
          if (this.format === QUESTION_TYPES[5]) {
            // matching
            return options && options.length % 2 === 0;
          }
          return true;
        },
        message: "Options invalides pour le format de la question",
      },
    },
    correctAnswer: {
      type: Schema.Types.Mixed,
      required: [true, "La réponse correcte est requise"],
      validate: {
        validator: function (answer) {
          if (this.format === QUESTION_TYPES[3]) {
            // true_false
            return typeof answer === "boolean";
          }
          if (this.format === QUESTION_TYPES[0]) {
            // multiple_choice
            return this.options.includes(answer);
          }
          if (this.format === QUESTION_TYPES[5]) {
            // matching
            return (
              Array.isArray(answer) &&
              answer.every((pair) => pair.question && pair.answer)
            );
          }
          return true;
        },
        message: "Réponse correcte invalide pour le format de la question",
      },
    },
    explanation: {
      type: String,
      required: [true, "L'explication est requise"],
      trim: true,
      maxlength: [1500, "L'explication ne peut pas dépasser 1500 caractères"],
    },
    difficulty: {
      type: String,
      enum: EXERCISE_DIFFICULTY_LEVELS,
      required: [true, "La difficulté est requise"],
    },
    points: {
      type: Number,
      required: [true, "Les points sont requis"],
      min: [1, "Les points doivent être au moins 1"],
      max: [100, "Les points ne peuvent pas dépasser 100"],
    },
    timeEstimate: {
      type: Number, // in seconds
      min: [10, "L'estimation du temps doit être d'au moins 10 secondes"],
      max: [3600, "L'estimation du temps ne peut pas dépasser 1 heure"],
      default: 120,
    },
    // Supporting content
    steps: {
      type: [String],
      maxlength: [500, "Chaque étape ne peut pas dépasser 500 caractères"],
      default: [],
    },
    hints: {
      type: [String],
      maxlength: [500, "Chaque indice ne peut pas dépasser 500 caractères"],
      default: [],
    },
    tags: {
      type: [String],
      maxlength: [50, "Chaque tag ne peut pas dépasser 50 caractères"],
      default: [],
    },
    relatedQuestions: {
      type: [{ type: Types.ObjectId, ref: "Question" }],
      default: [],
    },
    // Analytics
    analytics: {
      totalAttempts: { type: Number, default: 0 },
      correctAttempts: { type: Number, default: 0 },
      averageTimeToAnswer: { type: Number, default: 0 },
      skipRate: { type: Number, default: 0 },
      difficultyRating: { type: Number, default: 0 },
    },
    // Content enhancements
    content: {
      media: {
        type: [MediaSchema],
        default: [],
      },
      formatting: {
        hasLatex: { type: Boolean, default: false },
        hasCode: { type: Boolean, default: false },
        hasTable: { type: Boolean, default: false },
      },
      accessibility: {
        hasAudioVersion: { type: Boolean, default: false },
        hasBrailleVersion: { type: Boolean, default: false },
        hasSignLanguageVideo: { type: Boolean, default: false },
        screenReaderFriendly: { type: Boolean, default: true },
      },
    },
    // Validation
    validation: {
      isVerified: { type: Boolean, default: false },
      verifiedBy: { type: Types.ObjectId, ref: "User" },
      verifiedAt: { type: Date },
      qualityScore: {
        type: Number,
        min: [0, "Le score de qualité ne peut pas être négatif"],
        max: [10, "Le score de qualité ne peut pas dépasser 10"],
      },
      feedback: {
        type: [String],
        maxlength: [500, "Chaque feedback ne peut pas dépasser 500 caractères"],
        default: [],
      },
    },
    // Usage
    usage: {
      assessmentCount: { type: Number, default: 0 },
      lastUsed: { type: Date },
      popularityScore: { type: Number, default: 0 },
    },
    // Metadata
    status: {
      type: String,
      enum: QUESTION_STATUSES,
      default: QUESTION_STATUSES[0], // draft
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
QuestionSchema.index({ subjectId: 1, topicId: 1, difficulty: 1 });
QuestionSchema.index({ format: 1, level: 1, status: 1 });
QuestionSchema.index({ creatorId: 1, status: 1 });
QuestionSchema.index({ tags: 1, isActive: 1 }, { sparse: true });
QuestionSchema.index({ series: 1, level: 1 });
QuestionSchema.index({ "analytics.totalAttempts": -1 });
QuestionSchema.index({ "usage.popularityScore": -1 }, { sparse: true });
QuestionSchema.index({ relatedQuestions: 1 }, { sparse: true });

// =============== MIDDLEWARE =============
/**
 * Pre-save middleware to validate referenced IDs.
 * @param {Function} next - Callback to proceed with save.
 */
QuestionSchema.pre("save", async function (next) {
  try {
    const [topic, subject, creator, verifiedBy, relatedQuestions] =
      await Promise.all([
        this.model("Topic").findById(this.topicId),
        this.model("Subject").findById(this.subjectId),
        this.model("User").findById(this.creatorId),
        this.validation.verifiedBy
          ? this.model("User").findById(this.validation.verifiedBy)
          : Promise.resolve(null),
        this.relatedQuestions.length > 0
          ? this.model("Question").find({ _id: { $in: this.relatedQuestions } })
          : Promise.resolve([]),
      ]);
    if (!topic) return next(new Error("ID de sujet invalide"));
    if (!subject) return next(new Error("ID de matière invalide"));
    if (!creator) return next(new Error("ID de créateur invalide"));
    if (this.validation.verifiedBy && !verifiedBy)
      return next(new Error("ID de vérificateur invalide"));
    if (relatedQuestions.length !== this.relatedQuestions.length) {
      return next(new Error("Un ou plusieurs ID de questions liées invalides"));
    }
    next();
  } catch (error) {
    next(error);
  }
});

// =============== VIRTUALS =============
/**
 * Virtual field for question success rate.
 * @returns {number} Percentage of correct attempts.
 */
QuestionSchema.virtual("successRate").get(function () {
  return (this.analytics?.totalAttempts ?? 0) === 0
    ? 0
    : (this.analytics.correctAttempts / this.analytics.totalAttempts) * 100;
});

/**
 * Virtual field for average time to answer in minutes.
 * @returns {number} Rounded average time in minutes.
 */
QuestionSchema.virtual("averageTimeMinutes").get(function () {
  return Math.round((this.analytics?.averageTimeToAnswer ?? 0) / 60);
});

/**
 * Virtual field to check if the question is multiple choice.
 * @returns {boolean} True if format is multiple_choice.
 */
QuestionSchema.virtual("isMultipleChoice").get(function () {
  return this.format === QUESTION_TYPES[0]; // multiple_choice
});

/**
 * Virtual field to check if the question is true/false.
 * @returns {boolean} True if format is true_false.
 */
QuestionSchema.virtual("isTrueFalse").get(function () {
  return this.format === QUESTION_TYPES[3]; // true_false
});

/**
 * Virtual field to check if the question has media.
 * @returns {boolean} True if media is present.
 */
QuestionSchema.virtual("hasMedia").get(function () {
  return (this.content?.media ?? []).length > 0;
});

// =============== METHODS =============
/**
 * Updates question analytics based on user response.
 * @param {boolean} isCorrect - Whether the answer was correct.
 * @param {number} timeSpent - Time spent answering in seconds.
 * @param {boolean} [wasSkipped=false] - Whether the question was skipped.
 * @returns {Promise<Document>} Updated question document.
 */
QuestionSchema.methods.updateAnalytics = function (
  isCorrect,
  timeSpent,
  wasSkipped = false
) {
  this.analytics.totalAttempts += 1;
  if (isCorrect) this.analytics.correctAttempts += 1;
  if (wasSkipped) {
    const currentSkips = Math.round(
      (this.analytics.skipRate * (this.analytics.totalAttempts - 1)) / 100
    );
    this.analytics.skipRate =
      ((currentSkips + 1) / this.analytics.totalAttempts) * 100;
  }
  if (timeSpent > 0) {
    const totalTime =
      this.analytics.averageTimeToAnswer * (this.analytics.totalAttempts - 1) +
      timeSpent;
    this.analytics.averageTimeToAnswer =
      totalTime / this.analytics.totalAttempts;
  }
  return this.save();
};

/**
 * Increments question usage metrics.
 * @returns {Promise<Document>} Updated question document.
 */
QuestionSchema.methods.incrementUsage = function () {
  this.usage.assessmentCount += 1;
  this.usage.lastUsed = new Date();
  this.usage.popularityScore =
    this.analytics.totalAttempts * 0.3 + this.usage.assessmentCount * 0.7;
  return this.save();
};

/**
 * Verifies the question and updates validation status.
 * @param {string} verifierId - ID of the verifier.
 * @param {number} qualityScore - Quality score (0-10).
 * @param {string[]} [feedback=[]] - Optional feedback comments.
 * @returns {Promise<Document>} Updated question document.
 */
QuestionSchema.methods.verify = function (
  verifierId,
  qualityScore,
  feedback = []
) {
  this.validation.isVerified = true;
  this.validation.verifiedBy = verifierId;
  this.validation.verifiedAt = new Date();
  this.validation.qualityScore = qualityScore;
  this.validation.feedback = feedback;
  this.status = qualityScore >= 7 ? QUESTION_STATUSES[2] : QUESTION_STATUSES[1]; // approved, review
  return this.save();
};

/**
 * Adds a related question if not already linked.
 * @param {string} questionId - ID of the related question.
 * @returns {Promise<Document>} Updated question document.
 */
QuestionSchema.methods.addRelatedQuestion = function (questionId) {
  if (!this.relatedQuestions.some((id) => id.equals(questionId))) {
    this.relatedQuestions.push(questionId);
    return this.save();
  }
  return Promise.resolve(this);
};

// =============== STATICS =============
/**
 * Finds questions by subject and topic with optional filters.
 * @param {string} subjectId - ID of the subject.
 * @param {string} topicId - ID of the topic.
 * @param {Object} [options={}] - Optional filters (difficulty, format, level, premiumOnly).
 * @returns {Promise<Document[]>} Array of question documents.
 */
QuestionSchema.statics.findBySubjectAndTopic = function (
  subjectId,
  topicId,
  options = {}
) {
  const query = {
    subjectId,
    topicId,
    isActive: true,
    status: QUESTION_STATUSES[2], // approved
  };
  if (options.difficulty) query.difficulty = options.difficulty;
  if (options.format) query.format = options.format;
  if (options.level) query.level = options.level;
  if (options.premiumOnly !== undefined)
    query.premiumOnly = options.premiumOnly;
  return this.find(query)
    .populate("topicId", "name")
    .populate("subjectId", "name code")
    .populate("creatorId", "name")
    .sort({ "usage.popularityScore": -1 })
    .lean();
};

/**
 * Finds questions for an assessment based on criteria.
 * @param {Object} criteria - Search criteria (subjectId, topicIds, difficulty, format, level, count, excludeIds, premiumOnly).
 * @returns {Promise<Document[]>} Array of question documents.
 */
QuestionSchema.statics.findForAssessment = function (criteria) {
  const {
    subjectId,
    topicIds = [],
    difficulty,
    format,
    level,
    count = 10,
    excludeIds = [],
    premiumOnly = false,
  } = criteria;
  const query = {
    subjectId,
    isActive: true,
    status: QUESTION_STATUSES[2], // approved
    _id: { $nin: excludeIds },
  };
  if (topicIds.length > 0) query.topicId = { $in: topicIds };
  if (difficulty) query.difficulty = difficulty;
  if (format) query.format = format;
  if (level) query.level = level;
  if (premiumOnly !== undefined) query.premiumOnly = premiumOnly;
  return this.find(query)
    .limit(count)
    .sort({ "usage.popularityScore": -1, createdAt: -1 })
    .lean();
};

/**
 * Finds similar questions to a given question.
 * @param {string} questionId - ID of the reference question.
 * @param {number} [limit=5] - Maximum number of questions to return.
 * @returns {Promise<Document[]>} Array of similar question documents.
 */
QuestionSchema.statics.findSimilar = function (questionId, limit = 5) {
  return this.findById(questionId).then((question) => {
    if (!question) return [];
    return this.find({
      _id: { $ne: questionId },
      subjectId: question.subjectId,
      topicId: question.topicId,
      difficulty: question.difficulty,
      format: question.format,
      isActive: true,
      status: QUESTION_STATUSES[2], // approved
    })
      .limit(limit)
      .populate("topicId", "name")
      .sort({ "usage.popularityScore": -1 })
      .lean();
  });
};

/**
 * Generates an analytics summary for questions based on filters.
 * @param {Object} [filters={}] - Optional filters (subjectId, topicId, difficulty, level).
 * @returns {Promise<Object[]>} Aggregated analytics summary.
 */
QuestionSchema.statics.getAnalyticsSummary = function (filters = {}) {
  const matchStage = { isActive: true };
  if (filters.subjectId)
    matchStage.subjectId = new Types.ObjectId(filters.subjectId);
  if (filters.topicId) matchStage.topicId = new Types.ObjectId(filters.topicId);
  if (filters.difficulty) matchStage.difficulty = filters.difficulty;
  if (filters.level) matchStage.level = filters.level;
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalQuestions: { $sum: 1 },
        averageSuccessRate: {
          $avg: {
            $cond: [
              { $eq: ["$analytics.totalAttempts", 0] },
              0,
              {
                $multiply: [
                  {
                    $divide: [
                      "$analytics.correctAttempts",
                      "$analytics.totalAttempts",
                    ],
                  },
                  100,
                ],
              },
            ],
          },
        },
        averageAttempts: { $avg: "$analytics.totalAttempts" },
        averageTimeToAnswer: { $avg: "$analytics.averageTimeToAnswer" },
        difficultyDistribution: { $push: "$difficulty" },
        formatDistribution: { $push: "$format" },
      },
    },
  ]);
};

/**
 * Question model for interacting with the Question collection.
 * @type {mongoose.Model}
 */
module.exports = {
  Question: model("Question", QuestionSchema),
};
