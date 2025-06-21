const { Schema, model, Types } = require("mongoose");
const {
  QUIZ_FORMATS,
  DIFFICULTY_LEVELS,
  EDUCATION_LEVELS,
  EXAM_TYPES,
  STATUSES,
} = require("../../constants");

const QuizSchema = new Schema(
  {
    // =============== INFORMATIONS DE BASE ===============
    title: {
      type: String,
      required: [true, "Le titre est requis"],
      trim: true,
      maxlength: [200, "Le titre ne peut pas dépasser 200 caractères"],
    },

    description: {
      type: String,
      maxlength: [500, "La description ne peut pas dépasser 500 caractères"],
    },

    format: {
      type: String,
      enum: {
        values: QUIZ_FORMATS,
        message: "Format de quiz invalide",
      },
      default: "practice",
    },

    // =============== CONTENU ===============
    subjectId: {
      type: Types.ObjectId,
      ref: "Subject",
      required: [true, "L'ID de la matière est requis"],
    },

    topicIds: [
      {
        type: Types.ObjectId,
        ref: "Topic",
      },
    ],

    questionIds: [
      {
        type: Types.ObjectId,
        ref: "Question",
        required: true,
      },
    ],

    // =============== PARAMÈTRES ===============
    timeLimit: {
      type: Number, // en minutes
      required: [true, "La limite de temps est requise"],
      min: [5, "Minimum 5 minutes"],
      max: [180, "Maximum 3 heures"],
    },

    totalQuestions: {
      type: Number,
      required: [true, "Le nombre de questions est requis"],
      min: [1, "Minimum 1 question"],
      max: [50, "Maximum 50 questions"],
    },

    passingScore: {
      type: Number,
      default: 60,
      min: [0, "Score minimum invalide"],
      max: [100, "Score maximum invalide"],
    },

    maxAttempts: {
      type: Number,
      default: 3,
      min: [1, "Minimum 1 tentative"],
      max: [10, "Maximum 10 tentatives"],
    },

    // =============== CATÉGORISATION AFRIQUE ===============
    difficulty: {
      type: String,
      enum: {
        values: [...DIFFICULTY_LEVELS, "mixed"],
        message: "Niveau de difficulté invalide",
      },
      default: "mixed",
    },

    educationLevel: {
      type: String,
      enum: {
        values: EDUCATION_LEVELS,
        message: "Niveau d'éducation invalide",
      },
      required: [true, "Le niveau d'éducation est requis"],
    },

    examType: {
      type: String,
      enum: {
        values: EXAM_TYPES,
        message: "Type d'examen invalide",
      },
    },

    // =============== STATISTIQUES SIMPLES ===============
    stats: {
      totalAttempts: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
      passRate: { type: Number, default: 0 }, // pourcentage
      averageCompletionTime: { type: Number, default: 0 }, // en minutes
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

    isActive: { type: Boolean, default: true },
    isPremium: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// =============== VALIDATION ===============
QuizSchema.pre("validate", function (next) {
  if (this.questionIds && this.totalQuestions !== this.questionIds.length) {
    return next(
      new Error(
        "Le nombre de questions ne correspond pas aux questions sélectionnées"
      )
    );
  }
  next();
});

// =============== INDEX ===============
QuizSchema.index({ subjectId: 1, difficulty: 1 });
QuizSchema.index({ examType: 1, educationLevel: 1 });
QuizSchema.index({ difficulty: 1, isActive: 1 });
QuizSchema.index({ format: 1, status: 1 });
QuizSchema.index({ createdAt: -1 });

// =============== VIRTUELS ===============
QuizSchema.virtual("estimatedDuration").get(function () {
  return `${this.timeLimit} minutes`;
});

QuizSchema.virtual("popularityScore").get(function () {
  return this.stats.totalAttempts * 0.7 + this.stats.averageScore * 0.3;
});

// =============== MÉTHODES ===============
QuizSchema.methods.updateStats = function (
  score,
  completionTimeMinutes,
  passed
) {
  this.stats.totalAttempts += 1;

  // Mise à jour du score moyen
  const prevTotal = this.stats.totalAttempts - 1;
  this.stats.averageScore = Math.round(
    (this.stats.averageScore * prevTotal + score) / this.stats.totalAttempts
  );

  // Mise à jour du temps moyen
  this.stats.averageCompletionTime = Math.round(
    (this.stats.averageCompletionTime * prevTotal + completionTimeMinutes) /
      this.stats.totalAttempts
  );

  // Mise à jour du taux de réussite
  const prevPassedCount = Math.round((this.stats.passRate * prevTotal) / 100);
  const newPassedCount = prevPassedCount + (passed ? 1 : 0);
  this.stats.passRate = Math.round(
    (newPassedCount / this.stats.totalAttempts) * 100
  );

  return this.save();
};

// =============== MÉTHODES STATIQUES ===============
QuizSchema.statics.findByEducationAndExam = function (
  educationLevel,
  examType
) {
  return this.find({
    educationLevel,
    examType: examType || { $exists: true },
    isActive: true,
    status: "active",
  });
};

QuizSchema.statics.findPopular = function (limit = 10) {
  return this.find({ isActive: true, status: "active" })
    .sort({ "stats.totalAttempts": -1, "stats.averageScore": -1 })
    .limit(limit);
};

module.exports = { Quiz: model("Quiz", QuizSchema) };
