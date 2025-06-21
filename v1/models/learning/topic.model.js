const { Schema, model, Types } = require("mongoose");
const {
  DIFFICULTY_LEVELS,
  LEARNING_OBJECTIVES,
  STATUSES,
} = require("../../constants");

const TopicSchema = new Schema(
  {
    // =============== INFORMATIONS DE BASE ===============
    name: {
      type: String,
      required: [true, "Le nom du sujet est requis"],
      trim: true,
      maxlength: [150, "Le nom ne peut pas dépasser 150 caractères"],
    },

    description: {
      type: String,
      required: [true, "La description est requise"],
      maxlength: [500, "La description ne peut pas dépasser 500 caractères"],
    },

    // =============== RELATIONS ===============
    subjectId: {
      type: Types.ObjectId,
      ref: "Subject",
      required: [true, "L'ID de la matière est requis"],
      index: true,
    },

    // =============== ORGANISATION ===============
    order: {
      type: Number,
      default: 0,
      min: [0, "L'ordre ne peut pas être négatif"],
    },
    difficulty: {
      type: String,
      enum: {
        values: DIFFICULTY_LEVELS,
        message: "La difficulté doit être : facile, moyen ou difficile",
      },
      default: "medium",
    },

    // =============== OBJECTIFS D'APPRENTISSAGE SIMPLES ===============
    learningObjectives: [
      {
        objective: {
          type: String,
          required: [true, "L'objectif d'apprentissage est requis"],
          maxlength: [200, "L'objectif ne peut pas dépasser 200 caractères"],
        },
        level: {
          type: String,
          enum: LEARNING_OBJECTIVES,
          default: "understand",
        },
      },
    ],

    // =============== PRÉREQUIS SIMPLES ===============
    // Simple Prerequisites
    prerequisites: [String], // Simple array of topic names

    // Flags for Available Content
    hasQuestions: { type: Boolean, default: false },
    hasResources: { type: Boolean, default: false },

    // =============== STATISTIQUES SIMPLES ===============
    stats: {
      totalQuestions: { type: Number, default: 0 },
      averageDifficulty: { type: Number, default: 0, min: 0, max: 5 },
      completionRate: { type: Number, default: 0, min: 0, max: 100 },
    },

    // =============== GESTION ===============
    isActive: { type: Boolean, default: true },
    isPremium: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// =============== INDEX ===============
TopicSchema.index({ subjectId: 1, order: 1 });
TopicSchema.index({ difficulty: 1, isActive: 1 });
TopicSchema.index({ prerequisites: 1 });

// =============== VALIDATION ===============
TopicSchema.path("learningObjectives").validate({
  validator: function (v) {
    return v && v.length > 0;
  },
  message: "Au moins un objectif d'apprentissage est requis",
});

// =============== VIRTUELS ===============
TopicSchema.virtual("prerequisitesCount").get(function () {
  return this.prerequisites ? this.prerequisites.length : 0;
});

TopicSchema.virtual("difficultyLevel").get(function () {
  const levels = { easy: 1, medium: 2, hard: 3 };
  return levels[this.difficulty] || 2;
});

module.exports = { Topic: model("Topic", TopicSchema) };
