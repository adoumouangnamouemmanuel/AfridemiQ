const mongoose = require("mongoose");
const { Schema } = mongoose;

// Assessment Schema
const AssessmentSchema = new Schema(
  {
    format: {
      type: String,
      enum: ["quiz", "exam", "project", "practice", "mock"],
      required: true,
      default: "quiz",
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },
    topicIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Topic",
        index: true,
      },
    ],
    questionIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Question",
        required: true,
      },
    ],
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    passingScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    totalMarks: {
      type: Number,
      required: true,
      min: 1,
    },
    timeLimit: {
      type: Number, // in minutes
      min: 1,
      max: 480, // 8 hours max
    },
    attempts: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      default: 3,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard", "Mixed"],
      default: "Medium",
    },
    series: [String],
    level: {
      type: String,
      enum: ["Primary", "JSS", "SSS", "University", "Professional"],
      required: true,
    },
    feedback: {
      immediate: { type: Boolean, default: true },
      detailed: { type: Boolean, default: true },
      solutions: { type: Boolean, default: true },
      showCorrectAnswers: { type: Boolean, default: true },
    },
    settings: {
      shuffleQuestions: { type: Boolean, default: false },
      shuffleOptions: { type: Boolean, default: false },
      allowReview: { type: Boolean, default: true },
      showProgress: { type: Boolean, default: true },
      preventCheating: { type: Boolean, default: false },
    },
    scheduling: {
      startDate: Date,
      endDate: Date,
      timezone: { type: String, default: "Africa/Lagos" },
    },
    analytics: {
      totalAttempts: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
      passRate: { type: Number, default: 0 },
      averageTimeSpent: { type: Number, default: 0 },
    },
    tags: [String],
    status: {
      type: String,
      enum: ["draft", "published", "archived", "scheduled"],
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

// Indexes
AssessmentSchema.index({ format: 1, subjectId: 1 });
AssessmentSchema.index({ creatorId: 1, status: 1 });
AssessmentSchema.index({ level: 1, difficulty: 1 });
AssessmentSchema.index({ "scheduling.startDate": 1, "scheduling.endDate": 1 });
AssessmentSchema.index({ tags: 1 });
AssessmentSchema.index({ premiumOnly: 1, isActive: 1 });

// Virtual fields
AssessmentSchema.virtual("questionCount").get(function () {
  return this.questionIds ? this.questionIds.length : 0;
});

AssessmentSchema.virtual("estimatedDuration").get(function () {
  if (this.timeLimit) return this.timeLimit;
  // Estimate 2 minutes per question if no time limit set
  return this.questionCount * 2;
});

AssessmentSchema.virtual("isScheduled").get(function () {
  return (
    this.scheduling && this.scheduling.startDate && this.scheduling.endDate
  );
});

AssessmentSchema.virtual("isActive").get(function () {
  if (!this.isScheduled) return this.status === "published";
  const now = new Date();
  return (
    this.status === "published" &&
    this.scheduling.startDate <= now &&
    this.scheduling.endDate >= now
  );
});

// Methods
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

AssessmentSchema.methods.canUserAttempt = function (userAttempts) {
  return userAttempts < this.attempts;
};

// Static methods
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

AssessmentSchema.statics.findPublished = function (filters = {}) {
  const query = { status: "published", isActive: true };

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

module.exports = {
  Assessment: mongoose.model("Assessment", AssessmentSchema),
};
