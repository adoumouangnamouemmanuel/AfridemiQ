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
    status: {
      type: String,
      enum: {
        values: STATUSES,
        message: "Statut invalide",
      },
      default: "active",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isPremium: {
      type: Boolean,
      default: false,
    },

    isFeatured: {
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

// =============== INDEX ===============
SubjectSchema.index({ examTypes: 1, countries: 1, educationLevels: 1 });
SubjectSchema.index({ category: 1, isActive: 1 });
SubjectSchema.index({ code: 1 }, { unique: true });
SubjectSchema.index({ isFeatured: 1, isActive: 1 });
SubjectSchema.index({ "stats.totalStudents": -1 });

// =============== VALIDATION ===============
SubjectSchema.pre("validate", function (next) {
  // Au moins un niveau d'éducation requis
  if (!this.educationLevels || this.educationLevels.length === 0) {
    return next(new Error("Au moins un niveau d'éducation est requis"));
  }

  // Au moins un pays requis
  if (!this.countries || this.countries.length === 0) {
    return next(new Error("Au moins un pays est requis"));
  }

  next();
});

// =============== VIRTUELS ===============
SubjectSchema.virtual("displayName").get(function () {
  return `${this.name} (${this.code})`;
});

SubjectSchema.virtual("popularity").get(function () {
  return this.stats.totalStudents * 0.6 + this.stats.totalQuestions * 0.4;
});

SubjectSchema.virtual("completionRate").get(function () {
  if (this.stats.totalTopics === 0) return 0;
  return Math.round((this.stats.averageScore / 100) * 100);
});

// =============== MÉTHODES ===============
SubjectSchema.methods.updateStats = function (field, increment = 1) {
  if (this.stats[field] !== undefined) {
    this.stats[field] += increment;
  }
  return this.save();
};

SubjectSchema.methods.addStudent = function () {
  this.stats.totalStudents += 1;
  return this.save();
};

// =============== MÉTHODES STATIQUES ===============
SubjectSchema.statics.findByEducationAndCountry = function (
  educationLevel,
  country
) {
  return this.find({
    educationLevels: educationLevel,
    countries: country,
    isActive: true,
    status: "active",
  });
};

SubjectSchema.statics.findByExamType = function (examType, educationLevel) {
  const query = {
    examTypes: examType,
    isActive: true,
    status: "active",
  };

  if (educationLevel) {
    query.educationLevels = educationLevel;
  }

  return this.find(query);
};

SubjectSchema.statics.getFeatured = function (limit = 6) {
  return this.find({
    isFeatured: true,
    isActive: true,
    status: "active",
  })
    .sort({ "stats.totalStudents": -1 })
    .limit(limit);
};

SubjectSchema.statics.getPopular = function (limit = 10) {
  return this.find({
    isActive: true,
    status: "active",
  })
    .sort({ "stats.totalStudents": -1, "stats.averageScore": -1 })
    .limit(limit);
};

module.exports = { Subject: model("Subject", SubjectSchema) };
