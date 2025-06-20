const { Schema, model, Types } = require("mongoose");
const { QUIZ_SESSION_STATUSES } = require("../../constants");

const AnswerSchema = new Schema({
  questionId: {
    type: Types.ObjectId,
    ref: "Question",
    required: true,
  },
  selectedAnswer: Schema.Types.Mixed,
  correctAnswer: Schema.Types.Mixed,
  isCorrect: {
    type: Boolean,
    required: true,
  },
  timeSpent: {
    type: Number,
    default: 0,
    min: 0,
  }, // en secondes
  answeredAt: {
    type: Date,
    default: Date.now,
  },
});

const QuizSessionSchema = new Schema(
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
      min: [0, "Score invalide"],
      max: [100, "Score invalide"],
    },

    totalQuestions: {
      type: Number,
      required: [true, "Le nombre total de questions est requis"],
      min: 1,
    },

    correctAnswers: {
      type: Number,
      default: 0,
      min: 0,
    },

    incorrectAnswers: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =============== TIMING ===============
    timeLimit: {
      type: Number, // en minutes
      required: [true, "La limite de temps est requise"],
    },

    timeSpent: {
      type: Number, // en secondes
      default: 0,
      min: 0,
    },

    startedAt: {
      type: Date,
      required: [true, "L'heure de début est requise"],
    },

    completedAt: {
      type: Date,
    },

    // =============== RÉPONSES DÉTAILLÉES ===============
    answers: [AnswerSchema],

    // =============== STATUT ===============
    status: {
      type: String,
      enum: {
        values: QUIZ_SESSION_STATUSES,
        message: "Statut de session invalide",
      },
      default: "not_started",
    },

    isPassed: {
      type: Boolean,
      default: false,
    },

    attemptNumber: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// =============== INDEX ===============
QuizSessionSchema.index({ userId: 1, quizId: 1, createdAt: -1 });
QuizSessionSchema.index({ status: 1, completedAt: -1 });
QuizSessionSchema.index({ userId: 1, isPassed: 1 });

// =============== VIRTUELS ===============
QuizSessionSchema.virtual("completionPercentage").get(function () {
  if (this.totalQuestions === 0) return 0;
  return Math.round((this.answers.length / this.totalQuestions) * 100);
});

QuizSessionSchema.virtual("timeRemaining").get(function () {
  if (this.status !== "in_progress") return 0;
  const elapsedMinutes = Math.floor(this.timeSpent / 60);
  return Math.max(0, this.timeLimit - elapsedMinutes);
});

// =============== MÉTHODES ===============
QuizSessionSchema.methods.startSession = function () {
  this.status = "in_progress";
  this.startedAt = new Date();
  return this.save();
};

QuizSessionSchema.methods.completeSession = function () {
  this.status = "completed";
  this.completedAt = new Date();
  this.timeSpent = Math.floor((this.completedAt - this.startedAt) / 1000);

  // Calculer le score
  this.correctAnswers = this.answers.filter((a) => a.isCorrect).length;
  this.incorrectAnswers = this.answers.length - this.correctAnswers;
  this.score = Math.round((this.correctAnswers / this.totalQuestions) * 100);

  return this.save();
};

QuizSessionSchema.methods.addAnswer = function (
  questionId,
  selectedAnswer,
  correctAnswer,
  isCorrect,
  timeSpent
) {
  this.answers.push({
    questionId,
    selectedAnswer,
    correctAnswer,
    isCorrect,
    timeSpent,
  });

  return this.save();
};

module.exports = { QuizSession: model("QuizSession", QuizSessionSchema) };
