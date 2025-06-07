const mongoose = require("mongoose");
const { Schema } = mongoose;
const {
  DIFFICULTY_LEVELS,
} = require("../../models/learning/adaptive.learning.model");

const HintUsageSchema = new Schema(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    quizId: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      index: true,
    },
    series: [{ type: String, trim: true, minlength: 1 }],
    sessionId: {
      type: String,
      index: true,
      match: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, // UUID format
    },
    usedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    stepsViewed: {
      type: [Number],
      default: [],
      validate: {
        validator: (v) => v.every((step) => step >= 0),
        message: "Step numbers must be non-negative",
      },
    },
    totalStepsAvailable: {
      type: Number,
      min: 1,
    },
    hintType: {
      type: String,
      enum: ["step", "explanation", "formula", "example"],
      default: "step",
    },
    pointsDeducted: {
      type: Number,
      default: 0,
      min: 0,
    },
    timeSpentOnHint: {
      type: Number, // in seconds
      default: 0,
      min: 0,
    },
    deviceInfo: {
      platform: { type: String, trim: true },
      browser: { type: String, trim: true },
      screenSize: { type: String, trim: true },
    },
    context: {
      attemptNumber: {
        type: Number,
        default: 1,
        min: 1,
      },
      timeBeforeHint: { type: Number, min: 0 },
      previousAnswers: {
        type: [Schema.Types.Mixed],
        default: [],
        validate: [(v) => v.length <= 10, "Too many previous answers"],
      },
      difficulty: {
        type: String,
        enum: DIFFICULTY_LEVELS,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
HintUsageSchema.index({ userId: 1, questionId: 1 });
HintUsageSchema.index({ userId: 1, usedAt: -1 });
HintUsageSchema.index({ questionId: 1, usedAt: -1 });
HintUsageSchema.index({ quizId: 1, userId: 1 });
HintUsageSchema.index({ hintType: 1 });

// Pre-save middleware
HintUsageSchema.pre("save", async function (next) {
  try {
    if (this.stepsViewed && this.stepsViewed.length > 0) {
      this.stepsViewed = [...new Set(this.stepsViewed)].sort((a, b) => a - b);
    }
    const [question, user, quiz] = await Promise.all([
      mongoose.model("Question").findById(this.questionId),
      mongoose.model("User").findById(this.userId),
      this.quizId
        ? mongoose.model("Quiz").findById(this.quizId)
        : Promise.resolve(null),
    ]);
    if (!question) return next(new Error("Identifiant de question invalide"));
    if (!user) return next(new Error("Identifiant d'utilisateur invalide"));
    if (this.quizId && !quiz)
      return next(new Error("Identifiant de quiz invalide"));
    if (
      this.totalStepsAvailable &&
      this.stepsViewed.some((step) => step >= this.totalStepsAvailable)
    ) {
      return next(new Error("Numéro d'étape dépasse totalStepsAvailable"));
    }
    next();
  } catch (error) {
    next(error);
  }
});

HintUsageSchema.virtual("completionPercentage").get(function () {
  if (!this.totalStepsAvailable || this.totalStepsAvailable === 0) return 0;
  return Math.round((this.stepsViewed.length / this.totalStepsAvailable) * 100);
});

HintUsageSchema.virtual("wasHelpful").get(async function () {
  const quizResult = await mongoose.model("QuizResult").findOne({
    userId: this.userId,
    quizId: this.quizId,
    questionIds: this.questionId,
    completedAt: { $gte: this.usedAt },
  });
  return quizResult && quizResult.correctCount > 0;
});

HintUsageSchema.methods.addViewedStep = function (stepNumber) {
  if (!this.stepsViewed.includes(stepNumber)) {
    this.stepsViewed.push(stepNumber);
    this.stepsViewed.sort((a, b) => a - b);
  }
  return this.stepsViewed;
};

HintUsageSchema.methods.hasViewedAllSteps = function () {
  return (
    this.totalStepsAvailable &&
    this.stepsViewed.length >= this.totalStepsAvailable
  );
};

HintUsageSchema.statics.getQuestionHintStats = function (questionId) {
  return this.aggregate([
    { $match: { questionId: new mongoose.Types.ObjectId(questionId) } },
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

HintUsageSchema.statics.getUserHintPattern = function (userId, limit = 50) {
  return this.find({ userId })
    .populate("questionId", "question difficulty")
    .populate("quizId", "title")
    .sort({ usedAt: -1 })
    .limit(limit)
    .lean();
};

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

module.exports = {
  HintUsage: mongoose.model("HintUsage", HintUsageSchema),
};