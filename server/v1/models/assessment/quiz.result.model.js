const { Schema, model, Types } = require("mongoose");

const AnswerSchema = new Schema({
  questionId: {
    type: Types.ObjectId,
    ref: "Question",
    required: [true, "L'ID de la question est requis"],
  },
  selectedAnswer: {
    type: Schema.Types.Mixed,
    required: [true, "La réponse sélectionnée est requise"],
  },
  correctAnswer: {
    type: Schema.Types.Mixed,
    required: [true, "La réponse correcte est requise"],
  },
  isCorrect: {
    type: Boolean,
    required: [true, "Le statut de correction est requis"],
  },
  timeSpent: {
    type: Number, // en secondes
    default: 0,
    min: [0, "Le temps ne peut pas être négatif"],
  },
});

const QuizResultSchema = new Schema(
  {
    // =============== RELATIONS ===============
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "L'ID de l'utilisateur est requis"],
    },

    quizId: {
      type: Types.ObjectId,
      ref: "Quiz",
      required: [true, "L'ID du quiz est requis"],
    },

    // =============== RÉSULTATS ===============
    score: {
      type: Number,
      required: [true, "Le score est requis"],
      min: [0, "Le score ne peut pas être négatif"],
      max: [100, "Le score ne peut pas dépasser 100"],
    },

    totalQuestions: {
      type: Number,
      required: [true, "Le nombre total de questions est requis"],
      min: [1, "Au moins une question est requise"],
    },

    correctAnswers: {
      type: Number,
      required: [true, "Le nombre de bonnes réponses est requis"],
      min: [0, "Le nombre ne peut pas être négatif"],
    },

    incorrectAnswers: {
      type: Number,
      required: [true, "Le nombre de mauvaises réponses est requis"],
      min: [0, "Le nombre ne peut pas être négatif"],
    },

    // =============== TEMPS ===============
    totalTimeSpent: {
      type: Number, // temps total en secondes
      required: [true, "Le temps passé est requis"],
      min: [0, "Le temps ne peut pas être négatif"],
    },

    startedAt: {
      type: Date,
      required: [true, "L'heure de début est requise"],
    },

    completedAt: {
      type: Date,
      required: [true, "L'heure de fin est requise"],
    },

    // =============== RÉPONSES DÉTAILLÉES ===============
    answers: {
      type: [AnswerSchema],
      required: [true, "Les réponses sont requises"],
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: "Au moins une réponse est requise",
      },
    },

    // =============== STATUT ET RÉSULTAT ===============
    isPassed: {
      type: Boolean,
      required: [true, "Le statut de réussite est requis"],
    },

    attemptNumber: {
      type: Number,
      default: 1,
      min: [1, "Le numéro de tentative doit être positif"],
    },

    // =============== MÉTHODE DE SOUMISSION ===============
    submissionMethod: {
      type: String,
      enum: ["submitted", "time_expired", "auto_submit"],
      default: "submitted",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// =============== VALIDATION ===============
QuizResultSchema.pre("validate", function (next) {
  // Vérifier que correctAnswers + incorrectAnswers = totalQuestions
  if (this.correctAnswers + this.incorrectAnswers !== this.totalQuestions) {
    return next(
      new Error(
        "Le total des réponses ne correspond pas au nombre de questions"
      )
    );
  }

  // Vérifier que le nombre de réponses correspond
  if (this.answers.length !== this.totalQuestions) {
    return next(
      new Error(
        "Le nombre de réponses ne correspond pas au nombre de questions"
      )
    );
  }

  // Vérifier que completedAt > startedAt
  if (this.completedAt <= this.startedAt) {
    return next(new Error("L'heure de fin doit être après l'heure de début"));
  }

  next();
});

// =============== POST SAVE - Update Quiz Stats ===============
QuizResultSchema.post("save", async function () {
  try {
    const Quiz = require("./quiz.model").Quiz;
    const quiz = await Quiz.findById(this.quizId);
    if (quiz) {
      const completionTimeMinutes = Math.round(this.totalTimeSpent / 60);
      await quiz.updateStats(this.score, completionTimeMinutes, this.isPassed);
    }
  } catch (error) {
    console.error("Error updating quiz stats:", error);
  }
});

// =============== INDEX ===============
QuizResultSchema.index({ userId: 1, quizId: 1, createdAt: -1 });
QuizResultSchema.index({ userId: 1, score: -1 });
QuizResultSchema.index({ quizId: 1, isPassed: 1 });
QuizResultSchema.index({ createdAt: -1, score: -1 });
QuizResultSchema.index({ userId: 1, quizId: 1 }, { unique: true });

// =============== VIRTUELS ===============
QuizResultSchema.virtual("completionTime").get(function () {
  const minutes = Math.floor(this.totalTimeSpent / 60);
  const seconds = this.totalTimeSpent % 60;
  return `${minutes}m ${seconds}s`;
});

QuizResultSchema.virtual("accuracy").get(function () {
  return Math.round((this.correctAnswers / this.totalQuestions) * 100);
});

QuizResultSchema.virtual("averageTimePerQuestion").get(function () {
  return Math.round(this.totalTimeSpent / this.totalQuestions);
});

QuizResultSchema.virtual("performance").get(function () {
  if (this.score >= 90) return "excellent";
  if (this.score >= 80) return "très_bien";
  if (this.score >= 70) return "bien";
  if (this.score >= 60) return "passable";
  return "insuffisant";
});

// =============== MÉTHODES STATIQUES ===============
QuizResultSchema.statics.getUserBestScore = function (userId, quizId) {
  return this.findOne({ userId, quizId })
    .sort({ score: -1 })
    .select("score isPassed createdAt");
};

QuizResultSchema.statics.getUserAverageScore = function (userId) {
  return this.aggregate([
    { $match: { userId } },
    { $group: { _id: null, averageScore: { $avg: "$score" } } },
  ]);
};

QuizResultSchema.statics.getUserAttemptCount = function (userId, quizId) {
  return this.countDocuments({ userId, quizId });
};

module.exports = { QuizResult: model("QuizResult", QuizResultSchema) };
