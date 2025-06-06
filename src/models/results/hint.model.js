const mongoose = require("mongoose");
const { Schema } = mongoose;

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
    sessionId: {
      type: String,
      index: true,
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
      platform: String,
      browser: String,
      screenSize: String,
    },
    context: {
      attemptNumber: {
        type: Number,
        default: 1,
        min: 1,
      },
      timeBeforeHint: Number, // seconds spent before requesting hint
      previousAnswers: [Schema.Types.Mixed], // previous incorrect attempts
      difficulty: {
        type: String,
        enum: ["Easy", "Medium", "Hard"],
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for better query performance
HintUsageSchema.index({ userId: 1, questionId: 1 });
HintUsageSchema.index({ userId: 1, usedAt: -1 });
HintUsageSchema.index({ questionId: 1, usedAt: -1 });
HintUsageSchema.index({ quizId: 1, userId: 1 });

// Virtual for steps completion percentage
HintUsageSchema.virtual("completionPercentage").get(function () {
  if (!this.totalStepsAvailable || this.totalStepsAvailable === 0) return 0;
  return Math.round((this.stepsViewed.length / this.totalStepsAvailable) * 100);
});

// Virtual for hint effectiveness (based on subsequent performance)
HintUsageSchema.virtual("wasHelpful").get(() => {
  // This would be calculated based on whether user got the question right after hint
  // Implementation would depend on linking with quiz results
  return null; // To be calculated by service layer
});

// Pre-save middleware to validate steps
HintUsageSchema.pre("save", function (next) {
  // Remove duplicate steps and sort
  if (this.stepsViewed && this.stepsViewed.length > 0) {
    this.stepsViewed = [...new Set(this.stepsViewed)].sort((a, b) => a - b);
  }
  next();
});

// Method to add a viewed step
HintUsageSchema.methods.addViewedStep = function (stepNumber) {
  if (!this.stepsViewed.includes(stepNumber)) {
    this.stepsViewed.push(stepNumber);
    this.stepsViewed.sort((a, b) => a - b);
  }
  return this.stepsViewed;
};

// Method to check if all steps viewed
HintUsageSchema.methods.hasViewedAllSteps = function () {
  return (
    this.totalStepsAvailable &&
    this.stepsViewed.length >= this.totalStepsAvailable
  );
};

// Static method to get hint usage statistics for a question
HintUsageSchema.statics.getQuestionHintStats = function (questionId) {
  return this.aggregate([
    { $match: { questionId: mongoose.Types.ObjectId(questionId) } },
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

// Static method to get user's hint usage pattern
HintUsageSchema.statics.getUserHintPattern = function (userId, limit = 50) {
  return this.find({ userId })
    .populate("questionId", "question difficulty")
    .populate("quizId", "title")
    .sort({ usedAt: -1 })
    .limit(limit);
};

// Static method to find questions that need better hints
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
        totalUsages: { $gte: 10 }, // Questions with at least 10 hint usages
        averageStepsViewed: { $gte: 3 }, // Users viewing many steps
        averageTimeSpent: { $gte: 120 }, // Users spending more than 2 minutes on hints
      },
    },
    { $sort: { totalUsages: -1 } },
  ]);
};

module.exports = {
  HintUsage: mongoose.model("HintUsage", HintUsageSchema),
};