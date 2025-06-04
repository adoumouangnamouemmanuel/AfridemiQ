const mongoose = require("mongoose");
const { Schema } = mongoose;

// Shared constants
const USER_ROLES = ["student", "teacher", "admin"];

// User Schema
const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phoneNumber: {
      type: String,
      validate: {
        validator: function (v) {
          return v ? /^\+?[1-9]\d{1,14}$/.test(v) : true;
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
      unique: true,
      sparse: true,
    },
    isPhoneVerified: { type: Boolean, default: false },
    phoneVerificationCode: String,
    phoneVerificationExpires: Date,
    avatar: String,
    country: { type: String, required: true }, // Required for consistency with Country model
    timeZone: String,
    preferredLanguage: String,
    schoolName: String,
    gradeLevel: String,
    parentEmail: String,
    role: { type: String, enum: USER_ROLES, default: "student" },
    createdAt: { type: Date, default: Date.now },
    lastLogin: Date,
    isPremium: { type: Boolean, default: false },
    subscription: {
      type: { type: String, enum: ["free", "premium"], required: true },
      startDate: { type: Date, required: true },
      expiresAt: Date,
      paymentStatus: {
        type: String,
        enum: ["active", "pending", "failed"],
        required: true,
      },
      trialPeriod: {
        startDate: Date,
        endDate: Date,
      },
      features: [String],
      accessLevel: { type: String, enum: ["basic", "premium"], required: true },
    },
    preferences: {
      notifications: {
        general: { type: Boolean, default: true },
        dailyReminderTime: String,
        challengeNotifications: { type: Boolean, default: false },
        progressUpdates: { type: Boolean, default: true },
      },
      darkMode: { type: Boolean, default: false },
      fontSize: {
        type: String,
        enum: ["small", "medium", "large"],
        default: "medium",
      },
      preferredContentFormat: {
        type: String,
        enum: ["video", "text", "audio", "mixed"],
        default: "text",
      },
      enableHints: { type: Boolean, default: true },
      autoPlayAudio: { type: Boolean, default: false },
      showStepSolutions: { type: Boolean, default: true },
      leaderboardVisibility: { type: Boolean, default: true },
      allowFriendRequests: { type: Boolean, default: true },
      multilingualSupport: [String],
    },
    settings: {
      learningStyle: {
        type: String,
        enum: ["visual", "auditory", "kinesthetic", "mixed"],
      },
      motivation: String,
      preferredStudySessionLength: Number,
    },
    progress: {
      selectedExam: String,
      selectedSeries: String,
      selectedLevel: String,
      xp: { type: Number, default: 0 },
      level: { type: Number, default: 1 },
      streak: {
        current: { type: Number, default: 0 },
        longest: { type: Number, default: 0 },
        lastStudyDate: Date,
      },
      goalDate: Date,
      totalQuizzes: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
      completedTopics: [String],
      weakSubjects: [String],
      badges: [String],
      achievements: [String],
      progressSummary: {
        completedPercentage: Number,
        remainingTopics: Number,
      },
    },
    analyticsId: { type: Schema.Types.ObjectId, ref: "UserAnalytics" },
    notes: [{ type: Schema.Types.ObjectId, ref: "Note" }],
    hintsUsed: [{ type: Schema.Types.ObjectId, ref: "HintUsage" }],
    bookmarks: [{ type: Schema.Types.ObjectId, ref: "Bookmark" }],
    friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
    tutorId: { type: Schema.Types.ObjectId, ref: "PeerTutorProfile" },
    socialProfile: {
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      bio: String,
      publicAchievements: [String],
      visibility: {
        type: String,
        enum: ["public", "friends", "private"],
        default: "public",
      },
      socialLinks: [{ platform: String, url: String }],
    },
    onboardingStatusId: {
      type: Schema.Types.ObjectId,
      ref: "OnboardingStatus",
    },
  },
  { timestamps: true }
);

// Virtual for fullName
UserSchema.virtual("fullName").get(function () {
  return this.name;
});

// Model
module.exports = {
  User: mongoose.model("User", UserSchema),
};
