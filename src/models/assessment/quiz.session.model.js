const mongoose = require("mongoose");
const { Schema } = mongoose;

const QuizSessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    quizId: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
      default: () =>
        `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    },
    startTime: {
      type: Date,
      default: Date.now,
      index: true,
    },
    endTime: {
      type: Date,
      index: true,
    },
    lastActive: {
      type: Date,
      default: Date.now,
      index: true,
    },
    timeRemaining: {
      type: Number, // in seconds
      default: 0,
    },
    answers: [
      {
        questionId: {
          type: Schema.Types.ObjectId,
          ref: "Question",
          required: true,
        },
        selectedAnswer: Schema.Types.Mixed,
        isCorrect: Boolean,
        timeSpent: {
          type: Number, // in seconds
          default: 0,
        },
        answeredAt: {
          type: Date,
          default: Date.now,
        },
        flagged: {
          type: Boolean,
          default: false,
        },
        skipped: {
          type: Boolean,
          default: false,
        },
      },
    ],
    currentQuestionIndex: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: [
        "not_started",
        "in_progress",
        "paused",
        "completed",
        "abandoned",
        "expired",
      ],
      required: true,
      default: "not_started",
      index: true,
    },
    progress: {
      questionsAnswered: {
        type: Number,
        default: 0,
      },
      questionsSkipped: {
        type: Number,
        default: 0,
      },
      questionsFlagged: {
        type: Number,
        default: 0,
      },
      percentageComplete: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
    },
    deviceInfo: {
      platform: String,
      browser: String,
      version: String,
      userAgent: String,
      screenResolution: String,
      lastSync: {
        type: Date,
        default: Date.now,
      },
      isOnline: {
        type: Boolean,
        default: true,
      },
    },
    settings: {
      autoSave: {
        type: Boolean,
        default: true,
      },
      showTimer: {
        type: Boolean,
        default: true,
      },
      allowNavigation: {
        type: Boolean,
        default: true,
      },
    },
    metadata: {
      ipAddress: String,
      location: {
        country: String,
        city: String,
        timezone: String,
      },
      sessionDuration: Number, // in seconds
      pausedDuration: Number, // in seconds
      totalInteractions: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for better query performance
QuizSessionSchema.index({ userId: 1, quizId: 1 });
QuizSessionSchema.index({ userId: 1, status: 1 });
QuizSessionSchema.index({ quizId: 1, status: 1 });
QuizSessionSchema.index({ startTime: 1, status: 1 });
QuizSessionSchema.index({ lastActive: 1, status: 1 });

// Virtual for session duration
QuizSessionSchema.virtual("sessionDuration").get(function () {
  if (this.endTime && this.startTime) {
    return Math.floor((this.endTime - this.startTime) / 1000); // in seconds
  }
  if (this.startTime) {
    return Math.floor((new Date() - this.startTime) / 1000); // in seconds
  }
  return 0;
});

// Virtual for time elapsed
QuizSessionSchema.virtual("timeElapsed").get(function () {
  if (this.startTime) {
    const elapsed = Math.floor((new Date() - this.startTime) / 1000);
    return elapsed - (this.metadata.pausedDuration || 0);
  }
  return 0;
});

// Virtual for completion percentage
QuizSessionSchema.virtual("completionPercentage").get(function () {
  if (this.answers.length === 0) return 0;
  const totalQuestions = this.answers.length;
  const answeredQuestions = this.answers.filter(
    (answer) =>
      answer.selectedAnswer !== null &&
      answer.selectedAnswer !== undefined &&
      !answer.skipped
  ).length;
  return Math.round((answeredQuestions / totalQuestions) * 100);
});

// Virtual for is expired
QuizSessionSchema.virtual("isExpired").get(function () {
  if (!this.timeRemaining || this.status === "completed") return false;
  return this.timeRemaining <= 0;
});

// Pre-save middleware to update progress
QuizSessionSchema.pre("save", function (next) {
  if (this.answers && this.answers.length > 0) {
    this.progress.questionsAnswered = this.answers.filter(
      (a) =>
        a.selectedAnswer !== null &&
        a.selectedAnswer !== undefined &&
        !a.skipped
    ).length;
    this.progress.questionsSkipped = this.answers.filter(
      (a) => a.skipped
    ).length;
    this.progress.questionsFlagged = this.answers.filter(
      (a) => a.flagged
    ).length;
    this.progress.percentageComplete = this.completionPercentage;
  }

  // Update last active time
  this.lastActive = new Date();

  next();
});

// Method to check if session is active
QuizSessionSchema.methods.isActive = function () {
  return ["in_progress", "paused"].includes(this.status);
};

// Method to check if session can be resumed
QuizSessionSchema.methods.canResume = function () {
  return this.status === "paused" && !this.isExpired;
};

// Method to get next question
QuizSessionSchema.methods.getNextQuestion = function () {
  if (this.currentQuestionIndex < this.answers.length - 1) {
    return this.currentQuestionIndex + 1;
  }
  return null;
};

// Method to get previous question
QuizSessionSchema.methods.getPreviousQuestion = function () {
  if (this.currentQuestionIndex > 0) {
    return this.currentQuestionIndex - 1;
  }
  return null;
};

// Method to calculate score
QuizSessionSchema.methods.calculateScore = function () {
  const correctAnswers = this.answers.filter(
    (answer) => answer.isCorrect
  ).length;
  const totalQuestions = this.answers.length;
  return {
    correctCount: correctAnswers,
    totalQuestions,
    percentage:
      totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0,
  };
};

// Static method to find active sessions
QuizSessionSchema.statics.findActiveSessions = function (userId) {
  return this.find({
    userId,
    status: { $in: ["in_progress", "paused"] },
  }).populate("quizId", "title timeLimit");
};

// Static method to find expired sessions
QuizSessionSchema.statics.findExpiredSessions = function () {
  const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
  return this.find({
    status: { $in: ["in_progress", "paused"] },
    lastActive: { $lt: cutoffTime },
  });
};

// Static method to cleanup old sessions
QuizSessionSchema.statics.cleanupOldSessions = function (daysOld = 30) {
  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
  return this.deleteMany({
    status: { $in: ["completed", "abandoned", "expired"] },
    createdAt: { $lt: cutoffDate },
  });
};

module.exports = {
  QuizSession: mongoose.model("QuizSession", QuizSessionSchema),
};