const mongoose = require("mongoose");
const { Schema } = mongoose;

const QuizSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },
    series: [String],
    topicIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Topic",
        index: true,
      },
    ],
    questionIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Question",
        validate: {
          validator: function (v) {
            return v.length > 0;
          },
          message: "Quiz must have at least one question",
        },
      },
    ],
    totalQuestions: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },
    totalPoints: {
      type: Number,
      required: true,
      min: 1,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    level: {
      type: String,
      required: true,
      enum: ["Beginner", "Intermediate", "Advanced"],
      index: true,
    },
    timeLimit: {
      type: Number,
      required: true,
      min: 60, // minimum 1 minute
      max: 10800, // maximum 3 hours
    },
    retakePolicy: {
      maxAttempts: {
        type: Number,
        default: 3,
        min: 1,
        max: 10,
      },
      cooldownMinutes: {
        type: Number,
        default: 0,
        min: 0,
        max: 1440, // max 24 hours
      },
    },
    resultIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "QuizResult",
      },
    ],
    settings: {
      shuffleQuestions: {
        type: Boolean,
        default: false,
      },
      shuffleOptions: {
        type: Boolean,
        default: false,
      },
      showCorrectAnswers: {
        type: Boolean,
        default: true,
      },
      allowReview: {
        type: Boolean,
        default: true,
      },
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
      index: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    offlineAvailable: {
      type: Boolean,
      default: false,
    },
    premiumOnly: {
      type: Boolean,
      default: false,
      index: true,
    },
    analytics: {
      totalAttempts: {
        type: Number,
        default: 0,
      },
      averageScore: {
        type: Number,
        default: 0,
      },
      averageTime: {
        type: Number,
        default: 0,
      },
      completionRate: {
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

// Indexes for better query performance
QuizSchema.index({ subjectId: 1, level: 1 });
QuizSchema.index({ createdBy: 1, createdAt: -1 });
QuizSchema.index({ isActive: 1, premiumOnly: 1 });
QuizSchema.index({ tags: 1 });

// Virtual for average score percentage
QuizSchema.virtual("averageScorePercentage").get(function () {
  if (this.totalPoints === 0) return 0;
  return Math.round((this.analytics.averageScore / this.totalPoints) * 100);
});

// Virtual for difficulty rating
QuizSchema.virtual("difficultyRating").get(function () {
  const ratings = { Easy: 1, Medium: 2, Hard: 3 };
  return ratings[this.difficulty] || 2;
});

// Virtual for estimated duration in minutes
QuizSchema.virtual("estimatedDurationMinutes").get(function () {
  return Math.ceil(this.timeLimit / 60);
});

// Pre-save middleware to validate question count
QuizSchema.pre("save", function (next) {
  if (this.questionIds.length !== this.totalQuestions) {
    this.totalQuestions = this.questionIds.length;
  }
  next();
});

// Method to check if user can retake quiz
QuizSchema.methods.canUserRetake = function (userAttempts) {
  return userAttempts < this.retakePolicy.maxAttempts;
};

// Method to get next available retake time
QuizSchema.methods.getNextRetakeTime = function (lastAttemptTime) {
  if (this.retakePolicy.cooldownMinutes === 0) return new Date();
  return new Date(
    lastAttemptTime.getTime() + this.retakePolicy.cooldownMinutes * 60 * 1000
  );
};

// Static method to find quizzes by subject and level
QuizSchema.statics.findBySubjectAndLevel = function (subjectId, level) {
  return this.find({
    subjectId,
    level,
    isActive: true,
  }).populate("subjectId", "name");
};

// Static method to get popular quizzes
QuizSchema.statics.getPopularQuizzes = function (limit = 10) {
  return this.find({ isActive: true })
    .sort({ "analytics.totalAttempts": -1 })
    .limit(limit)
    .populate("subjectId", "name");
};

module.exports = {
  Quiz: mongoose.model("Quiz", QuizSchema),
};