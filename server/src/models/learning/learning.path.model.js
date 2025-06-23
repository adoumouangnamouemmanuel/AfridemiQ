const { Schema, model, Types } = require("mongoose");
const {
  DIFFICULTY_LEVELS,
  LEARNING_PATH_REWARD_TYPES,
  LEARNING_PATH_STATUSES,
} = require("../../constants");

// =============== CONSTANTS =============
/**
 * Imported constants for difficulty levels and learning path configurations.
 * @see module:constants/index
 */

// =============== SUBSCHEMAS =============
/**
 * Subschema for remediation paths in adaptive learning.
 * @module RemediationPathSubSchema
 */
const RemediationPathSchema = new Schema({
  topicId: {
    type: Types.ObjectId,
    ref: "Topic",
    required: [true, "L'ID du sujet est requis"],
  },
  alternativeResources: {
    type: [{ type: Types.ObjectId, ref: "Resource" }],
    default: [],
    validate: {
      validator: function (arr) {
        return arr.length <= 20;
      },
      message: "Trop de ressources alternatives (maximum 20)",
    },
  },
  practiceExercises: {
    type: [{ type: Types.ObjectId, ref: "Question" }],
    default: [],
    validate: {
      validator: function (arr) {
        return arr.length <= 50;
      },
      message: "Trop d'exercices de pratique (maximum 50)",
    },
  },
});

/**
 * Subschema for adaptive learning configuration.
 * @module AdaptiveLearningSubSchema
 */
const AdaptiveLearningSchema = new Schema({
  difficultyAdjustment: {
    type: Boolean,
    default: false,
  },
  personalizedPacing: {
    type: Boolean,
    default: false,
  },
  adaptiveLearningId: {
    type: Types.ObjectId,
    ref: "AdaptiveLearning",
  },
  remediationPaths: {
    type: [RemediationPathSchema],
    default: [],
    validate: {
      validator: function (arr) {
        return arr.length <= 30;
      },
      message: "Trop de chemins de remédiation (maximum 30)",
    },
  },
});

/**
 * Subschema for milestone rewards.
 * @module RewardSubSchema
 */
const RewardSchema = new Schema({
  type: {
    type: String,
    enum: {
      values: LEARNING_PATH_REWARD_TYPES,
      message: "{VALUE} n'est pas un type de récompense valide",
    },
    required: [true, "Le type de récompense est requis"],
  },
  name: {
    type: String,
    required: function () {
      return this.type !== "points";
    },
    trim: true,
    maxlength: [
      100,
      "Le nom de la récompense ne peut pas dépasser 100 caractères",
    ],
  },
  points: {
    type: Number,
    required: function () {
      return this.type === "points";
    },
    min: [1, "Les points doivent être au moins 1"],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, "La description ne peut pas dépasser 500 caractères"],
  },
});

/**
 * Subschema for learning path milestones.
 * @module MilestoneSubSchema
 */
const MilestoneSchema = new Schema({
  name: {
    type: String,
    required: [true, "Le nom du jalon est requis"],
    trim: true,
    maxlength: [200, "Le nom ne peut pas dépasser 200 caractères"],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, "La description ne peut pas dépasser 1000 caractères"],
  },
  order: {
    type: Number,
    required: [true, "L'ordre du jalon est requis"],
    min: [1, "L'ordre doit être au moins 1"],
  },
  requiredAchievements: {
    type: [String],
    default: [],
    validate: {
      validator: function (arr) {
        return arr.length <= 10;
      },
      message: "Trop d'accomplissements requis (maximum 10)",
    },
  },
  reward: {
    type: RewardSchema,
    required: [true, "La récompense est requise"],
  },
  isUnlocked: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
  },
});

/**
 * Subschema for learning path levels.
 * @module LevelSubSchema
 */
const LevelSchema = new Schema({
  level: {
    type: Number,
    required: [true, "Le numéro de niveau est requis"],
    min: [1, "Le niveau doit être au moins 1"],
  },
  name: {
    type: String,
    required: [true, "Le nom du niveau est requis"],
    trim: true,
    maxlength: [200, "Le nom ne peut pas dépasser 200 caractères"],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, "La description ne peut pas dépasser 1000 caractères"],
  },
  difficulty: {
    type: String,
    enum: {
      values: DIFFICULTY_LEVELS,
      message: "{VALUE} n'est pas un niveau de difficulté valide",
    },
    required: [true, "La difficulté est requise"],
  },
  modules: {
    type: [{ type: Types.ObjectId, ref: "CourseContent" }],
    default: [],
    validate: {
      validator: function (arr) {
        return arr.length <= 20;
      },
      message: "Trop de modules (maximum 20)",
    },
  },
  prerequisites: {
    type: [{ type: Types.ObjectId, ref: "Topic" }],
    default: [],
    validate: {
      validator: function (arr) {
        return arr.length <= 15;
      },
      message: "Trop de prérequis (maximum 15)",
    },
  },
  expectedOutcomes: {
    type: [String],
    default: [],
    validate: {
      validator: function (arr) {
        return arr.length <= 10;
      },
      message: "Trop de résultats attendus (maximum 10)",
    },
  },
  estimatedDuration: {
    type: Number,
    min: [1, "La durée estimée doit être au moins 1 jour"],
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
  },
});

/**
 * Subschema for learning path metadata.
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
  status: {
    type: String,
    enum: {
      values: LEARNING_PATH_STATUSES,
      message: "{VALUE} n'est pas un statut valide",
    },
    default: "draft",
  },
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: function (arr) {
        return arr.length <= 15;
      },
      message: "Trop de tags (maximum 15)",
    },
  },
  publishedAt: {
    type: Date,
  },
  lastModified: {
    type: Date,
    default: Date.now,
  },
});

// ==================== SCHEMA ==================
/**
 * Mongoose schema for learning paths, organizing structured educational journeys.
 * @module LearningPathSchema
 */
const LearningPathSchema = new Schema(
  {
    // Path identification
    name: {
      type: String,
      required: [true, "Le nom est requis"],
      trim: true,
      maxlength: [200, "Le nom ne peut pas dépasser 200 caractères"],
      index: true,
    },
    description: {
      type: String,
      required: [true, "La description est requise"],
      trim: true,
      maxlength: [2000, "La description ne peut pas dépasser 2000 caractères"],
    },
    // Path configuration
    targetExam: {
      type: Types.ObjectId,
      ref: "Exam",
      required: [true, "L'examen cible est requis"],
      index: true,
    },
    targetSeries: {
      type: [String],
      default: ["D"],
      validate: {
        validator: function (arr) {
          return arr.every((s) => s && s.trim().length > 0);
        },
        message: "Toutes les séries doivent avoir au moins 1 caractère",
      },
    },
    duration: {
      type: Number,
      required: [true, "La durée est requise"],
      min: [1, "La durée doit être au moins 1 semaine"],
    },
    // Path structure
    levels: {
      type: [LevelSchema],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 10;
        },
        message: "Trop de niveaux (maximum 10)",
      },
    },
    milestones: {
      type: [MilestoneSchema],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 20;
        },
        message: "Trop de jalons (maximum 20)",
      },
    },
    // Adaptive learning features
    adaptiveLearning: {
      type: AdaptiveLearningSchema,
      default: () => ({}),
    },
    // Path settings
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    // Analytics
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
      averageCompletionTime: {
        type: Number,
        default: 0,
        min: [0, "Le temps de complétion moyen ne peut pas être négatif"],
      },
      totalViews: {
        type: Number,
        default: 0,
        min: [0, "Le nombre total de vues ne peut pas être négatif"],
      },
    },
    // Path metadata
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
LearningPathSchema.index({ targetExam: 1, targetSeries: 1 });
LearningPathSchema.index({ "levels.level": 1 });
LearningPathSchema.index({ "levels.difficulty": 1 });
LearningPathSchema.index({ "metadata.status": 1 });
LearningPathSchema.index({ "metadata.tags": 1 }, { sparse: true });
LearningPathSchema.index({ isActive: 1, isPublic: 1 });
LearningPathSchema.index({ name: "text", description: "text" });
LearningPathSchema.index({ createdAt: -1 });
LearningPathSchema.index({ "analytics.completionRate": -1 }, { sparse: true });

// =============== VIRTUALS =============
/**
 * Virtual field for total number of levels.
 * @returns {number} Number of levels in the learning path.
 */
LearningPathSchema.virtual("totalLevels").get(function () {
  return (this.levels ?? []).length;
});

/**
 * Virtual field for total number of milestones.
 * @returns {number} Number of milestones in the learning path.
 */
LearningPathSchema.virtual("totalMilestones").get(function () {
  return (this.milestones ?? []).length;
});

/**
 * Virtual field for completion percentage based on completed levels.
 * @returns {number} Percentage of completed levels.
 */
LearningPathSchema.virtual("completionPercentage").get(function () {
  const levels = this.levels ?? [];
  if (levels.length === 0) return 0;
  const completedLevels = levels.filter((level) => level.isCompleted).length;
  return Math.round((completedLevels / levels.length) * 100);
});

/**
 * Virtual field for total number of modules across all levels.
 * @returns {number} Total number of modules.
 */
LearningPathSchema.virtual("totalModules").get(function () {
  return (this.levels ?? []).reduce((total, level) => {
    return total + (level.modules ?? []).length;
  }, 0);
});

/**
 * Virtual field for estimated duration in hours.
 * @returns {number} Estimated duration in hours.
 */
LearningPathSchema.virtual("estimatedHours").get(function () {
  return this.duration ? this.duration * 7 * 2 : 0; // assuming 2 hours per day
});

/**
 * Virtual field for current level based on completion.
 * @returns {Object|null} Current level object or null.
 */
LearningPathSchema.virtual("currentLevel").get(function () {
  const levels = this.levels ?? [];
  return (
    levels.find((level) => !level.isCompleted) ||
    levels[levels.length - 1] ||
    null
  );
});

/**
 * Virtual field for next milestone.
 * @returns {Object|null} Next milestone object or null.
 */
LearningPathSchema.virtual("nextMilestone").get(function () {
  const milestones = this.milestones ?? [];
  return milestones.find((milestone) => !milestone.isUnlocked) || null;
});

// =============== MIDDLEWARE =============
/**
 * Pre-save middleware to validate references and update metadata.
 * @param {Function} next - Callback to proceed with save.
 */
LearningPathSchema.pre("save", async function (next) {
  try {
    // Validate targetExam
    if (this.targetExam) {
      const exam = await model("Exam").findById(this.targetExam);
      if (!exam) {
        return next(new Error("ID d'examen invalide"));
      }
    }

    // Validate levels modules and prerequisites
    for (const level of this.levels ?? []) {
      if (level.modules?.length > 0) {
        const modules = await model("CourseContent").find({
          _id: { $in: level.modules },
        });
        if (modules.length !== level.modules.length) {
          return next(new Error("Un ou plusieurs IDs de module invalides"));
        }
      }
      if (level.prerequisites?.length > 0) {
        const topics = await model("Topic").find({
          _id: { $in: level.prerequisites },
        });
        if (topics.length !== level.prerequisites.length) {
          return next(new Error("Un ou plusieurs IDs de prérequis invalides"));
        }
      }
    }

    // Validate remediation paths
    for (const path of this.adaptiveLearning?.remediationPaths ?? []) {
      if (path.topicId) {
        const topic = await model("Topic").findById(path.topicId);
        if (!topic) {
          return next(
            new Error("ID de sujet invalide dans le chemin de remédiation")
          );
        }
      }
      if (path.alternativeResources?.length > 0) {
        const resources = await model("Resource").find({
          _id: { $in: path.alternativeResources },
        });
        if (resources.length !== path.alternativeResources.length) {
          return next(new Error("Un ou plusieurs IDs de ressource invalides"));
        }
      }
      if (path.practiceExercises?.length > 0) {
        const questions = await model("Question").find({
          _id: { $in: path.practiceExercises },
        });
        if (questions.length !== path.practiceExercises.length) {
          return next(new Error("Un ou plusieurs IDs de question invalides"));
        }
      }
    }

    // Validate adaptiveLearningId
    if (this.adaptiveLearning?.adaptiveLearningId) {
      const adaptive = await model("AdaptiveLearning").findById(
        this.adaptiveLearning.adaptiveLearningId
      );
      if (!adaptive) {
        return next(new Error("ID d'apprentissage adaptatif invalide"));
      }
    }

    // Update metadata
    if (this.isModified() && !this.isNew) {
      this.metadata.version += 1;
      this.metadata.lastModified = new Date();
    }

    // Sort levels and milestones by order
    if (this.levels?.length > 0) {
      this.levels.sort((a, b) => a.level - b.level);
    }
    if (this.milestones?.length > 0) {
      this.milestones.sort((a, b) => a.order - b.order);
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
LearningPathSchema.pre("save", function (next) {
  if (
    this.isModified("metadata.status") &&
    this.metadata.status === "active" &&
    !this.metadata.publishedAt
  ) {
    this.metadata.publishedAt = new Date();
  }
  next();
});

// =============== METHODS =============
/**
 * Complete a level and unlock the next one.
 * @param {number} levelNumber - Level number to complete.
 * @returns {Promise<Document>} Updated learning path document.
 */
LearningPathSchema.methods.completeLevel = function (levelNumber) {
  const level = this.levels.find((l) => l.level === levelNumber);
  if (!level) {
    throw new Error("Niveau non trouvé");
  }

  level.isCompleted = true;
  level.completedAt = new Date();

  return this.save();
};

/**
 * Unlock a milestone.
 * @param {string} milestoneName - Name of the milestone to unlock.
 * @returns {Promise<Document>} Updated learning path document.
 */
LearningPathSchema.methods.unlockMilestone = function (milestoneName) {
  const milestone = this.milestones.find((m) => m.name === milestoneName);
  if (!milestone) {
    throw new Error("Jalon non trouvé");
  }

  milestone.isUnlocked = true;
  milestone.completedAt = new Date();

  return this.save();
};

/**
 * Add a new level to the learning path.
 * @param {Object} levelData - Level data object.
 * @returns {Promise<Document>} Updated learning path document.
 */
LearningPathSchema.methods.addLevel = function (levelData) {
  const newLevelNumber = Math.max(...this.levels.map((l) => l.level), 0) + 1;

  const level = {
    ...levelData,
    level: levelData.level || newLevelNumber,
  };

  this.levels.push(level);
  this.levels.sort((a, b) => a.level - b.level);

  return this.save();
};

/**
 * Update learning path analytics.
 * @param {Object} analyticsData - Analytics data to update.
 * @returns {Promise<Document>} Updated learning path document.
 */
LearningPathSchema.methods.updateAnalytics = function (analyticsData) {
  Object.assign(this.analytics, analyticsData);

  if (analyticsData.view) {
    this.analytics.totalViews += 1;
  }

  return this.save();
};

/**
 * Get learning path statistics.
 * @returns {Object} Learning path statistics object.
 */
LearningPathSchema.methods.getStatistics = function () {
  return {
    totalLevels: this.totalLevels,
    totalMilestones: this.totalMilestones,
    totalModules: this.totalModules,
    completionPercentage: this.completionPercentage,
    estimatedHours: this.estimatedHours,
    enrollmentCount: this.analytics?.enrollmentCount || 0,
    completionRate: this.analytics?.completionRate || 0,
    averageCompletionTime: this.analytics?.averageCompletionTime || 0,
  };
};

/**
 * Archive the learning path.
 * @param {string} reason - Reason for archiving.
 * @returns {Promise<Document>} Updated learning path document.
 */
LearningPathSchema.methods.archive = function (reason = "") {
  this.isActive = false;
  this.metadata.status = "archived";
  this.metadata.reviewNotes = reason;

  return this.save();
};

/**
 * LearningPath model for interacting with the LearningPath collection.
 * @type {mongoose.Model}
 */
module.exports = {
  LearningPath: model("LearningPath", LearningPathSchema),
};
