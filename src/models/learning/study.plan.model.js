const { Schema, model, Types } = require("mongoose");
const {
  STUDY_GROUP_DAYS,
  STUDY_PLAN_PRIORITIES,
  STUDY_PLAN_EXERCISE_TYPES,
  STUDY_PLAN_ASSESSMENT_TYPES,
  STUDY_PLAN_REMINDER_TYPES,
  STUDY_PLAN_REMINDER_REPEAT,
  STUDY_PLAN_REMINDER_STATUSES,
  STUDY_PLAN_STATUSES,
} = require("../../constants");

// =============== CONSTANTS =============
/**
 * Imported constants for study plan priorities, types, and statuses.
 * @see module:constants/index
 */

// =============== SUBSCHEMAS =============
/**
 * Subschema for break periods in daily goals.
 * @module BreakSubSchema
 */
const BreakSchema = new Schema({
  startTime: {
    type: String,
    match: [
      /^([01]\d|2[0-3]):[0-5]\d$/,
      "Format d'heure invalide (utilisez HH:mm)",
    ],
    required: [true, "L'heure de début est requise"],
  },
  endTime: {
    type: String,
    match: [
      /^([01]\d|2[0-3]):[0-5]\d$/,
      "Format d'heure invalide (utilisez HH:mm)",
    ],
    required: [true, "L'heure de fin est requise"],
  },
  duration: {
    type: Number,
    min: [1, "La durée doit être au moins 1 minute"],
    required: [true, "La durée est requise"],
  },
  type: {
    type: String,
    enum: ["short", "long", "meal"],
    default: "short",
  },
});

/**
 * Subschema for exercise assignments in daily goals.
 * @module ExerciseSubSchema
 */
const ExerciseSchema = new Schema({
  exerciseId: {
    type: Types.ObjectId,
    ref: "Question",
    required: [true, "L'ID de l'exercice est requis"],
  },
  count: {
    type: Number,
    min: [1, "Le nombre doit être au moins 1"],
    required: [true, "Le nombre est requis"],
  },
  type: {
    type: String,
    enum: {
      values: STUDY_PLAN_EXERCISE_TYPES,
      message: "{VALUE} n'est pas un type d'exercice valide",
    },
    required: [true, "Le type est requis"],
  },
  timeAllocated: {
    type: Number,
    min: [1, "Le temps alloué doit être au moins 1 minute"],
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
 * Subschema for topic assignments in daily goals.
 * @module TopicSubSchema
 */
const TopicSchema = new Schema({
  topicId: {
    type: Types.ObjectId,
    ref: "Topic",
    required: [true, "L'ID du sujet est requis"],
  },
  duration: {
    type: Number,
    min: [1, "La durée doit être au moins 1 minute"],
    required: [true, "La durée est requise"],
  },
  priority: {
    type: String,
    enum: {
      values: STUDY_PLAN_PRIORITIES,
      message: "{VALUE} n'est pas une priorité valide",
    },
    required: [true, "La priorité est requise"],
  },
  objectives: {
    type: [String],
    default: [],
    validate: {
      validator: function (arr) {
        return arr.length <= 5;
      },
      message: "Trop d'objectifs (maximum 5)",
    },
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
  },
  actualTimeSpent: {
    type: Number,
    min: [0, "Le temps passé ne peut pas être négatif"],
    default: 0,
  },
});

/**
 * Subschema for daily goals configuration.
 * @module DailyGoalSubSchema
 */
const DailyGoalSchema = new Schema({
  date: {
    type: Date,
    required: [true, "La date est requise"],
  },
  topics: {
    type: [TopicSchema],
    default: [],
    validate: {
      validator: function (arr) {
        return arr.length <= 10;
      },
      message: "Trop de sujets par jour (maximum 10)",
    },
  },
  exercises: {
    type: [ExerciseSchema],
    default: [],
    validate: {
      validator: function (arr) {
        return arr.length <= 20;
      },
      message: "Trop d'exercices par jour (maximum 20)",
    },
  },
  breaks: {
    type: [BreakSchema],
    default: [],
    validate: {
      validator: function (arr) {
        return arr.length <= 8;
      },
      message: "Trop de pauses par jour (maximum 8)",
    },
  },
  totalPlannedTime: {
    type: Number,
    min: [0, "Le temps planifié total ne peut pas être négatif"],
    default: 0,
  },
  actualTimeSpent: {
    type: Number,
    min: [0, "Le temps réel passé ne peut pas être négatif"],
    default: 0,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  completionPercentage: {
    type: Number,
    min: [0, "Le pourcentage de complétion ne peut pas être négatif"],
    max: [100, "Le pourcentage de complétion ne peut pas dépasser 100"],
    default: 0,
  },
});

/**
 * Subschema for weekly review configuration.
 * @module WeeklyReviewSubSchema
 */
const WeeklyReviewSchema = new Schema({
  day: {
    type: String,
    enum: {
      values: STUDY_GROUP_DAYS,
      message: "{VALUE} n'est pas un jour valide",
    },
    required: [true, "Le jour est requis"],
  },
  topics: {
    type: [{ type: Types.ObjectId, ref: "Topic" }],
    default: [],
    validate: {
      validator: function (arr) {
        return arr.length <= 15;
      },
      message: "Trop de sujets à réviser (maximum 15)",
    },
  },
  assessmentType: {
    type: String,
    enum: {
      values: STUDY_PLAN_ASSESSMENT_TYPES,
      message: "{VALUE} n'est pas un type d'évaluation valide",
    },
    required: [true, "Le type d'évaluation est requis"],
  },
  duration: {
    type: Number,
    min: [30, "La durée doit être au moins 30 minutes"],
    default: 120,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

/**
 * Subschema for progress tracking.
 * @module ProgressTrackingSubSchema
 */
const ProgressTrackingSchema = new Schema({
  completedTopics: {
    type: [{ type: Types.ObjectId, ref: "Topic" }],
    default: [],
  },
  weakAreas: {
    type: [{ type: Types.ObjectId, ref: "Topic" }],
    default: [],
  },
  strongAreas: {
    type: [{ type: Types.ObjectId, ref: "Topic" }],
    default: [],
  },
  adjustmentNeeded: {
    type: Boolean,
    default: false,
  },
  lastAdjusted: {
    type: Date,
  },
  overallProgress: {
    type: Number,
    min: [0, "Le progrès global ne peut pas être négatif"],
    max: [100, "Le progrès global ne peut pas dépasser 100"],
    default: 0,
  },
  averageCompletionRate: {
    type: Number,
    min: [0, "Le taux de complétion moyen ne peut pas être négatif"],
    max: [100, "Le taux de complétion moyen ne peut pas dépasser 100"],
    default: 0,
  },
});

/**
 * Subschema for study plan reminders.
 * @module ReminderSubSchema
 */
const ReminderSchema = new Schema(
  {
    type: {
      type: String,
      enum: {
        values: STUDY_PLAN_REMINDER_TYPES,
        message: "{VALUE} n'est pas un type de rappel valide",
      },
      required: [true, "Le type de rappel est requis"],
    },
    time: {
      type: String,
      match: [
        /^([01]\d|2[0-3]):[0-5]\d$/,
        "Format d'heure invalide (utilisez HH:mm)",
      ],
      required: [true, "L'heure est requise"],
    },
    message: {
      type: String,
      trim: true,
      required: [true, "Le message est requis"],
      maxlength: [200, "Le message ne peut pas dépasser 200 caractères"],
    },
    repeat: {
      type: String,
      enum: {
        values: STUDY_PLAN_REMINDER_REPEAT,
        message: "{VALUE} n'est pas une fréquence de répétition valide",
      },
      required: [true, "La fréquence de répétition est requise"],
    },
    status: {
      type: String,
      enum: {
        values: STUDY_PLAN_REMINDER_STATUSES,
        message: "{VALUE} n'est pas un statut de rappel valide",
      },
      default: "active",
    },
    daysOfWeek: {
      type: [String],
      enum: {
        values: STUDY_GROUP_DAYS,
        message: "{VALUE} n'est pas un jour valide",
      },
      default: [],
    },
    lastTriggered: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Subschema for study plan metadata.
 * @module MetadataSubSchema
 */
const MetadataSchema = new Schema({
  createdBy: {
    type: Types.ObjectId,
    ref: "User",
    required: [true, "Le créateur est requis"],
  },
  lastModified: {
    type: Date,
    default: Date.now,
  },
  version: {
    type: Number,
    default: 1,
    min: [1, "La version doit être au moins 1"],
  },
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: function (arr) {
        return arr.length <= 10;
      },
      message: "Trop de tags (maximum 10)",
    },
  },
  difficulty: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    default: "intermediate",
  },
  estimatedCompletionTime: {
    type: Number,
    min: [1, "Le temps de complétion estimé doit être au moins 1 jour"],
  },
});

// ==================== SCHEMA ==================
/**
 * Mongoose schema for study plans, organizing personalized learning schedules.
 * @module StudyPlanSchema
 */
const StudyPlanSchema = new Schema(
  {
    // Plan identification
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "L'ID de l'utilisateur est requis"],
      unique: true,
      index: true,
    },
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
    // Plan schedule
    startDate: {
      type: Date,
      required: [true, "La date de début est requise"],
    },
    endDate: {
      type: Date,
      required: [true, "La date de fin est requise"],
    },
    adaptiveLearningId: {
      type: Types.ObjectId,
      ref: "AdaptiveLearning",
    },
    // Plan structure
    dailyGoals: {
      type: [DailyGoalSchema],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 365;
        },
        message: "Trop d'objectifs quotidiens (maximum 365)",
      },
    },
    weeklyReview: {
      type: WeeklyReviewSchema,
      required: true,
    },
    // Plan progress
    progressTracking: {
      type: ProgressTrackingSchema,
      default: () => ({}),
    },
    // Plan settings
    reminders: {
      type: [ReminderSchema],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 20;
        },
        message: "Trop de rappels (maximum 20)",
      },
    },
    status: {
      type: String,
      enum: {
        values: STUDY_PLAN_STATUSES,
        message: "{VALUE} n'est pas un statut valide",
      },
      default: "active",
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Plan metadata
    metadata: {
      type: MetadataSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// =============== INDEXES =================
StudyPlanSchema.index({ userId: 1, "dailyGoals.topics.topicId": 1 });
StudyPlanSchema.index({ targetExam: 1 });
StudyPlanSchema.index({ "dailyGoals.date": 1 });
StudyPlanSchema.index({ startDate: 1, endDate: 1 });
StudyPlanSchema.index({ "metadata.tags": 1 }, { sparse: true });
StudyPlanSchema.index({ status: 1, isActive: 1 });

// =============== VIRTUALS =============
/**
 * Virtual field for total number of daily goals.
 * @returns {number} Number of daily goals in the plan.
 */
StudyPlanSchema.virtual("totalDays").get(function () {
  return (this.dailyGoals ?? []).length;
});

/**
 * Virtual field for completed daily goals count.
 * @returns {number} Number of completed daily goals.
 */
StudyPlanSchema.virtual("completedDays").get(function () {
  return (this.dailyGoals ?? []).filter((goal) => goal.isCompleted).length;
});

/**
 * Virtual field for overall completion percentage.
 * @returns {number} Percentage of completed daily goals.
 */
StudyPlanSchema.virtual("completionPercentage").get(function () {
  const total = this.totalDays;
  if (total === 0) return 0;
  return Math.round((this.completedDays / total) * 100);
});

/**
 * Virtual field for total planned study time across all days.
 * @returns {number} Total planned time in minutes.
 */
StudyPlanSchema.virtual("totalPlannedTime").get(function () {
  return (this.dailyGoals ?? []).reduce((total, goal) => {
    return total + (goal.totalPlannedTime || 0);
  }, 0);
});

/**
 * Virtual field for total actual study time across all days.
 * @returns {number} Total actual time spent in minutes.
 */
StudyPlanSchema.virtual("totalActualTime").get(function () {
  return (this.dailyGoals ?? []).reduce((total, goal) => {
    return total + (goal.actualTimeSpent || 0);
  }, 0);
});

/**
 * Virtual field for plan duration in days.
 * @returns {number} Duration between start and end dates.
 */
StudyPlanSchema.virtual("planDuration").get(function () {
  if (!this.startDate || !this.endDate) return 0;
  const diffTime = Math.abs(this.endDate - this.startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

/**
 * Virtual field for remaining days in the plan.
 * @returns {number} Number of days remaining.
 */
StudyPlanSchema.virtual("remainingDays").get(function () {
  if (!this.endDate) return 0;
  const today = new Date();
  const diffTime = this.endDate - today;
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
});

// =============== MIDDLEWARE =============
/**
 * Pre-save middleware to validate references and update metadata.
 * @param {Function} next - Callback to proceed with save.
 */
StudyPlanSchema.pre("save", async function (next) {
  try {
    // Validate userId and targetExam
    const [user, exam] = await Promise.all([
      model("User").findById(this.userId),
      model("Exam").findById(this.targetExam),
    ]);
    if (!user) {
      return next(new Error("ID utilisateur invalide"));
    }
    if (!exam) {
      return next(new Error("ID d'examen invalide"));
    }

    // Validate adaptiveLearningId
    if (this.adaptiveLearningId) {
      const adaptive = await model("AdaptiveLearning").findById(
        this.adaptiveLearningId
      );
      if (!adaptive) {
        return next(new Error("ID d'apprentissage adaptatif invalide"));
      }
    }

    // Validate startDate < endDate
    if (this.startDate >= this.endDate) {
      return next(
        new Error("La date de début doit être antérieure à la date de fin")
      );
    }

    // Validate dailyGoals
    for (const goal of this.dailyGoals) {
      if (goal.date < this.startDate || goal.date > this.endDate) {
        return next(
          new Error("dailyGoals.date must be within startDate and endDate")
        );
      }
      if (goal.topics.length > 0) {
        const topics = await model("Topic").find({
          _id: { $in: goal.topics.map((t) => t.topicId) },
        });
        if (topics.length !== goal.topics.length) {
          return next(new Error("One or more invalid topic IDs in dailyGoals"));
        }
      }
      if (goal.exercises.length > 0) {
        const questions = await model("Question").find({
          _id: { $in: goal.exercises.map((e) => e.exerciseId) },
        });
        if (questions.length !== goal.exercises.length) {
          return next(
            new Error("One or more invalid exercise IDs in dailyGoals")
          );
        }
      }
    }

    // Validate weeklyReview.topics
    if (this.weeklyReview.topics.length > 0) {
      const topics = await model("Topic").find({
        _id: { $in: this.weeklyReview.topics },
      });
      if (topics.length !== this.weeklyReview.topics.length) {
        return next(new Error("One or more invalid topic IDs in weeklyReview"));
      }
    }

    // Validate progressTracking
    const progressTopics = [
      ...this.progressTracking.completedTopics,
      ...this.progressTracking.weakAreas,
      ...this.progressTracking.strongAreas,
    ];
    if (progressTopics.length > 0) {
      const topics = await model("Topic").find({
        _id: { $in: progressTopics },
      });
      if (topics.length !== progressTopics.length) {
        return next(
          new Error("One or more invalid topic IDs in progressTracking")
        );
      }
    }

    // Update metadata
    if (this.isModified() && !this.isNew) {
      this.metadata.version += 1;
      this.metadata.lastModified = new Date();
    }

    // Calculate estimated completion time
    if (!this.metadata.estimatedCompletionTime) {
      this.metadata.estimatedCompletionTime = this.planDuration;
    }

    // Update overall progress
    this.progressTracking.overallProgress = this.completionPercentage;

    next();
  } catch (error) {
    next(error);
  }
});

// =============== METHODS =============
/**
 * Mark a daily goal as completed.
 * @param {Date} date - Date of the goal to complete.
 * @returns {Promise<Document>} Updated study plan document.
 */
StudyPlanSchema.methods.completeDailyGoal = function (date) {
  const goal = this.dailyGoals.find(
    (g) => g.date.toDateString() === new Date(date).toDateString()
  );

  if (!goal) {
    throw new Error("Objectif quotidien non trouvé pour cette date");
  }

  goal.isCompleted = true;
  goal.completionPercentage = 100;

  return this.save();
};

/**
 * Add a new daily goal to the plan.
 * @param {Object} goalData - Daily goal data object.
 * @returns {Promise<Document>} Updated study plan document.
 */
StudyPlanSchema.methods.addDailyGoal = function (goalData) {
  const existingGoal = this.dailyGoals.find(
    (g) => g.date.toDateString() === new Date(goalData.date).toDateString()
  );

  if (existingGoal) {
    throw new Error("Un objectif existe déjà pour cette date");
  }

  this.dailyGoals.push(goalData);
  this.dailyGoals.sort((a, b) => new Date(a.date) - new Date(b.date));

  return this.save();
};

/**
 * Update progress tracking with new data.
 * @param {Object} progressData - Progress data to update.
 * @returns {Promise<Document>} Updated study plan document.
 */
StudyPlanSchema.methods.updateProgress = function (progressData) {
  Object.assign(this.progressTracking, {
    ...progressData,
    overallProgress: this.completionPercentage,
  });

  if (progressData.adjustmentNeeded) {
    this.progressTracking.lastAdjusted = new Date();
  }

  return this.save();
};

/**
 * Pause the study plan.
 * @param {string} reason - Reason for pausing.
 * @returns {Promise<Document>} Updated study plan document.
 */
StudyPlanSchema.methods.pause = function (reason = "") {
  this.status = "paused";
  this.isActive = false;
  this.metadata.lastModified = new Date();

  return this.save();
};

/**
 * Resume the study plan.
 * @returns {Promise<Document>} Updated study plan document.
 */
StudyPlanSchema.methods.resume = function () {
  this.status = "active";
  this.isActive = true;
  this.metadata.lastModified = new Date();

  return this.save();
};

/**
 * Get study plan statistics.
 * @returns {Object} Study plan statistics object.
 */
StudyPlanSchema.methods.getStatistics = function () {
  return {
    totalDays: this.totalDays,
    completedDays: this.completedDays,
    completionPercentage: this.completionPercentage,
    totalPlannedTime: this.totalPlannedTime,
    totalActualTime: this.totalActualTime,
    planDuration: this.planDuration,
    remainingDays: this.remainingDays,
    overallProgress: this.progressTracking?.overallProgress || 0,
    averageCompletionRate: this.progressTracking?.averageCompletionRate || 0,
  };
};

/**
 * StudyPlan model for interacting with the StudyPlan collection.
 * @type {mongoose.Model}
 */
module.exports = {
  StudyPlan: model("StudyPlan", StudyPlanSchema),
};
