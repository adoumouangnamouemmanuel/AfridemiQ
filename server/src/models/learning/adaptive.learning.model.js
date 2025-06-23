const { Schema, model, Types } = require("mongoose");
const {
  ADAPTIVE_LEARNING_LEVELS,
  ADJUSTMENT_METRICS,
  ADJUSTMENT_ACTIONS,
  RECOMMENDED_CONTENT_TYPES,
} = require("../../constants");

// =============== CONSTANTS =============
/**
 * Imported constants for adaptive learning levels, metrics, and actions.
 * @see module:constants/index
 */

// =============== SUBSCHEMAS =============
/**
 * Subschema for adjustment rules in adaptive learning.
 * @module AdjustmentRuleSubSchema
 */
const AdjustmentRuleSchema = new Schema({
  metric: {
    type: String,
    enum: {
      values: ADJUSTMENT_METRICS,
      message: "{VALUE} n'est pas une métrique valide",
    },
    required: [true, "La métrique est requise"],
  },
  threshold: {
    type: Number,
    required: [true, "Le seuil est requis"],
    min: [0, "Le seuil ne peut pas être négatif"],
    max: [100, "Le seuil ne peut pas dépasser 100"],
  },
  action: {
    type: String,
    enum: {
      values: ADJUSTMENT_ACTIONS,
      message: "{VALUE} n'est pas une action valide",
    },
    required: [true, "L'action est requise"],
  },
  resourceId: {
    type: Types.ObjectId,
    ref: "Resource",
    required: function () {
      return this.action === "suggestResource";
    },
    validate: {
      validator: function (v) {
        return this.action !== "suggestResource" || v != null;
      },
      message: "L'ID de ressource est requis pour l'action 'suggestResource'",
    },
  },
  value: {
    type: Number,
    default: 1,
    min: [1, "La valeur doit être au moins 1"],
    max: [5, "La valeur ne peut pas dépasser 5"],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, "La description ne peut pas dépasser 500 caractères"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/**
 * Subschema for recommended content in adaptive learning.
 * @module RecommendedContentSubSchema
 */
const RecommendedContentSchema = new Schema({
  contentType: {
    type: String,
    enum: {
      values: RECOMMENDED_CONTENT_TYPES,
      message: "{VALUE} n'est pas un type de contenu valide",
    },
    required: [true, "Le type de contenu est requis"],
  },
  contentId: {
    type: Types.ObjectId,
    required: [true, "L'ID du contenu est requis"],
    refPath: "recommendedContent.contentType",
  },
  priority: {
    type: Number,
    default: 1,
    min: [1, "La priorité doit être au moins 1"],
    max: [10, "La priorité ne peut pas dépasser 10"],
  },
  reason: {
    type: String,
    trim: true,
    maxlength: [200, "La raison ne peut pas dépasser 200 caractères"],
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
  },
});

/**
 * Subschema for performance progress tracking.
 * @module ProgressSubSchema
 */
const ProgressSchema = new Schema({
  scores: {
    type: [Number],
    default: [],
    validate: {
      validator: function (arr) {
        return arr.every((score) => score >= 0 && score <= 100);
      },
      message: "Tous les scores doivent être entre 0 et 100",
    },
  },
  timeSpent: {
    type: [Number],
    default: [],
    validate: {
      validator: function (arr) {
        return arr.every((time) => time >= 0);
      },
      message: "Le temps passé ne peut pas être négatif",
    },
  },
  accuracy: {
    type: [Number],
    default: [],
    validate: {
      validator: function (arr) {
        return arr.every((acc) => acc >= 0 && acc <= 100);
      },
      message: "La précision doit être entre 0 et 100",
    },
  },
  completionRate: {
    type: [Number],
    default: [],
    validate: {
      validator: function (arr) {
        return arr.every((rate) => rate >= 0 && rate <= 100);
      },
      message: "Le taux de completion doit être entre 0 et 100",
    },
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

// ==================== SCHEMA ==================
/**
 * Mongoose schema for adaptive learning, personalizing content based on user performance.
 * @module AdaptiveLearningSchema
 */
const AdaptiveLearningSchema = new Schema(
  {
    // User and level details
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "L'ID de l'utilisateur est requis"],
      unique: true,
      index: true,
    },
    currentLevel: {
      type: String,
      enum: {
        values: ADAPTIVE_LEARNING_LEVELS,
        message: "{VALUE} n'est pas un niveau valide",
      },
      required: [true, "Le niveau actuel est requis"],
    },
    series: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.every((s) => s && s.trim().length > 0);
        },
        message: "Toutes les séries doivent avoir au moins 1 caractère",
      },
    },
    // Learning configuration
    adjustmentRules: {
      type: [AdjustmentRuleSchema],
      default: [],
      validate: [
        {
          validator: function (arr) {
            return arr.length <= 20;
          },
          message: "Trop de règles d'ajustement (maximum 20)",
        },
      ],
    },
    recommendedContent: {
      type: [RecommendedContentSchema],
      default: [],
      validate: [
        {
          validator: function (arr) {
            return arr.length <= 50;
          },
          message: "Trop de contenu recommandé (maximum 50)",
        },
      ],
    },
    // Performance tracking
    progress: {
      type: ProgressSchema,
      default: () => ({}),
    },
    // Learning analytics
    analytics: {
      totalSessions: { type: Number, default: 0 },
      averageSessionTime: { type: Number, default: 0 },
      improvementRate: { type: Number, default: 0 },
      difficultyProgression: {
        type: [{ level: String, achievedAt: Date }],
        default: [],
      },
      lastLevelChange: {
        type: Date,
      },
      adaptationCount: { type: Number, default: 0 },
    },
    // Configuration settings
    settings: {
      adaptationSensitivity: {
        type: Number,
        default: 0.5,
        min: [0.1, "La sensibilité d'adaptation doit être au moins 0.1"],
        max: [1.0, "La sensibilité d'adaptation ne peut pas dépasser 1.0"],
      },
      autoAdjustDifficulty: { type: Boolean, default: true },
      requireConfirmation: { type: Boolean, default: false },
      maxRecommendations: {
        type: Number,
        default: 10,
        min: [1, "Le maximum de recommandations doit être au moins 1"],
        max: [20, "Le maximum de recommandations ne peut pas dépasser 20"],
      },
    },
    // Metadata
    metadata: {
      version: { type: Number, default: 1 },
      lastOptimization: { type: Date },
      optimizationHistory: {
        type: [{ date: Date, changes: String }],
        default: [],
      },
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
AdaptiveLearningSchema.index({ currentLevel: 1 });
AdaptiveLearningSchema.index({ "recommendedContent.contentId": 1 }, { sparse: true });
AdaptiveLearningSchema.index({ "adjustmentRules.resourceId": 1 }, { sparse: true });
AdaptiveLearningSchema.index({ isActive: 1 });
AdaptiveLearningSchema.index({ createdAt: -1 });
AdaptiveLearningSchema.index({ "analytics.lastLevelChange": -1 }, { sparse: true });

// =============== VIRTUALS =============
/**
 * Virtual field for average score from progress data.
 * @returns {number} Average score across all sessions.
 */
AdaptiveLearningSchema.virtual("averageScore").get(function () {
  const scores = this.progress?.scores || [];
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
});

/**
 * Virtual field for current performance trend.
 * @returns {string} Performance trend: improving, declining, or stable.
 */
AdaptiveLearningSchema.virtual("performanceTrend").get(function () {
  const scores = this.progress?.scores || [];
  if (scores.length < 3) return "stable";

  const recent = scores.slice(-3);
  const older = scores.slice(-6, -3);

  if (older.length === 0) return "stable";

  const recentAvg = recent.reduce((sum, score) => sum + score, 0) / recent.length;
  const olderAvg = older.reduce((sum, score) => sum + score, 0) / older.length;

  const difference = recentAvg - olderAvg;

  if (difference > 5) return "improving";
  if (difference < -5) return "declining";
  return "stable";
});

/**
 * Virtual field for total study time across all sessions.
 * @returns {number} Total time spent in seconds.
 */
AdaptiveLearningSchema.virtual("totalStudyTime").get(function () {
  const timeSpent = this.progress?.timeSpent || [];
  return timeSpent.reduce((total, time) => total + time, 0);
});

/**
 * Virtual field for pending recommendations count.
 * @returns {number} Number of uncompleted recommendations.
 */
AdaptiveLearningSchema.virtual("pendingRecommendations").get(function () {
  return (this.recommendedContent || []).filter((content) => !content.completed).length;
});

// =============== MIDDLEWARE =============
/**
 * Pre-save middleware to validate references and update metadata.
 * @param {Function} next - Callback to proceed with save.
 */
AdaptiveLearningSchema.pre("save", async function (next) {
  try {
    // Validate user exists
    const user = await model("User").findById(this.userId);
    if (!user) {
      return next(new Error("ID utilisateur invalide"));
    }

    // Validate resourceId in adjustmentRules
    const resourceIds = this.adjustmentRules
      .filter((rule) => rule.action === "suggestResource" && rule.resourceId)
      .map((rule) => rule.resourceId);

    if (resourceIds.length > 0) {
      const resources = await model("Resource").find({
        _id: { $in: resourceIds },
      });
      if (resources.length !== resourceIds.length) {
        return next(new Error("Un ou plusieurs IDs de ressource invalides"));
      }
    }

    // Validate recommendedContent IDs
    const contentValidation = [];
    for (const content of this.recommendedContent) {
      const modelName = {
        topic: "Topic",
        quiz: "Quiz",
        resource: "Resource",
      }[content.contentType];

      if (modelName) {
        contentValidation.push(model(modelName).findById(content.contentId));
      }
    }

    if (contentValidation.length > 0) {
      const results = await Promise.all(contentValidation);
      if (results.some((result) => !result)) {
        return next(new Error("Un ou plusieurs IDs de contenu invalides"));
      }
    }

    // Update metadata
    if (this.isModified() && !this.isNew) {
      this.metadata.version += 1;
    }

    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Pre-save middleware to update progress timestamps.
 * @param {Function} next - Callback to proceed with save.
 */
AdaptiveLearningSchema.pre("save", function (next) {
  if (this.isModified("progress")) {
    this.progress.lastUpdated = new Date();
  }
  next();
});

// =============== METHODS =============
/**
 * Add a new adjustment rule to the adaptive learning configuration.
 * @param {string} metric - Performance metric to track.
 * @param {number} threshold - Threshold value for the metric.
 * @param {string} action - Action to take when threshold is met.
 * @param {string} resourceId - Optional resource ID for suggestResource action.
 * @returns {Promise<Document>} Updated adaptive learning document.
 */
AdaptiveLearningSchema.methods.addAdjustmentRule = function (metric, threshold, action, resourceId = null) {
  this.adjustmentRules.push({
    metric,
    threshold,
    action,
    resourceId,
    value: 1,
  });
  return this.save();
};

/**
 * Update progress data with new performance metrics.
 * @param {number} score - Latest score achieved.
 * @param {number} timeSpent - Time spent in seconds.
 * @param {number} accuracy - Accuracy percentage.
 * @param {number} completionRate - Completion rate percentage.
 * @returns {Promise<Document>} Updated adaptive learning document.
 */
AdaptiveLearningSchema.methods.updateProgress = function (score, timeSpent, accuracy, completionRate) {
  this.progress.scores.push(score);
  this.progress.timeSpent.push(timeSpent);
  this.progress.accuracy.push(accuracy);
  this.progress.completionRate.push(completionRate);

  // Keep only last 100 entries for performance
  const maxEntries = 100;
  if (this.progress.scores.length > maxEntries) {
    this.progress.scores = this.progress.scores.slice(-maxEntries);
    this.progress.timeSpent = this.progress.timeSpent.slice(-maxEntries);
    this.progress.accuracy = this.progress.accuracy.slice(-maxEntries);
    this.progress.completionRate = this.progress.completionRate.slice(-maxEntries);
  }

  this.analytics.totalSessions += 1;
  this.analytics.averageSessionTime =
    (this.analytics.averageSessionTime * (this.analytics.totalSessions - 1) + timeSpent) /
    this.analytics.totalSessions;

  return this.save();
};

/**
 * Add recommended content based on user performance.
 * @param {string} contentType - Type of content (topic, quiz, resource).
 * @param {string} contentId - ID of the content.
 * @param {number} priority - Priority level (1-10).
 * @param {string} reason - Reason for recommendation.
 * @returns {Promise<Document>} Updated adaptive learning document.
 */
AdaptiveLearningSchema.methods.addRecommendation = function (contentType, contentId, priority = 1, reason = "") {
  // Remove existing recommendation for same content
  this.recommendedContent = this.recommendedContent.filter(
    (content) => !(content.contentType === contentType && content.contentId.toString() === contentId.toString())
  );

  this.recommendedContent.push({
    contentType,
    contentId,
    priority,
    reason,
  });

  // Sort by priority (highest first)
  this.recommendedContent.sort((a, b) => b.priority - a.priority);

  // Keep only max recommendations
  const maxRecs = this.settings.maxRecommendations || 10;
  if (this.recommendedContent.length > maxRecs) {
    this.recommendedContent = this.recommendedContent.slice(0, maxRecs);
  }

  return this.save();
};

/**
 * Mark recommended content as completed.
 * @param {string} contentId - ID of the completed content.
 * @returns {Promise<Document>} Updated adaptive learning document.
 */
AdaptiveLearningSchema.methods.markRecommendationCompleted = function (contentId) {
  const recommendation = this.recommendedContent.find(
    (content) => content.contentId.toString() === contentId.toString()
  );

  if (recommendation) {
    recommendation.completed = true;
    recommendation.completedAt = new Date();
  }

  return this.save();
};

/**
 * Adjust difficulty level based on performance.
 * @param {string} newLevel - New difficulty level.
 * @param {string} reason - Reason for the adjustment.
 * @returns {Promise<Document>} Updated adaptive learning document.
 */
AdaptiveLearningSchema.methods.adjustLevel = function (newLevel, reason = "") {
  if (this.currentLevel !== newLevel) {
    this.analytics.difficultyProgression.push({
      level: newLevel,
      achievedAt: new Date(),
    });

    this.currentLevel = newLevel;
    this.analytics.lastLevelChange = new Date();
    this.analytics.adaptationCount += 1;

    this.metadata.optimizationHistory.push({
      date: new Date(),
      changes: `Niveau ajusté de ${this.currentLevel} à ${newLevel}. Raison: ${reason}`,
    });
  }

  return this.save();
};

/**
 * AdaptiveLearning model for interacting with the AdaptiveLearning collection.
 * @type {mongoose.Model}
 */
module.exports = {
  AdaptiveLearning: model("AdaptiveLearning", AdaptiveLearningSchema),
};