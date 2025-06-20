const { Schema, model, Types } = require("mongoose");
const {
  QUESTION_TYPES,
  DIFFICULTY_LEVELS,
  EDUCATION_LEVELS,
  EXAM_TYPES,
  STATUSES,
} = require("../../constants");

const QuestionSchema = new Schema(
  {
    // =============== CONTENU PRINCIPAL ===============
    question: {
      type: String,
      required: [true, "La question est requise"],
      trim: true,
      maxlength: [1000, "La question ne peut pas dépasser 1000 caractères"],
    },

    format: {
      type: String,
      enum: {
        values: QUESTION_TYPES,
        message: "Format de question invalide",
      },
      required: [true, "Le format est requis"],
    },

    // Pour les questions à choix multiples
    options: [
      {
        type: String,
        trim: true,
        maxlength: [200, "L'option ne peut pas dépasser 200 caractères"],
      },
    ],

    correctAnswer: {
      type: Schema.Types.Mixed, // String ou Number (index de l'option)
      required: [true, "La réponse correcte est requise"],
    },

    explanation: {
      type: String,
      maxlength: [500, "L'explication ne peut pas dépasser 500 caractères"],
    },

    // =============== RELATIONS ===============
    subjectId: {
      type: Types.ObjectId,
      ref: "Subject",
      required: [true, "L'ID de la matière est requis"],
    },

    topicId: {
      type: Types.ObjectId,
      ref: "Topic",
    },

    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "L'ID du créateur est requis"],
    },

    // =============== CATÉGORISATION AFRIQUE ===============
    difficulty: {
      type: String,
      enum: {
        values: DIFFICULTY_LEVELS,
        message: "Niveau de difficulté invalide",
      },
      default: "medium",
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

    examYear: {
      type: Number,
      min: [2000, "Année d'examen invalide"],
      max: [2030, "Année d'examen invalide"],
    },

    // =============== STATISTIQUES SIMPLES ===============
    stats: {
      totalAttempts: { type: Number, default: 0 },
      correctAttempts: { type: Number, default: 0 },
      averageTimeSpent: { type: Number, default: 0 }, // en secondes
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

    isPremium: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// =============== VALIDATION ===============
QuestionSchema.pre("validate", function (next) {
  // Validation pour choix multiples
  if (this.format === "multiple_choice") {
    if (!this.options || this.options.length < 2) {
      return next(
        new Error(
          "Les questions à choix multiples doivent avoir au moins 2 options"
        )
      );
    }
    if (this.options.length > 5) {
      return next(new Error("Maximum 5 options autorisées"));
    }
  }

  // Validation pour vrai/faux
  if (this.format === "true_false") {
    if (!["true", "false", true, false].includes(this.correctAnswer)) {
      return next(new Error("Réponse invalide pour une question vrai/faux"));
    }
  }

  next();
});

// =============== INDEX ===============
QuestionSchema.index({ subjectId: 1, difficulty: 1 });
QuestionSchema.index({ examType: 1, educationLevel: 1 });
QuestionSchema.index({ topicId: 1, isActive: 1 });
QuestionSchema.index({ createdBy: 1, status: 1 });

// =============== VIRTUELS ===============
QuestionSchema.virtual("successRate").get(function () {
  if (this.stats.totalAttempts === 0) return 0;
  return Math.round(
    (this.stats.correctAttempts / this.stats.totalAttempts) * 100
  );
});

QuestionSchema.virtual("difficultyScore").get(function () {
  const rates = { easy: 1, medium: 2, hard: 3 };
  return rates[this.difficulty] || 2;
});

// =============== MÉTHODES ===============
QuestionSchema.methods.updateStats = function (isCorrect, timeSpent) {
  this.stats.totalAttempts += 1;
  if (isCorrect) this.stats.correctAttempts += 1;

  // Mise à jour du temps moyen
  this.stats.averageTimeSpent = Math.round(
    (this.stats.averageTimeSpent * (this.stats.totalAttempts - 1) + timeSpent) /
      this.stats.totalAttempts
  );

  return this.save();
};

module.exports = { Question: model("Question", QuestionSchema) };
