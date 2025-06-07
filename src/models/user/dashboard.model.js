const mongoose = require("mongoose");

const { Schema, model, Types } = mongoose;

const DashboardSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    upcomingExams: [
      {
        examId: { type: Types.ObjectId, ref: "Exam" },
        series: [String],
        date: Date,
      },
    ],

    recentQuizzes: [
      {
        quizId: { type: Types.ObjectId, ref: "Quiz" },
        score: Number,
        completedAt: Date,
      },
    ],

    recommendedTopics: [{ type: Types.ObjectId, ref: "Topic" }],

    streak: {
      type: Number,
      default: 0,
    },

    notifications: [{ type: Types.ObjectId, ref: "Notification" }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance optimization
DashboardSchema.index({ "upcomingExams.date": 1 });
DashboardSchema.index({ "recentQuizzes.completedAt": -1 });
DashboardSchema.index({ streak: -1 });

// === Virtuals ===

// Total upcoming exams
DashboardSchema.virtual("totalUpcomingExams").get(function () {
  return this.upcomingExams?.length || 0;
});

// Total recent quizzes
DashboardSchema.virtual("totalRecentQuizzes").get(function () {
  return this.recentQuizzes?.length || 0;
});

// Average quiz score
DashboardSchema.virtual("averageQuizScore").get(function () {
  if (!this.recentQuizzes?.length) return 0;
  const totalScore = this.recentQuizzes.reduce(
    (sum, quiz) => sum + (quiz.score || 0),
    0
  );
  return Math.round(totalScore / this.recentQuizzes.length);
});

// Total notifications
DashboardSchema.virtual("totalNotifications").get(function () {
  return this.notifications?.length || 0;
});

module.exports = {
  Dashboard: model("Dashboard", DashboardSchema),
};