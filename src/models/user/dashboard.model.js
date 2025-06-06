const mongoose = require("mongoose");
const { Schema } = mongoose;

const DashboardSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    upcomingExams: [
      {
        examId: { type: Schema.Types.ObjectId, ref: "Exam" },
        series: [String],
        date: Date,
      },
    ],
    recentQuizzes: [
      {
        quizId: { type: Schema.Types.ObjectId, ref: "Quiz" },
        score: Number,
        completedAt: Date,
      },
    ],
    recommendedTopics: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
    streak: { type: Number, default: 0 },
    notifications: [{ type: Schema.Types.ObjectId, ref: "Notification" }],
  },
  { timestamps: true }
);

// Indexes for better performance
// DashboardSchema.index({ userId: 1 });
DashboardSchema.index({ "upcomingExams.date": 1 });
DashboardSchema.index({ "recentQuizzes.completedAt": -1 });
DashboardSchema.index({ streak: -1 });

// Virtual for total upcoming exams
DashboardSchema.virtual("totalUpcomingExams").get(function () {
  return this.upcomingExams ? this.upcomingExams.length : 0;
});

// Virtual for total recent quizzes
DashboardSchema.virtual("totalRecentQuizzes").get(function () {
  return this.recentQuizzes ? this.recentQuizzes.length : 0;
});

// Virtual for average quiz score
DashboardSchema.virtual("averageQuizScore").get(function () {
  if (!this.recentQuizzes || this.recentQuizzes.length === 0) return 0;
  const total = this.recentQuizzes.reduce(
    (sum, quiz) => sum + (quiz.score || 0),
    0
  );
  return Math.round(total / this.recentQuizzes.length);
});

// Virtual for total notifications
DashboardSchema.virtual("totalNotifications").get(function () {
  return this.notifications ? this.notifications.length : 0;
});

// Ensure virtual fields are serialized
DashboardSchema.set("toJSON", { virtuals: true });
DashboardSchema.set("toObject", { virtuals: true });

module.exports = {
  Dashboard: mongoose.model("Dashboard", DashboardSchema),
};