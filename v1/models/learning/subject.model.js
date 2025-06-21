const { Schema, model } = require("mongoose");
const {
  SUBJECT_CATEGORIES,
  EXAM_TYPES,
  COUNTRIES,
  EDUCATION_LEVELS,
} = require("../../constants");

const SubjectSchema = new Schema(
  {
    // =============== INFORMATIONS DE BASE ===============
    name: {
      type: String,
      required: [true, "Le nom de la matière est requis"],
      trim: true,
      maxlength: [100, "Le nom ne peut pas dépasser 100 caractères"],
    },

    code: {
      type: String,
      required: [true, "Le code de la matière est requis"],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [10, "Le code ne peut pas dépasser 10 caractères"],
      match: [
        /^[A-Z0-9]+$/,
        "Le code doit contenir uniquement des lettres majuscules et des chiffres",
      ],
    },

    description: {
      type: String,
      required: [true, "La description est requise"],
      maxlength: [500, "La description ne peut pas dépasser 500 caractères"],
    },

    // =============== CONTEXTE AFRICAIN ===============
    examTypes: [
      {
        type: String,
        enum: {
          values: EXAM_TYPES,
          message: "Type d'examen invalide",
        },
      },
    ],

    countries: [
      {
        type: String,
        enum: {
          values: COUNTRIES,
          message: "Pays invalide",
        },
      },
    ],

    educationLevels: [
      {
        type: String,
        enum: {
          values: EDUCATION_LEVELS,
          message: "Niveau d'éducation invalide",
        },
      },
    ],

    // Pour le système BAC francophone
    series: [
      {
        type: String,
        enum: SERIES, // A=Littéraire, C=Scientifique, D=Économique, ALL=Toutes séries
        uppercase: true,
        default: "ALL",
        required: [true, "La série est requise"],
      },
    ],

    // =============== ORGANISATION ===============
    category: {
      type: String,
      enum: {
        values: SUBJECT_CATEGORIES,
        message: "Catégorie invalide",
      },
      required: [true, "La catégorie est requise"],
    },

    // Icône pour l'interface utilisateur
    icon: {
      type: String,
      default: "📚",
      maxlength: [50, "L'icône ne peut pas dépasser 50 caractères"],
    },

    // Couleur pour l'interface (code hex)
    color: {
      type: String,
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Couleur hex invalide"],
      default: "#3B82F6",
    },

    // =============== MÉTADONNÉES ===============


    // Estimation du temps d'étude total (en heures)
    estimatedHours: {
      type: Number,
      min: [1, "Minimum 1 heure"],
      max: [500, "Maximum 500 heures"],
      default: 40,
    },

    // =============== STATISTIQUES ===============
    stats: {
      totalTopics: {
        type: Number,
        default: 0,
        min: [0, "Ne peut pas être négatif"],
      },
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
SubjectSchema.index({ examTypes: 1, countries: 1 });
SubjectSchema.index({ category: 1, isActive: 1 });

// =============== VIRTUELS ===============
SubjectSchema.virtual("displayName").get(function () {
  return `${this.name} (${this.code})`;
});

module.exports = { Subject: model("Subject", SubjectSchema) };
