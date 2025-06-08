const { Schema, model, Types } = require("mongoose");
const {
  FEEDBACK_RATING_RANGE,
} = require("../../constants");

// =============== CONSTANTS =============
/**
 * Imported constants for quiz results, including statuses and rating ranges.
 * @see module:constants/index
 */

// =============== SUBSCHEMAS =============
/**
 * Subschema for question feedback on quiz results.
 * @module QuestionFeedbackSubSchema
 */
const FeedbackSchema = new Schema({
  userId: {
    type: Types.ObjectId,
    ref: "User",
    required: [true, "L'ID de l'utilisateur est requis"],
  },
  rating: {
    type: Number,
    min: [FEEDBACK_RATING_RANGE.MIN, `La note doit être au moins ${FEEDBACK_RATING_RANGE.MIN}`],
    max: [FEEDBACK_RATING_RANGE.MAX, `La note ne peut pas dépasser ${FEEDBACK_RATING_RANGE.MAX}`],
    required: [true, "La note est requise"],
  },
  comments: {
    type: String,
    maxlength: [1000, "Les commentaires ne peuvent pas dépasser 1000 caractères"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ==================== SCHEMA ==================
/**
 * Mongoose schema for quiz results, tracking user performance and feedback.
 * @module QuizResultSchema
 */
const QuizResultSchema = new Schema(
  {
    // Quiz result details
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "L'ID de l'utilisateur est requis"],
      index: true,
    },
    quizId: {
      type: Types.ObjectId,
      ref: "Quiz",
      required: [true, "L'ID du quiz est requis"],
    },
    series: {
      type: [String],
      validate: {
        validator: function(arr) {
          return arr.every(s => s && s.trim().length > 0);
        },
        message: "Toutes les séries doivent avoir au moins 1 caractère",
      },
      default: [],
    },
    questionIds: {
      type: [{ type: Types.ObjectId, ref: "Question" }],
      default: [],
    },
    // Performance metrics
    correctCount: {
      type: Number,
      required: [true, "Le nombre de réponses correctes est requis"],
      min: [0, "Le nombre de réponses correctes ne peut pas être négatif"],
    },
    score: {
      type: Number,
      required: [true, "Le score est requis"],
      min: [0, "Le score ne peut pas être négatif"],
    },
    timeTaken: {
      type: Number,
      required: [true, "Le temps pris est requis"],
      min: [0, "Le temps pris ne peut pas être négatif"],
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
    // References and feedback
    hintUsages: {
      type: [{ type: Types.ObjectId, ref: "HintUsage" }],
      default: [],
    },
    questionFeedback: {
      type: [FeedbackSchema],
      default: [],
      validate: [
        {
          validator: function(arr) {
            return arr.length <= 100;
          },
          message: "Trop d'entrées de commentaires (maximum 100)",
        },
      ],
    },
    // System feedback
    feedback: {
      title: {
        type: String,
        trim: true,
        maxlength: [200, "Le titre ne peut pas dépasser 200 caractères"],
      },
      subtitle: {
        type: String,
        trim: true,
        maxlength: [300, "Le sous-titre ne peut pas dépasser 300 caractères"],
      },
      color: {
        type: String,
        trim: true,
        match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "La couleur doit être un code hexadécimal valide"],
      },
      emoji: {
        type: String,
        trim: true,
        maxlength: [10, "L'emoji ne peut pas dépasser 10 caractères"],
      },
      message: {
        type: String,
        trim: true,
        maxlength: [1000, "Le message ne peut pas dépasser 1000 caractères"],
      },
    },
    // Metadata
    metadata: {
      version: { type: Number, default: 1 },
      deviceInfo: {
        type: String,
        trim: true,
      },
      ipAddress: {
        type: String,
        validate: {
          validator: function(v) {
            if (!v) return true;
            const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
            const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
            return ipv4Regex.test(v) || ipv6Regex.test(v);
          },
          message: "Adresse IP invalide",
        },
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// =============== INDEXES =================
QuizResultSchema.index({ userId: 1, quizId: 1 });
QuizResultSchema.index({ completedAt: -1 });
QuizResultSchema.index({ hintUsages: 1 }, { sparse: true });
QuizResultSchema.index({ score: -1 });
QuizResultSchema.index({ "questionFeedback.userId": 1 }, { sparse: true });
QuizResultSchema.index({ createdAt: -1 });

// =============== VIRTUALS =============
/**
 * Virtual field for accuracy percentage.
 * @returns {number} Percentage of correct answers.
 */
QuizResultSchema.virtual("accuracyPercentage").get(function () {
  if (this.questionIds.length === 0) return 0;
  return Math.round((this.correctCount / this.questionIds.length) * 100);
});

/**
 * Virtual field for average time per question.
 * @returns {number} Average time in seconds per question.
 */
QuizResultSchema.virtual("averageTimePerQuestion").get(function () {
  if (this.questionIds.length === 0) return 0;
  return Math.round(this.timeTaken / this.questionIds.length);
});

/**
 * Virtual field for performance rating.
 * @returns {string} Performance rating based on accuracy.
 */
QuizResultSchema.virtual("performanceRating").get(function () {
  const accuracy = this.accuracyPercentage;
  if (accuracy >= 90) return "excellent";
  if (accuracy >= 80) return "très bien";
  if (accuracy >= 70) return "bien";
  if (accuracy >= 60) return "moyen";
  return "à améliorer";
});

// =============== MIDDLEWARE =============
/**
 * Pre-save middleware to validate references and business logic.
 * @param {Function} next - Callback to proceed with save.
 */
QuizResultSchema.pre("save", async function (next) {
  try {
    // Validate user exists
    const user = await model("User").findById(this.userId);
    if (!user) {
      return next(new Error("ID utilisateur invalide"));
    }

    // Validate quiz exists
    const quiz = await model("Quiz").findById(this.quizId);
    if (!quiz) {
      return next(new Error("ID de quiz invalide"));
    }

    // Validate questions exist if provided
    if (this.questionIds.length > 0) {
      const questions = await model("Question").find({
        _id: { $in: this.questionIds },
      });
      if (questions.length !== this.questionIds.length) {
        return next(new Error("Un ou plusieurs IDs de question invalides"));
      }
    }

    // Validate feedback user IDs
    if (this.questionFeedback.length > 0) {
      const feedbackUserIds = this.questionFeedback.map((f) => f.userId);
      const feedbackUsers = await model("User").find({
        _id: { $in: feedbackUserIds },
      });
      if (feedbackUsers.length !== feedbackUserIds.length) {
        return next(new Error("Un ou plusieurs IDs d'utilisateur de commentaire invalides"));
      }
    }

    // Validate hint usages exist if provided
    if (this.hintUsages.length > 0) {
      const hintUsages = await model("HintUsage").find({
        _id: { $in: this.hintUsages },
      });
      if (hintUsages.length !== this.hintUsages.length) {
        return next(new Error("Un ou plusieurs IDs d'utilisation d'indice invalides"));
      }
    }

    // Business logic validation
    if (this.correctCount > this.questionIds.length) {
      return next(
        new Error("Le nombre de réponses correctes ne peut pas dépasser le nombre de questions")
      );
    }

    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Pre-save middleware to update metadata.
 * @param {Function} next - Callback to proceed with save.
 */
QuizResultSchema.pre("save", function (next) {
  if (this.isModified() && !this.isNew) {
    this.metadata.version += 1;
  }
  next();
});

// =============== METHODS =============
/**
 * Add feedback to the quiz result.
 * @param {string} userId - ID of the user providing feedback.
 * @param {number} rating - Rating (0-10).
 * @param {string} comments - Optional comments.
 * @returns {Promise<Document>} Updated quiz result document.
 */
QuizResultSchema.methods.addFeedback = function (userId, rating, comments) {
  this.questionFeedback.push({ userId, rating, comments });
  return this.save();
};

/**
 * Calculate performance statistics.
 * @returns {Object} Performance statistics object.
 */
QuizResultSchema.methods.getPerformanceStats = function () {
  return {
    accuracy: this.accuracyPercentage,
    averageTimePerQuestion: this.averageTimePerQuestion,
    performanceRating: this.performanceRating,
    hintsUsed: this.hintUsages.length,
    totalFeedback: this.questionFeedback.length,
  };
};

/**
 * QuizResult model for interacting with the QuizResult collection.
 * @type {mongoose.Model}
 */
module.exports = {
  QuizResult: model("QuizResult", QuizResultSchema),
};