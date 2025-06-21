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
        message: "La difficulté doit être : easy, medium ou hard",
      },
      required: [true, "La difficulté est requise"],
      default: "medium",
    },

    // Temps estimé pour maîtriser ce sujet (en heures)
    estimatedTimeHours: {
      type: Number,
      min: [0.5, "Minimum 30 minutes"],
      max: [20, "Maximum 20 heures"],
      default: 2,
    },

    // =============== OBJECTIFS D'APPRENTISSAGE ===============
    learningObjectives: [
      {
        objective: {
          type: String,
          required: [true, "L'objectif d'apprentissage est requis"],
          trim: true,
          maxlength: [200, "L'objectif ne peut pas dépasser 200 caractères"],
        },
        level: {
          type: String,
          enum: {
            values: LEARNING_OBJECTIVES,
            message: "Niveau d'objectif invalide",
          },
          default: "understand",
        },
      },
    ],

    // =============== PRÉREQUIS ===============
    prerequisites: [
      {
        type: String,
        trim: true,
        maxlength: [100, "Le prérequis ne peut pas dépasser 100 caractères"],
      },
    ],

    // Sujets qui découlent de celui-ci
    nextTopics: [
      {
        type: Types.ObjectId,
        ref: "Topic",
      },
    ],

    // =============== CONTENU DISPONIBLE ===============
    hasQuestions: {
      type: Boolean,
      default: false,
    },

    hasResources: {
      type: Boolean,
      default: false,
    },

    hasExamples: {
      type: Boolean,
      default: false,
    },

    // =============== MOTS-CLÉS POUR RECHERCHE ===============
    keywords: [
      {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: [50, "Le mot-clé ne peut pas dépasser 50 caractères"],
      },
    ],

    // =============== STATISTIQUES ===============
    stats: {
      totalQuestions: {
        type: Number,
        default: 0,
        min: [0, "Ne peut pas être négatif"],
      },
      totalResources: {
        type: Number,
        default: 0,
        min: [0, "Ne peut pas être négatif"],
      },
      averageDifficulty: {
        type: Number,
        default: 0,
        min: [0, "Minimum 0"],
        max: [5, "Maximum 5"],
      },
      completionRate: {
        type: Number,
        default: 0,
        min: [0, "Minimum 0"],
        max: [100, "Maximum 100"],
      },
      averageScore: {
        type: Number,
        default: 0,
        min: [0, "Score minimum 0"],
        max: [100, "Score maximum 100"],
      },
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
