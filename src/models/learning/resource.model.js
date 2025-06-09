const { Schema, model, Types } = require("mongoose");
const {
  RESOURCE_TYPES,
  RESOURCE_STATUSES,
  RESOURCE_LANGUAGES,
  RESOURCE_LICENSES,
  ACCESSIBILITY_FEATURES,
  EXERCISE_DIFFICULTY_LEVELS,
  FEEDBACK_RATING_RANGE,
} = require("../../constants");

// =============== CONSTANTS =============
/**
 * Imported constants for resource types, statuses, and difficulty levels.
 * @see module:constants/index
 */

// =============== SUBSCHEMAS =============
/**
 * Subschema for user feedback on resources.
 * @module FeedbackSubSchema
 */
const FeedbackSchema = new Schema({
  userId: {
    type: Types.ObjectId,
    ref: "User",
    required: [true, "L'ID de l'utilisateur est requis"],
  },
  rating: {
    type: Number,
    min: [
      FEEDBACK_RATING_RANGE.MIN,
      `La note doit être au moins ${FEEDBACK_RATING_RANGE.MIN}`,
    ],
    max: [
      FEEDBACK_RATING_RANGE.MAX,
      `La note ne peut pas dépasser ${FEEDBACK_RATING_RANGE.MAX}`,
    ],
    required: [true, "La note est requise"],
  },
  comments: {
    type: String,
    trim: true,
    maxlength: [1000, "Le commentaire ne peut pas dépasser 1000 caractères"],
  },
  isHelpful: {
    type: Boolean,
    default: false,
  },
  reportedAsInappropriate: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/**
 * Subschema for resource accessibility options.
 * @module AccessibilitySubSchema
 */
const AccessibilitySchema = new Schema({
  hasTranscript: {
    type: Boolean,
    default: false,
  },
  hasSubtitles: {
    type: Boolean,
    default: false,
  },
  hasAudioDescription: {
    type: Boolean,
    default: false,
  },
  features: {
    type: [String],
    enum: {
      values: ACCESSIBILITY_FEATURES,
      message: "{VALUE} n'est pas une fonctionnalité d'accessibilité valide",
    },
    default: [],
  },
  languages: {
    type: [String],
    enum: {
      values: RESOURCE_LANGUAGES,
      message: "{VALUE} n'est pas une langue supportée",
    },
    default: ["french"],
  },
  screenReaderFriendly: {
    type: Boolean,
    default: true,
  },
});

/**
 * Subschema for resource metadata.
 * @module MetadataSubSchema
 */
const MetadataSchema = new Schema({
  fileSize: {
    type: Number,
    min: [0, "La taille du fichier ne peut pas être négative"],
  },
  duration: {
    type: Number,
    min: [0, "La durée ne peut pas être négative"],
  },
  format: {
    type: String,
    trim: true,
    maxlength: [50, "Le format ne peut pas dépasser 50 caractères"],
  },
  language: {
    type: String,
    enum: {
      values: RESOURCE_LANGUAGES,
      message: "{VALUE} n'est pas une langue valide",
    },
    default: "french",
  },
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: function (arr) {
        return arr.length <= 20;
      },
      message: "Trop de tags (maximum 20)",
    },
  },
  difficulty: {
    type: String,
    enum: {
      values: EXERCISE_DIFFICULTY_LEVELS,
      message: "{VALUE} n'est pas un niveau de difficulté valide",
    },
    default: "beginner",
  },
  prerequisites: {
    type: [String],
    default: [],
    validate: {
      validator: function (arr) {
        return arr.length <= 10;
      },
      message: "Trop de prérequis (maximum 10)",
    },
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  version: {
    type: String,
    default: "1.0",
    trim: true,
    maxlength: [20, "La version ne peut pas dépasser 20 caractères"],
  },
  contributors: {
    type: [String],
    default: [],
    validate: {
      validator: function (arr) {
        return arr.length <= 15;
      },
      message: "Trop de contributeurs (maximum 15)",
    },
  },
  license: {
    type: String,
    enum: {
      values: RESOURCE_LICENSES,
      message: "{VALUE} n'est pas une licence valide",
    },
    default: "free",
  },
  createdBy: {
    type: Types.ObjectId,
    ref: "User",
    required: [true, "Le créateur est requis"],
  },
  updatedBy: {
    type: Types.ObjectId,
    ref: "User",
  },
});

/**
 * Subschema for resource analytics and engagement.
 * @module AnalyticsSubSchema
 */
const AnalyticsSchema = new Schema({
  views: {
    type: Number,
    default: 0,
    min: [0, "Le nombre de vues ne peut pas être négatif"],
  },
  downloads: {
    type: Number,
    default: 0,
    min: [0, "Le nombre de téléchargements ne peut pas être négatif"],
  },
  averageRating: {
    type: Number,
    default: 0,
    min: [0, "La note moyenne ne peut pas être négative"],
    max: [10, "La note moyenne ne peut pas dépasser 10"],
  },
  userFeedback: {
    type: [FeedbackSchema],
    default: [],
    validate: {
      validator: function (arr) {
        return arr.length <= 1000;
      },
      message: "Trop de commentaires (maximum 1000)",
    },
  },
  bookmarkCount: {
    type: Number,
    default: 0,
    min: [0, "Le nombre de signets ne peut pas être négatif"],
  },
  shareCount: {
    type: Number,
    default: 0,
    min: [0, "Le nombre de partages ne peut pas être négatif"],
  },
  lastViewedAt: {
    type: Date,
  },
});

// ==================== SCHEMA ==================
/**
 * Mongoose schema for resources, managing educational materials and content.
 * @module ResourceSchema
 */
const ResourceSchema = new Schema(
  {
    // Resource identification
    format: {
      type: String,
      enum: {
        values: RESOURCE_TYPES,
        message: "{VALUE} n'est pas un type de ressource valide",
      },
      required: [true, "Le format est requis"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Le titre est requis"],
      trim: true,
      maxlength: [200, "Le titre ne peut pas dépasser 200 caractères"],
      index: true,
    },
    description: {
      type: String,
      required: [true, "La description est requise"],
      trim: true,
      maxlength: [2000, "La description ne peut pas dépasser 2000 caractères"],
    },
    // Resource categorization
    subjectId: {
      type: Types.ObjectId,
      ref: "Subject",
      required: [true, "L'ID de la matière est requis"],
      index: true,
    },
    series: {
      type: [String],
      default: ["D"],
      validate: {
        validator: function (arr) {
          return arr.every((s) => s && s.trim().length > 0);
        },
        message: "Toutes les séries doivent avoir au moins 1 caractère",
      },
    },
    topicIds: {
      type: [{ type: Types.ObjectId, ref: "Topic" }],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 20;
        },
        message: "Trop de sujets (maximum 20)",
      },
    },
    examIds: {
      type: [{ type: Types.ObjectId, ref: "Exam" }],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 10;
        },
        message: "Trop d'examens (maximum 10)",
      },
    },
    level: {
      type: String,
      required: [true, "Le niveau est requis"],
      trim: true,
      maxlength: [50, "Le niveau ne peut pas dépasser 50 caractères"],
    },
    // Resource content
    url: {
      type: String,
      required: [true, "L'URL est requise"],
      trim: true,
      validate: {
        validator: function (v) {
          return /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(
            v
          );
        },
        message: "URL invalide",
      },
    },
    thumbnail: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return (
            !v ||
            /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(v)
          );
        },
        message: "URL de miniature invalide",
      },
    },
    alternativeUrls: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 5;
        },
        message: "Trop d'URLs alternatives (maximum 5)",
      },
    },
    // Resource settings
    offlineAvailable: {
      type: Boolean,
      default: false,
    },
    premiumOnly: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: RESOURCE_STATUSES,
        message: "{VALUE} n'est pas un statut valide",
      },
      default: "draft",
      index: true,
    },
    // Resource enhancements
    metadata: {
      type: MetadataSchema,
      required: true,
    },
    accessibility: {
      type: AccessibilitySchema,
      default: () => ({}),
    },
    analytics: {
      type: AnalyticsSchema,
      default: () => ({}),
    },
    // Resource relationships
    relatedResources: {
      type: [{ type: Types.ObjectId, ref: "Resource" }],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 10;
        },
        message: "Trop de ressources liées (maximum 10)",
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// =============== INDEXES =================
ResourceSchema.index({ subjectId: 1, series: 1 });
ResourceSchema.index({ topicIds: 1 });
ResourceSchema.index({ examIds: 1 });
ResourceSchema.index({ format: 1, level: 1 });
ResourceSchema.index({ "metadata.tags": 1 }, { sparse: true });
ResourceSchema.index({ "analytics.averageRating": -1 }, { sparse: true });
ResourceSchema.index({ "analytics.views": -1 }, { sparse: true });
ResourceSchema.index({ "metadata.difficulty": 1 });
ResourceSchema.index({ premiumOnly: 1 });
ResourceSchema.index({ title: "text", description: "text" });
ResourceSchema.index({ createdAt: -1 });
ResourceSchema.index({ isActive: 1, status: 1 });

// =============== VIRTUALS =============
/**
 * Virtual field for resource popularity score.
 * @returns {number} Calculated popularity based on views and downloads.
 */
ResourceSchema.virtual("popularity").get(function () {
  const views = this.analytics?.views || 0;
  const downloads = this.analytics?.downloads || 0;
  const bookmarks = this.analytics?.bookmarkCount || 0;
  return views + downloads * 2 + bookmarks * 3;
});

/**
 * Virtual field for total number of ratings.
 * @returns {number} Number of user feedback entries.
 */
ResourceSchema.virtual("ratingCount").get(function () {
  return (this.analytics?.userFeedback ?? []).length;
});

/**
 * Virtual field to check if resource is popular.
 * @returns {boolean} True if resource meets popularity criteria.
 */
ResourceSchema.virtual("isPopular").get(function () {
  const views = this.analytics?.views || 0;
  const rating = this.analytics?.averageRating || 0;
  return views > 100 || rating > 7;
});

/**
 * Virtual field for file size in human-readable format.
 * @returns {string} Formatted file size.
 */
ResourceSchema.virtual("formattedFileSize").get(function () {
  const size = this.metadata?.fileSize || 0;
  if (size === 0) return "Unknown";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024)
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
});

/**
 * Virtual field for formatted duration.
 * @returns {string} Human-readable duration.
 */
ResourceSchema.virtual("formattedDuration").get(function () {
  const duration = this.metadata?.duration || 0;
  if (duration === 0) return "Unknown";
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = duration % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
});

/**
 * Virtual field for engagement score.
 * @returns {number} Calculated engagement based on multiple factors.
 */
ResourceSchema.virtual("engagementScore").get(function () {
  const analytics = this.analytics || {};
  const views = analytics.views || 0;
  const downloads = analytics.downloads || 0;
  const rating = analytics.averageRating || 0;
  const feedbackCount = (analytics.userFeedback ?? []).length;

  return views * 0.1 + downloads * 0.3 + rating * 2 + feedbackCount * 0.5;
});

// =============== MIDDLEWARE =============
/**
 * Pre-save middleware to validate references and update metadata.
 * @param {Function} next - Callback to proceed with save.
 */
ResourceSchema.pre("save", async function (next) {
  try {
    // Validate subjectId
    if (this.subjectId) {
      const subject = await model("Subject").findById(this.subjectId);
      if (!subject) {
        return next(new Error("ID de matière invalide"));
      }
    }

    // Validate topicIds
    if (this.topicIds?.length > 0) {
      const topics = await model("Topic").find({
        _id: { $in: this.topicIds },
      });
      if (topics.length !== this.topicIds.length) {
        return next(new Error("Un ou plusieurs IDs de sujet invalides"));
      }
    }

    // Validate examIds
    if (this.examIds?.length > 0) {
      const exams = await model("Exam").find({
        _id: { $in: this.examIds },
      });
      if (exams.length !== this.examIds.length) {
        return next(new Error("Un ou plusieurs IDs d'examen invalides"));
      }
    }

    // Validate related resources
    if (this.relatedResources?.length > 0) {
      const relatedResources = await model("Resource").find({
        _id: { $in: this.relatedResources },
      });
      if (relatedResources.length !== this.relatedResources.length) {
        return next(new Error("Une ou plusieurs ressources liées invalides"));
      }
    }

    // Update metadata
    if (this.isModified() && !this.isNew) {
      this.metadata.lastUpdated = new Date();
    }

    // Calculate average rating
    if (this.analytics?.userFeedback?.length > 0) {
      const totalRating = this.analytics.userFeedback.reduce(
        (sum, feedback) => sum + feedback.rating,
        0
      );
      this.analytics.averageRating =
        Math.round((totalRating / this.analytics.userFeedback.length) * 10) /
        10;
    }

    // Normalize tags
    if (this.metadata?.tags?.length > 0) {
      this.metadata.tags = this.metadata.tags
        .map((tag) => tag.toLowerCase().trim())
        .filter((tag) => tag.length > 0);
      // Remove duplicates
      this.metadata.tags = [...new Set(this.metadata.tags)];
    }

    next();
  } catch (error) {
    next(error);
  }
});

// =============== METHODS =============
/**
 * Add user feedback to the resource.
 * @param {string} userId - ID of the user providing feedback.
 * @param {number} rating - Rating score.
 * @param {string} comments - Optional comments.
 * @returns {Promise<Document>} Updated resource document.
 */
ResourceSchema.methods.addFeedback = function (userId, rating, comments = "") {
  const existingFeedback = this.analytics.userFeedback.find(
    (feedback) => feedback.userId.toString() === userId
  );

  if (existingFeedback) {
    existingFeedback.rating = rating;
    existingFeedback.comments = comments;
    existingFeedback.createdAt = new Date();
  } else {
    this.analytics.userFeedback.push({
      userId,
      rating,
      comments,
      createdAt: new Date(),
    });
  }

  return this.save();
};

/**
 * Increment view count.
 * @returns {Promise<Document>} Updated resource document.
 */
ResourceSchema.methods.incrementViews = function () {
  this.analytics.views += 1;
  this.analytics.lastViewedAt = new Date();
  return this.save();
};

/**
 * Increment download count.
 * @returns {Promise<Document>} Updated resource document.
 */
ResourceSchema.methods.incrementDownloads = function () {
  this.analytics.downloads += 1;
  return this.save();
};

/**
 * Archive the resource.
 * @param {string} reason - Reason for archiving.
 * @returns {Promise<Document>} Updated resource document.
 */
ResourceSchema.methods.archive = function (reason = "") {
  this.isActive = false;
  this.status = "archived";
  this.metadata.reviewNotes = reason;

  return this.save();
};

/**
 * Get resource statistics.
 * @returns {Object} Resource statistics object.
 */
ResourceSchema.methods.getStatistics = function () {
  return {
    views: this.analytics?.views || 0,
    downloads: this.analytics?.downloads || 0,
    averageRating: this.analytics?.averageRating || 0,
    ratingCount: this.ratingCount,
    bookmarkCount: this.analytics?.bookmarkCount || 0,
    shareCount: this.analytics?.shareCount || 0,
    popularity: this.popularity,
    engagementScore: this.engagementScore,
    fileSize: this.formattedFileSize,
    duration: this.formattedDuration,
  };
};

/**
 * Update resource analytics.
 * @param {Object} analyticsData - Analytics data to update.
 * @returns {Promise<Document>} Updated resource document.
 */
ResourceSchema.methods.updateAnalytics = function (analyticsData) {
  Object.assign(this.analytics, analyticsData);
  return this.save();
};

/**
 * Resource model for interacting with the Resource collection.
 * @type {mongoose.Model}
 */
module.exports = {
  Resource: model("Resource", ResourceSchema),
};
