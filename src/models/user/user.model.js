const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { Schema } = mongoose;

// Shared constants
const USER_ROLES = ["student", "teacher", "admin"];

// User Schema
const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Le nom est requis"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "L'email est requis"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Veuillez fournir un email valide",
      ],
    },
    password: {
      type: String,
      required: [true, "Le mot de passe est requis"],
      minlength: [8, "Le mot de passe doit contenir au moins 8 caractères"],
    },
    phoneNumber: {
      type: String,
      validate: {
        validator: (v) => (v ? /^\+?[1-9]\d{1,14}$/.test(v) : true),
        message: (props) =>
          `${props.value} n'est pas un numéro de téléphone valide!`,
      },
      unique: true,
      sparse: true,
      index: true,
    },
    isPhoneVerified: { type: Boolean, default: false },
    phoneVerificationCode: String,
    phoneVerificationExpires: Date,
    avatar: String,
    country: { type: String, required: [true, "Le pays est requis"] },
    timeZone: String,
    preferredLanguage: String,
    schoolName: String,
    gradeLevel: String,
    parentEmail: {
      type: String,
      validate: {
        validator: (v) =>
          !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v),
        message: (props) => `${props.value} n'est pas un email valide!`,
      },
    },
    role: {
      type: String,
      enum: {
        values: USER_ROLES,
        message: "{VALUE} n'est pas un rôle valide",
      },
      default: "student",
    },
    lastLogin: Date,
    isPremium: { type: Boolean, default: false },
    subscription: {
      type: {
        type: String,
        enum: ["free", "premium"],
        required: true,
        default: "free",
      },
      startDate: { type: Date, required: true, default: Date.now },
      expiresAt: Date,
      paymentStatus: {
        type: String,
        enum: ["active", "pending", "failed"],
        required: true,
        default: "active",
      },
      trialPeriod: {
        startDate: Date,
        endDate: Date,
      },
      features: [String],
      accessLevel: {
        type: String,
        enum: ["basic", "premium"],
        required: true,
        default: "basic",
      },
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
        default: "mixed",
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
    analyticsId: {
      type: Schema.Types.ObjectId,
      ref: "UserAnalytics",
      default: null,
    },
    notes: [{ type: Schema.Types.ObjectId, ref: "Note", default: [] }],
    hintsUsed: [{ type: Schema.Types.ObjectId, ref: "HintUsage", default: [] }],
    bookmarks: [{ type: Schema.Types.ObjectId, ref: "Bookmark", default: [] }],
    friends: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    tutorId: {
      type: Schema.Types.ObjectId,
      ref: "PeerTutorProfile",
      default: null,
    },
    socialProfile: {
      bio: String,
      publicAchievements: [String],
      visibility: {
        type: String,
        enum: ["public", "friends", "private"],
        default: "public",
      },
      socialLinks: [
        {
          platform: String,
          url: {
            type: String,
            validate: {
              validator: (v) =>
                !v ||
                /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(
                  v
                ),
              message: (props) => `${props.value} n'est pas une URL valide!`,
            },
          },
        },
      ],
    },
    onboardingStatusId: {
      type: Schema.Types.ObjectId,
      ref: "OnboardingStatus",
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    refreshToken: String,
    tokenVersion: {
      type: Number,
      default: 0, // Increment this when user changes password or logs out
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add indexes for frequently queried fields
UserSchema.index({ "progress.xp": -1 }); // For leaderboards
UserSchema.index({ lastLogin: -1 }); // For active users
UserSchema.index({ createdAt: -1 }); // For new users

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    try {
      this.password = await bcrypt.hash(this.password, 10);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Virtual for fullName
UserSchema.virtual("fullName").get(function () {
  return this.name;
});

// Exclude sensitive fields from JSON output
UserSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.phoneVerificationCode;
    delete ret.phoneVerificationExpires;
    delete ret.resetPasswordToken;
    delete ret.resetPasswordExpires;
    delete ret.refreshToken;
    delete ret.tokenVersion;
    return ret;
  },
});

module.exports = {
  User: mongoose.model("User", UserSchema),
  USER_ROLES,
};
