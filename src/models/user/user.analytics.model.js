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

// Model
module.exports = {
  UserAnalytics: mongoose.model("UserAnalytics", UserAnalyticsSchema),
};
