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
    },
    description: {
      type: String,
      maxlength: [500, "La description ne peut pas dépasser 500 caractères"],
    },

    // =============== AFRIQUE-SPÉCIFIQUE ===============
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
    series: [String], // ["A", "C", "D"] for BAC system

    // =============== ORGANISATION SIMPLE ===============
    category: {
      type: String,
      enum: {
        values: SUBJECT_CATEGORIES,
        message: "Catégorie invalide",
      },
      required: [true, "La catégorie est requise"],
    },

    // =============== STATISTIQUES SIMPLES ===============
    stats: {
      totalTopics: { type: Number, default: 0 },
      totalQuestions: { type: Number, default: 0 },
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
