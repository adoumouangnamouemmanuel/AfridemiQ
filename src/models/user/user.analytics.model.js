const mongoose = require("mongoose");
const { Schema } = mongoose;

// Other schemas remain largely unchanged but updated for consistency
const UserAnalyticsSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    lastUpdated: { type: Date, default: Date.now },
    dailyStats: [
      {
        date: Date,
        studyTime: Number,
        questionsAnswered: Number,
        correctAnswers: Number,
        topicsCovered: [String],
      },
    ],
    subjectStats: [
      {
        subjectId: { type: Schema.Types.ObjectId, ref: "Subject" },
        series: String,
        averageScore: Number,
        timeSpent: Number,
        lastStudied: Date,
      },
    ],
    learningPatterns: {
      preferredStudyTime: String,
      mostProductiveDays: [String],
      averageSessionLength: Number,
    },
    mastery: [
      {
        subjectId: { type: Schema.Types.ObjectId, ref: "Subject" },
        series: String,
        masteryLevel: Number,
        lastAssessmentDate: Date,
        improvementRate: Number,
      },
    ],
    efficiency: {
      averageResponseTime: Number,
      accuracyRate: Number,
      timeSpentPerTopic: Number,
    },
    personalizedRecommendations: {
      weakTopics: [String],
      suggestedStudyPath: [String],
      nextMilestone: String,
    },
  },
  { timestamps: true }
);

// Add indexes for better performance
// UserAnalyticsSchema.index({ userId: 1 });
UserAnalyticsSchema.index({ "dailyStats.date": 1 });
UserAnalyticsSchema.index({ "subjectStats.subjectId": 1 });
UserAnalyticsSchema.index({ lastUpdated: -1 });

// Virtual for total study time
UserAnalyticsSchema.virtual("totalStudyTime").get(function () {
  return this.dailyStats.reduce(
    (total, day) => total + (day.studyTime || 0),
    0
  );
});

// Virtual for overall accuracy
UserAnalyticsSchema.virtual("overallAccuracy").get(function () {
  const totalQuestions = this.dailyStats.reduce(
    (total, day) => total + (day.questionsAnswered || 0),
    0
  );
  const totalCorrect = this.dailyStats.reduce(
    (total, day) => total + (day.correctAnswers || 0),
    0
  );
  return totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
});

// Virtual for average mastery level
UserAnalyticsSchema.virtual("averageMasteryLevel").get(function () {
  if (this.mastery.length === 0) return 0;
  const totalMastery = this.mastery.reduce(
    (total, subject) => total + (subject.masteryLevel || 0),
    0
  );
  return totalMastery / this.mastery.length;
});

// Ensure virtual fields are serialized
UserAnalyticsSchema.set("toJSON", { virtuals: true });
UserAnalyticsSchema.set("toObject", { virtuals: true });

// Model
module.exports = {
  UserAnalytics: mongoose.model("UserAnalytics", UserAnalyticsSchema),
};
