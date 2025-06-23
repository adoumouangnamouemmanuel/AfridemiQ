const { Schema, model, Types } = require("mongoose");

// =============== CONSTANTS =============
// No constants imported for UserAnalyticsSchema.

// =============== SUBSCHEMAS =============
/**
 * Subschema for daily study statistics.
 * @module DailyStatsSubSchema
 */
const DailyStatsSchema = new Schema({
  date: {
    type: Date,
  },
  studyTime: {
    type: Number,
  },
  questionsAnswered: {
    type: Number,
  },
  correctAnswers: {
    type: Number,
  },
  topicsCovered: {
    type: [String],
    default: [],
  },
});

/**
 * Subschema for subject-specific statistics.
 * @module SubjectStatsSubSchema
 */
const SubjectStatsSchema = new Schema({
  subjectId: {
    type: Types.ObjectId,
    ref: "Subject",
  },
  series: {
    type: String,
  },
  averageScore: {
    type: Number,
  },
  timeSpent: {
    type: Number,
  },
  lastStudied: {
    type: Date,
  },
});

/**
 * Subschema for subject mastery levels.
 * @module MasterySubSchema
 */
const MasterySchema = new Schema({
  subjectId: {
    type: Types.ObjectId,
    ref: "Subject",
  },
  series: {
    type: String,
  },
  masteryLevel: {
    type: Number,
  },
  lastAssessmentDate: {
    type: Date,
  },
  improvementRate: {
    type: Number,
  },
});

// ==================== SCHEMA ==================
/**
 * Mongoose schema for user analytics, tracking study patterns and performance.
 * @module UserAnalyticsSchema
 */
const UserAnalyticsSchema = new Schema(
  {
    // User analytics details
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "L'ID utilisateur est requis"],
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    // Study statistics
    dailyStats: {
      type: [DailyStatsSchema],
      default: [],
    },
    subjectStats: {
      type: [SubjectStatsSchema],
      default: [],
    },
    // Learning patterns
    learningPatterns: {
      preferredStudyTime: {
        type: String,
      },
      mostProductiveDays: {
        type: [String],
        default: [],
      },
      averageSessionLength: {
        type: Number,
      },
    },
    mastery: {
      type: [MasterySchema],
      default: [],
    },
    // Efficiency metrics
    efficiency: {
      averageResponseTime: {
        type: Number,
      },
      accuracyRate: {
        type: Number,
      },
      timeSpentPerTopic: {
        type: Number,
      },
    },
    // Personalized recommendations
    personalizedRecommendations: {
      weakTopics: {
        type: [String],
        default: [],
      },
      suggestedStudyPath: {
        type: [String],
        default: [],
      },
      nextMilestone: {
        type: String,
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
UserAnalyticsSchema.index({ userId: 1 }, { unique: true });
UserAnalyticsSchema.index({ "dailyStats.date": 1 });
UserAnalyticsSchema.index({ "subjectStats.subjectId": 1 });
UserAnalyticsSchema.index({ lastUpdated: -1 });

// =============== VIRTUALS =============
/**
 * Virtual field for total study time across all daily stats.
 * @returns {number} Sum of studyTime from dailyStats.
 */
UserAnalyticsSchema.virtual("totalStudyTime").get(function () {
  return (this.dailyStats ?? []).reduce(
    (total, day) => total + (day.studyTime ?? 0),
    0
  );
});

/**
 * Virtual field for overall accuracy percentage.
 * @returns {number} Percentage of correct answers across all daily stats.
 */
UserAnalyticsSchema.virtual("overallAccuracy").get(function () {
  const totalQuestions = (this.dailyStats ?? []).reduce(
    (total, day) => total + (day.questionsAnswered ?? 0),
    0
  );
  const totalCorrect = (this.dailyStats ?? []).reduce(
    (total, day) => total + (day.correctAnswers ?? 0),
    0
  );
  return totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
});

/**
 * Virtual field for average mastery level across subjects.
 * @returns {number} Average masteryLevel from mastery array.
 */
UserAnalyticsSchema.virtual("averageMasteryLevel").get(function () {
  if ((this.mastery ?? []).length === 0) return 0;
  const totalMastery = (this.mastery ?? []).reduce(
    (total, subject) => total + (subject.masteryLevel ?? 0),
    0
  );
  return totalMastery / this.mastery.length;
});

/**
 * UserAnalytics model for interacting with the UserAnalytics collection.
 * @type {mongoose.Model}
 */
module.exports = {
  UserAnalytics: model("UserAnalytics", UserAnalyticsSchema),
};
