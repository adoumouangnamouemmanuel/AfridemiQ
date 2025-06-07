const mongoose = require("mongoose");
const { Schema } = mongoose;

// Shared constants
const QUESTION_TYPES = [
  "multiple_choice",
  "short_answer",
  "essay",
  "true_false",
  "fill_blank",
  "matching",
];
const MEDIA_TYPES = ["image", "audio", "video", "document"];
const DIFFICULTY_LEVELS = ["Easy", "Medium", "Hard"];

const QuestionSchema = new Schema(
  {
    topicId: {
      type: Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
      index: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    series: [String],
    level: {
      type: String,
      enum: ["Primary", "JSS", "SSS", "University", "Professional"],
      required: true,
      index: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    format: {
      type: String,
      enum: QUESTION_TYPES,
      required: true,
      index: true,
    },
    options: {
      type: [String],
      validate: {
        validator: function (options) {
          if (["multiple_choice", "true_false"].includes(this.format)) {
            return options && options.length >= 2;
          }
          return true;
        },
        message:
          "Multiple choice and true/false questions must have at least 2 options",
      },
    },
    correctAnswer: {
      type: Schema.Types.Mixed,
      required: true,
    },
    explanation: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1500,
    },
    difficulty: {
      type: String,
      enum: DIFFICULTY_LEVELS,
      required: true,
      index: true,
    },
    points: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },
    timeEstimate: {
      type: Number, // in seconds
      min: 10,
      max: 3600, // 1 hour max
      default: 120, // 2 minutes default
    },
    steps: [String], // Solution steps
    hints: [String], // Hints for students
    tags: {
      type: [String],
      index: true,
    },
    relatedQuestions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
    analytics: {
      totalAttempts: { type: Number, default: 0 },
      correctAttempts: { type: Number, default: 0 },
      averageTimeToAnswer: { type: Number, default: 0 },
      skipRate: { type: Number, default: 0 },
      difficultyRating: { type: Number, default: 0 }, // User-rated difficulty
    },
    content: {
      media: [
        {
          mediaType: {
            type: String,
            enum: MEDIA_TYPES,
          },
          url: {
            type: String,
            match: /^https?:\/\/.+/,
          },
          altText: String,
          caption: String,
          size: Number, // file size in bytes
          duration: Number, // for audio/video in seconds
        },
      ],
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
    validation: {
      isVerified: { type: Boolean, default: false },
      verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
      verifiedAt: Date,
      qualityScore: { type: Number, min: 0, max: 10 },
      feedback: [String],
    },
    usage: {
      assessmentCount: { type: Number, default: 0 },
      lastUsed: Date,
      popularityScore: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ["draft", "review", "approved", "rejected", "archived"],
      default: "draft",
    },
    premiumOnly: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for better query performance
QuestionSchema.index({ subjectId: 1, topicId: 1, difficulty: 1 });
QuestionSchema.index({ format: 1, level: 1, status: 1 });
QuestionSchema.index({ creatorId: 1, status: 1 });
QuestionSchema.index({ tags: 1, isActive: 1 });
QuestionSchema.index({ series: 1, level: 1 });
QuestionSchema.index({ "analytics.totalAttempts": -1 });
QuestionSchema.index({ "usage.popularityScore": -1 });

// Virtual fields
QuestionSchema.virtual("successRate").get(function () {
  if (this.analytics.totalAttempts === 0) return 0;
  return (this.analytics.correctAttempts / this.analytics.totalAttempts) * 100;
});

QuestionSchema.virtual("averageTimeMinutes").get(function () {
  return Math.round(this.analytics.averageTimeToAnswer / 60);
});

QuestionSchema.virtual("isMultipleChoice").get(function () {
  return this.format === "multiple_choice";
});

QuestionSchema.virtual("isTrueFalse").get(function () {
  return this.format === "true_false";
});

QuestionSchema.virtual("hasMedia").get(function () {
  return this.content.media && this.content.media.length > 0;
});

// Methods
QuestionSchema.methods.updateAnalytics = function (
  isCorrect,
  timeSpent,
  wasSkipped = false
) {
  this.analytics.totalAttempts += 1;

  if (isCorrect) {
    this.analytics.correctAttempts += 1;
  }

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

QuestionSchema.methods.incrementUsage = function () {
  this.usage.assessmentCount += 1;
  this.usage.lastUsed = new Date();
  this.usage.popularityScore =
    this.analytics.totalAttempts * 0.3 + this.usage.assessmentCount * 0.7;

  return this.save();
};

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
  this.status = qualityScore >= 7 ? "approved" : "review";

  return this.save();
};

QuestionSchema.methods.addRelatedQuestion = function (questionId) {
  if (!this.relatedQuestions.includes(questionId)) {
    this.relatedQuestions.push(questionId);
    return this.save();
  }
  return Promise.resolve(this);
};

// Static methods
QuestionSchema.statics.findBySubjectAndTopic = function (
  subjectId,
  topicId,
  options = {}
) {
  const query = { subjectId, topicId, isActive: true, status: "approved" };

  if (options.difficulty) query.difficulty = options.difficulty;
  if (options.format) query.format = options.format;
  if (options.level) query.level = options.level;
  if (options.premiumOnly !== undefined)
    query.premiumOnly = options.premiumOnly;

  return this.find(query)
    .populate("topicId", "name")
    .populate("subjectId", "name code")
    .populate("creatorId", "name")
    .sort({ "usage.popularityScore": -1 });
};

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
    status: "approved",
    _id: { $nin: excludeIds },
  };

  if (topicIds.length > 0) query.topicId = { $in: topicIds };
  if (difficulty) query.difficulty = difficulty;
  if (format) query.format = format;
  if (level) query.level = level;
  if (premiumOnly !== undefined) query.premiumOnly = premiumOnly;

  return this.find(query)
    .limit(count)
    .sort({ "usage.popularityScore": -1, createdAt: -1 });
};

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
      status: "approved",
    })
      .limit(limit)
      .populate("topicId", "name")
      .sort({ "usage.popularityScore": -1 });
  });
};

QuestionSchema.statics.getAnalyticsSummary = function (filters = {}) {
  const matchStage = { isActive: true };

  if (filters.subjectId)
    matchStage.subjectId = new mongoose.Types.ObjectId(filters.subjectId);
  if (filters.topicId)
    matchStage.topicId = new mongoose.Types.ObjectId(filters.topicId);
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
        difficultyDistribution: {
          $push: "$difficulty",
        },
        formatDistribution: {
          $push: "$format",
        },
      },
    },
  ]);
};

module.exports = {
  Question: mongoose.model("Question", QuestionSchema),
  QUESTION_TYPES,
  MEDIA_TYPES,
  DIFFICULTY_LEVELS,
};