const { Schema, model, Types } = require("mongoose");
const {
  COURSE_CONTENT_LEVELS,
  COURSE_ACCESS_TYPES,
  COURSE_FORMATS,
  COURSE_LANGUAGES,
  COURSE_ACCOMMODATIONS,
} = require("../../constants");

// =============== CONSTANTS =============
/**
 * Imported constants for course content levels, access types, and formats.
 * @see module:constants/index
 */

// =============== SUBSCHEMAS =============
/**
 * Subschema for lesson tracking within modules.
 * @module LessonTrackingSubSchema
 */
const LessonTrackingSchema = new Schema({
  lessonId: {
    type: Types.ObjectId,
    ref: "Lesson",
    required: [true, "L'ID de la leçon est requis"],
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
  },
  timeSpent: {
    type: Number,
    default: 0,
    min: [0, "Le temps passé ne peut pas être négatif"],
  },
  progress: {
    type: Number,
    default: 0,
    min: [0, "Le progrès ne peut pas être négatif"],
    max: [100, "Le progrès ne peut pas dépasser 100"],
  },
});

/**
 * Subschema for course modules with lessons and exercises.
 * @module ModuleSubSchema
 */
const ModuleSchema = new Schema({
  id: {
    type: String,
    required: [true, "L'ID du module est requis"],
    trim: true,
  },
  title: {
    type: String,
    required: [true, "Le titre du module est requis"],
    trim: true,
    maxlength: [200, "Le titre ne peut pas dépasser 200 caractères"],
  },
  description: {
    type: String,
    required: [true, "La description du module est requise"],
    trim: true,
    maxlength: [1000, "La description ne peut pas dépasser 1000 caractères"],
  },
  order: {
    type: Number,
    required: [true, "L'ordre du module est requis"],
    min: [1, "L'ordre doit être au moins 1"],
  },
  series: {
    type: String,
    trim: true,
    maxlength: [50, "La série ne peut pas dépasser 50 caractères"],
  },
  lessons: {
    type: [{ type: Types.ObjectId, ref: "Lesson" }],
    default: [],
  },
  exerciseIds: {
    type: [{ type: Types.ObjectId, ref: "Exercise" }],
    default: [],
  },
  assessment: {
    type: Types.ObjectId,
    ref: "Assessment",
    default: null,
  },
  progressTracking: {
    completedLessons: {
      type: Number,
      default: 0,
      min: [0, "Le nombre de leçons complétées ne peut pas être négatif"],
    },
    totalLessons: {
      type: Number,
      default: 0,
      min: [0, "Le nombre total de leçons ne peut pas être négatif"],
    },
    lastAccessedAt: {
      type: Date,
    },
  },
  estimatedDuration: {
    type: Number,
    min: [0, "La durée estimée ne peut pas être négative"],
  },
  prerequisites: {
    type: [String],
    default: [],
  },
  isLocked: {
    type: Boolean,
    default: false,
  },
  unlockConditions: {
    requiredModules: {
      type: [String],
      default: [],
    },
    minimumScore: {
      type: Number,
      min: [0, "Le score minimum ne peut pas être négatif"],
      max: [100, "Le score minimum ne peut pas dépasser 100"],
    },
  },
});

/**
 * Subschema for accessibility options.
 * @module AccessibilitySubSchema
 */
const AccessibilitySchema = new Schema({
  languages: {
    type: [String],
    enum: {
      values: COURSE_LANGUAGES,
      message: "{VALUE} n'est pas une langue supportée",
    },
    default: ["french"],
  },
  formats: {
    type: [String],
    enum: {
      values: COURSE_FORMATS,
      message: "{VALUE} n'est pas un format valide",
    },
    default: ["text"],
  },
  accommodations: {
    type: [String],
    enum: {
      values: COURSE_ACCOMMODATIONS,
      message: "{VALUE} n'est pas un aménagement valide",
    },
    default: [],
  },
  hasAudioVersion: {
    type: Boolean,
    default: false,
  },
  hasBrailleVersion: {
    type: Boolean,
    default: false,
  },
  screenReaderFriendly: {
    type: Boolean,
    default: true,
  },
});

/**
 * Subschema for course metadata and tracking.
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
  lastModified: {
    type: Date,
    default: Date.now,
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
  version: {
    type: Number,
    default: 1,
    min: [1, "La version doit être au moins 1"],
  },
  status: {
    type: String,
    enum: ["draft", "published", "archived", "under_review"],
    default: "draft",
  },
  publishedAt: {
    type: Date,
  },
  lastReviewDate: {
    type: Date,
  },
  reviewNotes: {
    type: String,
    maxlength: [
      500,
      "Les notes de révision ne peuvent pas dépasser 500 caractères",
    ],
  },
});

// ==================== SCHEMA ==================
/**
 * Mongoose schema for course content, organizing educational materials into structured modules.
 * @module CourseContentSchema
 */
const CourseContentSchema = new Schema(
  {
    // Course identification
    examId: {
      type: [{ type: Types.ObjectId, ref: "Exam" }],
      required: [true, "Au moins un ID d'examen est requis"],
      validate: {
        validator: function (arr) {
          return arr && arr.length > 0;
        },
        message: "Au moins un examen doit être associé",
      },
    },
    subjectId: {
      type: Types.ObjectId,
      ref: "Subject",
      required: [true, "L'ID de la matière est requis"],
    },
    topicId: {
      type: [{ type: Types.ObjectId, ref: "Topic" }],
      required: [true, "Au moins un ID de sujet est requis"],
      validate: {
        validator: function (arr) {
          return arr && arr.length > 0;
        },
        message: "Au moins un sujet doit être associé",
      },
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
    // Course details
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
    level: {
      type: String,
      enum: {
        values: COURSE_CONTENT_LEVELS,
        message: "{VALUE} n'est pas un niveau valide",
      },
      required: [true, "Le niveau est requis"],
    },
    // Course structure
    modules: {
      type: [ModuleSchema],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 50;
        },
        message: "Trop de modules (maximum 50)",
      },
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
    estimatedDuration: {
      type: Number,
      min: [0, "La durée estimée ne peut pas être négative"],
      required: [true, "La durée estimée est requise"],
    },
    // Progress tracking
    progressTracking: {
      completedLessons: {
        type: Number,
        default: 0,
        min: [0, "Le nombre de leçons complétées ne peut pas être négatif"],
      },
      totalLessons: {
        type: Number,
        default: 0,
        min: [0, "Le nombre total de leçons ne peut pas être négatif"],
      },
      lastAccessedAt: {
        type: Date,
      },
      averageCompletionTime: {
        type: Number,
        default: 0,
        min: [0, "Le temps de complétion moyen ne peut pas être négatif"],
      },
    },
    // Course settings
    accessibilityOptions: {
      type: AccessibilitySchema,
      default: () => ({}),
    },
    premiumOnly: {
      type: Boolean,
      default: false,
    },
    accessType: {
      type: String,
      enum: {
        values: COURSE_ACCESS_TYPES,
        message: "{VALUE} n'est pas un type d'accès valide",
      },
      default: "free",
    },
    // Analytics and engagement
    analytics: {
      enrollmentCount: {
        type: Number,
        default: 0,
        min: [0, "Le nombre d'inscriptions ne peut pas être négatif"],
      },
      completionRate: {
        type: Number,
        default: 0,
        min: [0, "Le taux de complétion ne peut pas être négatif"],
        max: [100, "Le taux de complétion ne peut pas dépasser 100"],
      },
      averageRating: {
        type: Number,
        default: 0,
        min: [0, "La note moyenne ne peut pas être négative"],
        max: [5, "La note moyenne ne peut pas dépasser 5"],
      },
      totalViews: {
        type: Number,
        default: 0,
        min: [0, "Le nombre total de vues ne peut pas être négatif"],
      },
      lastViewedAt: {
        type: Date,
      },
    },
    // Course metadata
    metadata: {
      type: MetadataSchema,
      required: true,
    },
    // Course status
    isActive: {
      type: Boolean,
      default: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// =============== INDEXES =================
CourseContentSchema.index({ subjectId: 1, series: 1 });
CourseContentSchema.index({ examId: 1 });
CourseContentSchema.index({ topicId: 1 });
CourseContentSchema.index({ level: 1, accessType: 1 });
CourseContentSchema.index({ "modules.lessons": 1 }, { sparse: true });
CourseContentSchema.index({ premiumOnly: 1 });
CourseContentSchema.index({ "metadata.tags": 1 }, { sparse: true });
CourseContentSchema.index({ "metadata.status": 1 });
CourseContentSchema.index({ title: "text", description: "text" });
CourseContentSchema.index({ createdAt: -1 });
CourseContentSchema.index({ "analytics.averageRating": -1 }, { sparse: true });
CourseContentSchema.index({ isActive: 1, isArchived: 1 });

// =============== VIRTUALS =============
/**
 * Virtual field for total number of modules.
 * @returns {number} Number of modules in the course.
 */
CourseContentSchema.virtual("totalModules").get(function () {
  return (this.modules ?? []).length;
});

/**
 * Virtual field for course completion percentage.
 * @returns {number} Percentage of completed lessons.
 */
CourseContentSchema.virtual("completionPercentage").get(function () {
  if (!this.progressTracking || this.progressTracking.totalLessons === 0) return 0;
  return Math.round(
    (this.progressTracking.completedLessons / this.progressTracking.totalLessons) * 100
  );
});

/**
 * Virtual field to check if course is completed.
 * @returns {boolean} True if all lessons are completed.
 */
CourseContentSchema.virtual("isCompleted").get(function () {
  return (
    this.progressTracking &&
    this.progressTracking.completedLessons === this.progressTracking.totalLessons &&
    this.progressTracking.totalLessons > 0
  );
});

/**
 * Virtual field for total number of exercises across all modules.
 * @returns {number} Total number of exercises.
 */
CourseContentSchema.virtual("totalExercises").get(function () {
  return (this.modules ?? []).reduce((total, module) => {
    return total + (module.exerciseIds ?? []).length;
  }, 0);
});

/**
 * Virtual field for average module completion.
 * @returns {number} Average completion percentage across all modules.
 */
CourseContentSchema.virtual("averageModuleCompletion").get(function () {
  const modules = this.modules ?? [];
  if (modules.length === 0) return 0;

  const totalCompletion = modules.reduce((sum, module) => {
    if (module.progressTracking?.totalLessons === 0) return sum;
    const moduleCompletion =
      ((module.progressTracking?.completedLessons ?? 0) /
        (module.progressTracking?.totalLessons ?? 1)) *
      100;
    return sum + moduleCompletion;
  }, 0);

  return Math.round(totalCompletion / modules.length);
});

/**
 * Virtual field for estimated reading time in hours.
 * @returns {number} Estimated duration in hours.
 */
CourseContentSchema.virtual("estimatedHours").get(function () {
  return this.estimatedDuration ? Math.round(this.estimatedDuration / 60) : 0;
});

// =============== MIDDLEWARE =============
/**
 * Pre-save middleware to validate references and update metadata.
 * @param {Function} next - Callback to proceed with save.
 */
CourseContentSchema.pre("save", async function (next) {
  try {
    // Validate subjectId
    if (this.subjectId) {
      const subject = await model("Subject").findById(this.subjectId);
      if (!subject) {
        return next(new Error("ID de matière invalide"));
      }
    }

    // Validate topicIds
    if (this.topicId && this.topicId.length > 0) {
      const topics = await model("Topic").find({
        _id: { $in: this.topicId },
      });
      if (topics.length !== this.topicId.length) {
        return next(new Error("Un ou plusieurs IDs de sujet invalides"));
      }
    }

    // Validate examIds
    if (this.examId && this.examId.length > 0) {
      const exams = await model("Exam").find({
        _id: { $in: this.examId },
      });
      if (exams.length !== this.examId.length) {
        return next(new Error("Un ou plusieurs IDs d'examen invalides"));
      }
    }

    // Update total lessons count
    this.progressTracking.totalLessons = this.modules.reduce((total, module) => {
      return total + (module.lessons ?? []).length;
    }, 0);

    // Update metadata
    if (this.isModified() && !this.isNew) {
      this.metadata.version += 1;
      this.metadata.lastModified = new Date();
    }

    // Normalize tags
    if (this.metadata.tags && this.metadata.tags.length > 0) {
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

/**
 * Pre-save middleware to update published date.
 * @param {Function} next - Callback to proceed with save.
 */
CourseContentSchema.pre("save", function (next) {
  if (
    this.isModified("metadata.status") &&
    this.metadata.status === "published" &&
    !this.metadata.publishedAt
  ) {
    this.metadata.publishedAt = new Date();
  }
  next();
});

// =============== METHODS =============
/**
 * Mark a lesson as completed for progress tracking.
 * @param {string} moduleId - ID of the module containing the lesson.
 * @param {string} lessonId - ID of the completed lesson.
 * @returns {Promise<Document>} Updated course content document.
 */
CourseContentSchema.methods.markLessonCompleted = function (moduleId, lessonId) {
  const module = this.modules.find((m) => m.id === moduleId);
  if (!module) {
    throw new Error("Module non trouvé");
  }

  if (!module.lessons.includes(lessonId)) {
    throw new Error("Leçon non trouvée dans ce module");
  }

  module.progressTracking.completedLessons += 1;
  module.progressTracking.lastAccessedAt = new Date();

  // Update overall progress
  this.progressTracking.completedLessons += 1;
  this.progressTracking.lastAccessedAt = new Date();

  return this.save();
};

/**
 * Add a new module to the course.
 * @param {Object} moduleData - Module data object.
 * @returns {Promise<Document>} Updated course content document.
 */
CourseContentSchema.methods.addModule = function (moduleData) {
  const newOrder = Math.max(...this.modules.map((m) => m.order), 0) + 1;

  const module = {
    ...moduleData,
    order: moduleData.order || newOrder,
    progressTracking: {
      completedLessons: 0,
      totalLessons: (moduleData.lessons || []).length,
    },
  };

  this.modules.push(module);
  this.modules.sort((a, b) => a.order - b.order);

  return this.save();
};

/**
 * Update course analytics with new engagement data.
 * @param {Object} analyticsData - Analytics data to update.
 * @returns {Promise<Document>} Updated course content document.
 */
CourseContentSchema.methods.updateAnalytics = function (analyticsData) {
  Object.assign(this.analytics, {
    ...analyticsData,
    lastViewedAt: new Date(),
  });

  if (analyticsData.view) {
    this.analytics.totalViews += 1;
  }

  return this.save();
};

/**
 * Get course statistics for analytics.
 * @returns {Object} Course statistics object.
 */
CourseContentSchema.methods.getStatistics = function () {
  return {
    totalModules: this.totalModules,
    totalExercises: this.totalExercises,
    completionPercentage: this.completionPercentage,
    averageModuleCompletion: this.averageModuleCompletion,
    estimatedHours: this.estimatedHours,
    enrollmentCount: this.analytics?.enrollmentCount || 0,
    completionRate: this.analytics?.completionRate || 0,
    averageRating: this.analytics?.averageRating || 0,
  };
};

/**
 * Archive the course content.
 * @param {string} reason - Reason for archiving.
 * @returns {Promise<Document>} Updated course content document.
 */
CourseContentSchema.methods.archive = function (reason = "") {
  this.isArchived = true;
  this.isActive = false;
  this.metadata.status = "archived";
  this.metadata.reviewNotes = reason;

  return this.save();
};

/**
 * CourseContent model for interacting with the CourseContent collection.
 * @type {mongoose.Model}
 */
module.exports = {
  CourseContent: model("CourseContent", CourseContentSchema),
};
