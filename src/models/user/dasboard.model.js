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

module.exports = {
  Dashboard: mongoose.model("Dashboard", DashboardSchema),
};
