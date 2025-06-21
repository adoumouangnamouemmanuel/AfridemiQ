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

    type: {
      type: String,
      enum: {
        values: QUESTION_TYPES,
        message: "Type de question invalide",
      },
      required: [true, "Le type est requis"],
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
      type: Schema.Types.Mixed, // String, Number, Boolean
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

    // =============== TAGS POUR ORGANISATION ===============
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

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

    isActive: { type: Boolean, default: true },
    isPremium: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// =============== VALIDATION ===============
QuestionSchema.pre("validate", function (next) {
  // Validation pour choix multiples
  if (this.type === "multiple_choice") {
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

    // Vérifier que correctAnswer est un index valide
    const answerIndex = parseInt(this.correctAnswer);
    if (
      isNaN(answerIndex) ||
      answerIndex < 0 ||
      answerIndex >= this.options.length
    ) {
      return next(new Error("L'index de la réponse correcte est invalide"));
    }
  }

  // Validation pour vrai/faux
  if (this.type === "true_false") {
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
  const prevTotal = this.stats.totalAttempts - 1;
  this.stats.averageTimeSpent = Math.round(
    (this.stats.averageTimeSpent * prevTotal + timeSpent) /
      this.stats.totalAttempts
  );

  return this.save();
};

QuestionSchema.methods.checkAnswer = function (userAnswer) {
  if (this.type === "multiple_choice") {
    return parseInt(userAnswer) === parseInt(this.correctAnswer);
  }

  if (this.type === "true_false") {
    return Boolean(userAnswer) === Boolean(this.correctAnswer);
  }

  if (this.type === "short_answer") {
    return (
      userAnswer.toLowerCase().trim() ===
      this.correctAnswer.toLowerCase().trim()
    );
  }

  return false;
};

// =============== MÉTHODES STATIQUES ===============
QuestionSchema.statics.findByFilters = function (filters) {
  const query = { isActive: true, status: "active" };

  if (filters.educationLevel) query.educationLevel = filters.educationLevel;
  if (filters.examType) query.examType = filters.examType;
  if (filters.difficulty) query.difficulty = filters.difficulty;
  if (filters.type) query.type = filters.type;
  if (filters.tags) query.tags = { $in: filters.tags };

  return this.find(query);
};

QuestionSchema.statics.getRandomQuestions = function (count, filters = {}) {
  const query = { isActive: true, status: "active", ...filters };
  return this.aggregate([{ $match: query }, { $sample: { size: count } }]);
};

module.exports = { Question: model("Question", QuestionSchema) };
