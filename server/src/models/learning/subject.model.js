const { Schema, model, Types } = require("mongoose");
const {
  SUBJECT_CATEGORIES,
  SUBJECT_DIFFICULTIES,
  SUBJECT_STATUSES,
} = require("../../constants");

// =============== CONSTANTS =============
/**
 * Imported constants for subject categories, difficulties, and statuses.
 * @see module:constants/index
 */

// =============== SUBSCHEMAS =============
/**
 * Subschema for subject rating system.
 * @module RatingSubSchema
 */
const RatingSchema = new Schema({
  average: {
    type: Number,
    default: 0,
    min: [0, "La note moyenne ne peut pas être négative"],
    max: [5, "La note moyenne ne peut pas dépasser 5"],
  },
  count: {
    type: Number,
    default: 0,
    min: [0, "Le nombre de notes ne peut pas être négatif"],
  },
  distribution: {
    five: { type: Number, default: 0 },
    four: { type: Number, default: 0 },
    three: { type: Number, default: 0 },
    two: { type: Number, default: 0 },
    one: { type: Number, default: 0 },
  },
});

/**
 * Subschema for subject statistics and analytics.
 * @module StatisticsSubSchema
 */
const StatisticsSchema = new Schema({
  totalStudents: {
    type: Number,
    default: 0,
    min: [0, "Le nombre total d'étudiants ne peut pas être négatif"],
  },
  totalExams: {
    type: Number,
    default: 0,
    min: [0, "Le nombre total d'examens ne peut pas être négatif"],
  },
  averageScore: {
    type: Number,
    default: 0,
    min: [0, "Le score moyen ne peut pas être négatif"],
    max: [100, "Le score moyen ne peut pas dépasser 100"],
  },
  completionRate: {
    type: Number,
    default: 0,
    min: [0, "Le taux de complétion ne peut pas être négatif"],
    max: [1, "Le taux de complétion ne peut pas dépasser 1"],
  },
  totalQuestions: {
    type: Number,
    default: 0,
    min: [0, "Le nombre total de questions ne peut pas être négatif"],
  },
  totalResources: {
    type: Number,
    default: 0,
    min: [0, "Le nombre total de ressources ne peut pas être négatif"],
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

/**
 * Subschema for subject metadata.
 * @module MetadataSubSchema
 */
const MetadataSchema = new Schema({
  createdBy: {
    type: Types.ObjectId,
    ref: "User",
    required: [true, "Le créateur est requis"],
  },
  updatedBy: {
    type: Types.ObjectId,
    ref: "User",
  },
  version: {
    type: Number,
    default: 1,
    min: [1, "La version doit être au moins 1"],
  },
  lastModified: {
    type: Date,
    default: Date.now,
  },
  reviewNotes: {
    type: String,
    maxlength: [
      500,
      "Les notes de révision ne peuvent pas dépasser 500 caractères",
    ],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
});

// ==================== SCHEMA ==================
/**
 * Mongoose schema for subjects, organizing educational topics and materials.
 * @module SubjectSchema
 */
const SubjectSchema = new Schema(
  {
    // Subject identification
    name: {
      type: String,
      required: [true, "Le nom de la matière est requis"],
      trim: true,
      maxlength: [100, "Le nom ne peut pas dépasser 100 caractères"],
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
      lowercase: true,
    },
    icon: {
      type: String,
      required: [true, "L'icône est requise"],
      trim: true,
      maxlength: [50, "L'icône ne peut pas dépasser 50 caractères"],
    },
    color: {
      type: String,
      required: [true, "La couleur est requise"],
      validate: {
        validator: (v) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v),
        message: "{VALUE} n'est pas un code couleur hexadécimal valide",
      },
    },
    // Subject details
    description: {
      type: String,
      required: [true, "La description est requise"],
      trim: true,
      maxlength: [500, "La description ne peut pas dépasser 500 caractères"],
    },
    longDescription: {
      type: String,
      trim: true,
      maxlength: [
        2000,
        "La description longue ne peut pas dépasser 2000 caractères",
      ],
    },
    // Subject categorization
    category: {
      type: String,
      enum: {
        values: SUBJECT_CATEGORIES,
        message: "{VALUE} n'est pas une catégorie valide",
      },
      required: [true, "La catégorie est requise"],
      index: true,
    },
    subcategory: {
      type: String,
      trim: true,
      maxlength: [50, "La sous-catégorie ne peut pas dépasser 50 caractères"],
    },
    difficulty: {
      type: String,
      enum: {
        values: SUBJECT_DIFFICULTIES,
        message: "{VALUE} n'est pas une difficulté valide",
      },
      default: "moyen",
      index: true,
    },
    // Subject associations
    examIds: {
      type: [{ type: Types.ObjectId, ref: "Exam" }],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 50;
        },
        message: "Trop d'examens associés (maximum 50)",
      },
    },
    series: {
      type: [String],
      default: ["D"],
      validate: {
        validator: function (arr) {
          return (
            arr && arr.length > 0 && arr.every((s) => s && s.trim().length > 0)
          );
        },
        message:
          "Au moins une série doit être spécifiée et toutes doivent être valides",
      },
      index: true,
    },
    // Subject content
    estimatedHours: {
      type: Number,
      min: [1, "Le nombre d'heures doit être au moins 1"],
      max: [1000, "Le nombre d'heures ne peut pas dépasser 1000"],
    },
    tags: {
      type: [String],
      default: [],
      index: true,
      validate: {
        validator: function (arr) {
          return arr.length <= 20;
        },
        message: "Trop de tags (maximum 20)",
      },
    },
    keywords: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 30;
        },
        message: "Trop de mots-clés (maximum 30)",
      },
    },
    // Subject engagement
    popularity: {
      type: Number,
      default: 0,
      min: [0, "La popularité ne peut pas être négative"],
      index: true,
    },
    rating: {
      type: RatingSchema,
      default: () => ({}),
    },
    statistics: {
      type: StatisticsSchema,
      default: () => ({}),
    },
    // Subject settings
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: SUBJECT_STATUSES,
        message: "{VALUE} n'est pas un statut valide",
      },
      default: "active",
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    // Subject metadata
    metadata: {
      type: MetadataSchema,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// =============== INDEXES =================
SubjectSchema.index({ name: 1, series: 1 }, { unique: true });
SubjectSchema.index({ category: 1, difficulty: 1 });
SubjectSchema.index({ popularity: -1 });
SubjectSchema.index({ "rating.average": -1 });
SubjectSchema.index({ series: 1, category: 1 });
SubjectSchema.index({ keywords: 1 });
SubjectSchema.index({
  name: "text",
  description: "text",
  longDescription: "text",
  tags: "text",
  keywords: "text",
});
SubjectSchema.index({ createdAt: -1 });
SubjectSchema.index({ isActive: 1, status: 1 });

// =============== VIRTUALS =============
/**
 * Virtual field for total number of associated exams.
 * @returns {number} Number of exams associated with the subject.
 */
SubjectSchema.virtual("examCount").get(function () {
  return (this.examIds ?? []).length;
});

/**
 * Virtual field for formatted series display.
 * @returns {string} Comma-separated series list.
 */
SubjectSchema.virtual("formattedSeries").get(function () {
  return (this.series ?? []).join(", ");
});

/**
 * Virtual field to check if subject is popular.
 * @returns {boolean} True if popularity exceeds threshold.
 */
SubjectSchema.virtual("isPopular").get(function () {
  return this.popularity > 100;
});

/**
 * Virtual field for numeric difficulty level.
 * @returns {number} Difficulty level as number.
 */
SubjectSchema.virtual("difficultyLevel").get(function () {
  const levels = { facile: 1, moyen: 2, difficile: 3 };
  return levels[this.difficulty] || 2;
});

/**
 * Virtual field for completion percentage.
 * @returns {number} Completion rate as percentage.
 */
SubjectSchema.virtual("completionPercentage").get(function () {
  return Math.round((this.statistics?.completionRate || 0) * 100);
});

/**
 * Virtual field for engagement score.
 * @returns {number} Calculated engagement based on multiple factors.
 */
SubjectSchema.virtual("engagementScore").get(function () {
  const popularity = this.popularity || 0;
  const rating = this.rating?.average || 0;
  const students = this.statistics?.totalStudents || 0;

  return Math.round(popularity * 0.3 + rating * 20 + students * 0.5);
});

// =============== MIDDLEWARE =============
/**
 * Pre-save middleware to update metadata and generate slug.
 * @param {Function} next - Callback to proceed with save.
 */
SubjectSchema.pre("save", function (next) {
  try {
    // Generate slug from name
    if (this.isModified("name")) {
      this.slug = this.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    // Ensure series array has unique values
    if (this.series) {
      this.series = [...new Set(this.series)];
    }

    // Normalize tags and keywords
    if (this.tags) {
      this.tags = [
        ...new Set(
          this.tags
            .map((tag) => tag.toLowerCase().normalize("NFC").trim())
            .filter((tag) => tag.length > 0)
        ),
      ];
    }

    if (this.keywords) {
      this.keywords = [
        ...new Set(
          this.keywords
            .map((keyword) => keyword.toLowerCase().normalize("NFC").trim())
            .filter((keyword) => keyword.length > 0)
        ),
      ];
    }

    // Update statistics
    if (this.examIds) {
      this.statistics.totalExams = this.examIds.length;
    }

    // Update metadata
    if (this.isModified() && !this.isNew) {
      this.metadata.version += 1;
      this.metadata.lastModified = new Date();
    }

    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Pre-save middleware to validate exam references.
 * @param {Function} next - Callback to proceed with save.
 */
SubjectSchema.pre("save", async function (next) {
  try {
    // Validate examIds
    if (this.examIds?.length > 0) {
      const exams = await model("Exam").find({
        _id: { $in: this.examIds },
      });
      if (exams.length !== this.examIds.length) {
        return next(new Error("Un ou plusieurs IDs d'examen invalides"));
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

// =============== METHODS =============
/**
 * Increment subject popularity.
 * @param {number} amount - Amount to increment by.
 * @returns {Promise<Document>} Updated subject document.
 */
SubjectSchema.methods.incrementPopularity = function (amount = 1) {
  this.popularity += amount;
  return this.save();
};

/**
 * Update subject rating with new rating.
 * @param {number} newRating - New rating value (1-5).
 * @returns {Promise<Document>} Updated subject document.
 */
SubjectSchema.methods.updateRating = function (newRating) {
  if (newRating < 1 || newRating > 5) {
    throw new Error("La note doit être entre 1 et 5");
  }

  const currentTotal = this.rating.average * this.rating.count;
  this.rating.count += 1;
  this.rating.average =
    Math.round(((currentTotal + newRating) / this.rating.count) * 10) / 10;

  // Update rating distribution
  const ratingKey = ["", "one", "two", "three", "four", "five"][newRating];
  this.rating.distribution[ratingKey] += 1;

  return this.save();
};

/**
 * Update subject statistics.
 * @param {Object} statsData - Statistics data to update.
 * @returns {Promise<Document>} Updated subject document.
 */
SubjectSchema.methods.updateStatistics = function (statsData) {
  Object.assign(this.statistics, {
    ...statsData,
    lastUpdated: new Date(),
  });

  return this.save();
};

/**
 * Add tags to the subject.
 * @param {Array<string>} newTags - Tags to add.
 * @returns {Promise<Document>} Updated subject document.
 */
SubjectSchema.methods.addTags = function (newTags) {
  const normalizedTags = newTags.map((tag) =>
    tag.toLowerCase().normalize("NFC").trim()
  );
  this.tags = [...new Set([...this.tags, ...normalizedTags])];

  return this.save();
};

/**
 * Archive the subject.
 * @param {string} reason - Reason for archiving.
 * @returns {Promise<Document>} Updated subject document.
 */
SubjectSchema.methods.archive = function (reason = "") {
  this.isActive = false;
  this.status = "archived";
  this.metadata.reviewNotes = reason;

  return this.save();
};

/**
 * Get subject statistics for analytics.
 * @returns {Object} Subject statistics object.
 */
SubjectSchema.methods.getStatistics = function () {
  return {
    examCount: this.examCount,
    formattedSeries: this.formattedSeries,
    difficultyLevel: this.difficultyLevel,
    completionPercentage: this.completionPercentage,
    engagementScore: this.engagementScore,
    popularity: this.popularity,
    rating: this.rating?.average || 0,
    ratingCount: this.rating?.count || 0,
    totalStudents: this.statistics?.totalStudents || 0,
    averageScore: this.statistics?.averageScore || 0,
  };
};

/**
 * Subject model for interacting with the Subject collection.
 * @type {mongoose.Model}
 */
module.exports = {
  Subject: model("Subject", SubjectSchema),
};
