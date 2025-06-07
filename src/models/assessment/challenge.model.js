const mongoose = require("mongoose");
const { Schema } = mongoose;

const ChallengeSchema = new Schema(
  {
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
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },
    topicId: {
      type: Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
      index: true,
    },
    level: {
      type: String,
      enum: ["Primary", "JSS", "SSS", "University", "Professional"],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    series: [String],
    questionIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Question",
        required: true,
      },
    ],
    timeLimit: {
      type: Number,
      required: true,
      min: 1,
      max: 480, // 8 hours max
    },
    maxParticipants: {
      type: Number,
      min: 2,
      max: 1000,
      default: 100,
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    winners: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        rank: { type: Number, min: 1 },
        score: { type: Number, min: 0 },
        timeSpent: { type: Number, min: 0 },
        completedAt: { type: Date, default: Date.now },
      },
    ],
    prizes: [
      {
        rank: { type: Number, min: 1 },
        description: String,
        points: { type: Number, min: 0 },
        badge: String,
      },
    ],
    rules: {
      allowMultipleAttempts: { type: Boolean, default: false },
      showLeaderboard: { type: Boolean, default: true },
      shuffleQuestions: { type: Boolean, default: true },
      preventCheating: { type: Boolean, default: true },
    },
    scheduling: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      timezone: { type: String, default: "Africa/Lagos" },
      registrationDeadline: Date,
    },
    analytics: {
      totalParticipants: { type: Number, default: 0 },
      completionRate: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
      averageTimeSpent: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ["draft", "open", "active", "completed", "cancelled"],
      default: "draft",
    },
    tags: [String],
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
ChallengeSchema.index({ creatorId: 1, status: 1 });
ChallengeSchema.index({ subjectId: 1, topicId: 1 });
ChallengeSchema.index({ level: 1, difficulty: 1 });
ChallengeSchema.index({ "scheduling.startDate": 1, "scheduling.endDate": 1 });
ChallengeSchema.index({ status: 1, isActive: 1 });
ChallengeSchema.index({ tags: 1 });

// Virtual fields
ChallengeSchema.virtual("participantCount").get(function () {
  return this.participants ? this.participants.length : 0;
});

ChallengeSchema.virtual("questionCount").get(function () {
  return this.questionIds ? this.questionIds.length : 0;
});

ChallengeSchema.virtual("isRegistrationOpen").get(function () {
  const now = new Date();
  const deadline =
    this.scheduling.registrationDeadline || this.scheduling.startDate;
  return this.status === "open" && now < deadline;
});

ChallengeSchema.virtual("isCurrentlyActive").get(function () {
  const now = new Date();
  return (
    this.status === "active" &&
    this.scheduling.startDate <= now &&
    this.scheduling.endDate >= now
  );
});

ChallengeSchema.virtual("isCompleted").get(function () {
  return (
    this.status === "completed" ||
    (new Date() > this.scheduling.endDate && this.status === "active")
  );
});

// Methods
ChallengeSchema.methods.canUserJoin = function (userId) {
  if (this.status !== "open") return false;
  if (this.participants.includes(userId)) return false;
  if (this.participants.length >= this.maxParticipants) return false;

  const now = new Date();
  const deadline =
    this.scheduling.registrationDeadline || this.scheduling.startDate;
  return now < deadline;
};

ChallengeSchema.methods.addParticipant = function (userId) {
  if (!this.canUserJoin(userId)) {
    throw new Error("User cannot join this challenge");
  }

  this.participants.push(userId);
  this.analytics.totalParticipants = this.participants.length;
  return this.save();
};

ChallengeSchema.methods.removeParticipant = function (userId) {
  this.participants = this.participants.filter((id) => !id.equals(userId));
  this.analytics.totalParticipants = this.participants.length;
  return this.save();
};

ChallengeSchema.methods.addWinner = function (winnerData) {
  this.winners.push(winnerData);
  this.winners.sort((a, b) => b.score - a.score || a.timeSpent - b.timeSpent);

  // Update ranks
  this.winners.forEach((winner, index) => {
    winner.rank = index + 1;
  });

  return this.save();
};

ChallengeSchema.methods.updateAnalytics = function () {
  if (this.winners.length > 0) {
    const totalScore = this.winners.reduce((sum, w) => sum + w.score, 0);
    const totalTime = this.winners.reduce((sum, w) => sum + w.timeSpent, 0);

    this.analytics.averageScore = totalScore / this.winners.length;
    this.analytics.averageTimeSpent = totalTime / this.winners.length;
    this.analytics.completionRate =
      (this.winners.length / this.analytics.totalParticipants) * 100;
  }

  return this.save();
};

// Static methods
ChallengeSchema.statics.findActive = function () {
  const now = new Date();
  return this.find({
    status: "active",
    isActive: true,
    "scheduling.startDate": { $lte: now },
    "scheduling.endDate": { $gte: now },
  })
    .populate("creatorId", "name")
    .populate("subjectId", "name code")
    .populate("topicId", "name");
};

ChallengeSchema.statics.findOpen = function () {
  const now = new Date();
  return this.find({
    status: "open",
    isActive: true,
    $or: [
      { "scheduling.registrationDeadline": { $gte: now } },
      {
        "scheduling.registrationDeadline": { $exists: false },
        "scheduling.startDate": { $gte: now },
      },
    ],
  })
    .populate("creatorId", "name")
    .populate("subjectId", "name code")
    .populate("topicId", "name");
};

ChallengeSchema.statics.findBySubject = function (subjectId) {
  return this.find({
    subjectId,
    isActive: true,
    status: { $in: ["open", "active"] },
  })
    .populate("creatorId", "name")
    .populate("topicId", "name")
    .sort({ "scheduling.startDate": 1 });
};

module.exports = {
  Challenge: mongoose.model("Challenge", ChallengeSchema),
};