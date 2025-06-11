const { Schema, model, Types } = require("mongoose");
const bcrypt = require("bcryptjs");
const {
  USER_ROLES,
  SUBSCRIPTION_TYPES,
  PAYMENT_STATUSES,
  ACCESS_LEVELS,
  FONT_SIZES,
  CONTENT_FORMATS,
  LEARNING_STYLES,
  PROFILE_VISIBILITIES,
} = require("../../constants");

// =============== CONSTANTS =============
/**
 * Imported constants for user roles, subscriptions, and preferences.
 * @see module:constants/index
 */

// =============== SUBSCHEMAS =============
/**
 * Subschema for subscription trial period.
 * @module TrialPeriodSubSchema
 */
const TrialPeriodSchema = new Schema({
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
});

/**
 * Subschema for social links in user profile.
 * @module SocialLinkSubSchema
 */
const SocialLinkSchema = new Schema({
  platform: {
    type: String,
  },
  url: {
    type: String,
    validate: {
      validator: (v) =>
        !v ||
        /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(v),
      message: (props) => `${props.value} n'est pas une URL valide!`,
    },
  },
});

// ==================== SCHEMA ==================
/**
 * Mongoose schema for users, managing authentication and preferences.
 * @module UserSchema
 */
const UserSchema = new Schema(
  {
    // User details
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
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerificationCode: {
      type: String,
    },
    phoneVerificationExpires: {
      type: Date,
    },
    avatar: {
      type: String,
    },
    // Location and preferences
    country: {
      type: String,
    },
    timeZone: {
      type: String,
    },
    preferredLanguage: {
      type: String,
    },
    // Education details
    schoolName: {
      type: String,
    },
    gradeLevel: {
      type: String,
    },
    parentEmail: {
      type: String,
      validate: {
        validator: (v) =>
          !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v),
        message: (props) => `${props.value} n'est pas un email valide!`,
      },
    },
    // User role and status
    role: {
      type: String,
      enum: {
        values: USER_ROLES,
        message: "{VALUE} n'est pas un rôle valide",
      },
      default: USER_ROLES[0], // student
    },
    lastLogin: {
      type: Date,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    // Subscription details
    subscription: {
      type: {
        type: String,
        enum: SUBSCRIPTION_TYPES,
        required: [true, "Le type d'abonnement est requis"],
        default: SUBSCRIPTION_TYPES[0], // free
      },
      startDate: {
        type: Date,
        required: [true, "La date de début de l'abonnement est requise"],
        default: Date.now,
      },
      expiresAt: {
        type: Date,
      },
      paymentStatus: {
        type: String,
        enum: PAYMENT_STATUSES,
        required: [true, "Le statut de paiement est requis"],
        default: PAYMENT_STATUSES[0], // active
      },
      trialPeriod: {
        type: TrialPeriodSchema,
      },
      features: {
        type: [String],
        default: [],
      },
      accessLevel: {
        type: String,
        enum: ACCESS_LEVELS,
        required: [true, "Le niveau d'accès est requis"],
        default: ACCESS_LEVELS[0], // basic
      },
    },
    // User preferences
    preferences: {
      notifications: {
        general: { type: Boolean, default: true },
        dailyReminderTime: { type: String },
        challengeNotifications: { type: Boolean, default: false },
        progressUpdates: { type: Boolean, default: true },
      },
      darkMode: { type: Boolean, default: false },
      fontSize: {
        type: String,
        enum: FONT_SIZES,
        default: FONT_SIZES[1], // medium
      },
      preferredContentFormat: {
        type: String,
        enum: CONTENT_FORMATS,
        default: CONTENT_FORMATS[1], // text
      },
      enableHints: { type: Boolean, default: true },
      autoPlayAudio: { type: Boolean, default: false },
      showStepSolutions: { type: Boolean, default: true },
      leaderboardVisibility: { type: Boolean, default: true },
      allowFriendRequests: { type: Boolean, default: true },
      multilingualSupport: { type: [String], default: [] },
    },
    // Learning settings
    settings: {
      learningStyle: {
        type: String,
        enum: LEARNING_STYLES,
        default: LEARNING_STYLES[3], // mixed
      },
      motivation: { type: String },
      preferredStudySessionLength: { type: Number },
    },
    // User progress
    progress: {
      selectedExam: { type: String },
      selectedSeries: { type: String },
      selectedLevel: { type: String },
      xp: { type: Number, default: 0 },
      level: { type: Number, default: 1 },
      streak: {
        current: { type: Number, default: 0 },
        longest: { type: Number, default: 0 },
        lastStudyDate: { type: Date },
      },
      goalDate: { type: Date },
      totalQuizzes: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
      completedTopics: { type: [String], default: [] },
      weakSubjects: { type: [String], default: [] },
      badges: { type: [String], default: [] },
      achievements: { type: [String], default: [] },
      progressSummary: {
        completedPercentage: { type: Number },
        remainingTopics: { type: Number },
      },
    },
    // References to other collections
    analyticsId: {
      type: Types.ObjectId,
      ref: "UserAnalytics",
      default: null,
    },
    notes: {
      type: [{ type: Types.ObjectId, ref: "Note" }],
      default: [],
    },
    hintsUsed: {
      type: [{ type: Types.ObjectId, ref: "HintUsage" }],
      default: [],
    },
    bookmarks: {
      type: [{ type: Types.ObjectId, ref: "Bookmark" }],
      default: [],
    },
    friends: {
      type: [{ type: Types.ObjectId, ref: "User" }],
      default: [],
    },
    blockedUsers: {
      type: [{ type: Types.ObjectId, ref: "User" }],
      default: [],
    },
    tutorId: {
      type: Types.ObjectId,
      ref: "PeerTutorProfile",
      default: null,
    },
    // Social profile
    socialProfile: {
      bio: { type: String },
      publicAchievements: { type: [String], default: [] },
      visibility: {
        type: String,
        enum: PROFILE_VISIBILITIES,
        default: PROFILE_VISIBILITIES[0], // public
      },
      socialLinks: {
        type: [SocialLinkSchema],
        default: [],
      },
    },
    // Authentication tokens
    onboardingStatusId: {
      type: Types.ObjectId,
      ref: "OnboardingStatus",
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    refreshToken: {
      type: String,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// =============== INDEXES =================
UserSchema.index({ "progress.xp": -1 });
UserSchema.index({ lastLogin: -1 });
UserSchema.index({ createdAt: -1 });

// =============== MIDDLEWARE =============
/**
 * Pre-save middleware to hash password.
 * @param {Function} next - Callback to proceed with save.
 */
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

// =============== METHODS =============
/**
 * Compare candidate password with stored hash.
 * @param {string} candidatePassword - Password to compare.
 * @returns {Promise<boolean>} True if passwords match, false otherwise.
 */
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// =============== VIRTUALS =============
/**
 * Virtual field for user's full name.
 * @returns {string} User's name.
 */
UserSchema.virtual("fullName").get(function () {
  return this.name ?? "";
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

/**
 * User model for interacting with the User collection.
 * @type {mongoose.Model}
 */
module.exports = {
  User: model("User", UserSchema),
};
