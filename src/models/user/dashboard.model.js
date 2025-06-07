const { Schema, model, Types } = require("mongoose");

/**
 * Mongoose schema for user dashboard, storing exam, quiz, and notification data.
 * @module DashboardSchema
 */
const DashboardSchema = new Schema(
  {
    // User reference
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      unique: true,
    },
    // Upcoming exams array
    upcomingExams: [
      {
        examId: { type: Types.ObjectId, ref: "Exam", required: true },
        series: [{ type: String }],
        date: { type: Date, required: true },
      },
    ],
    // Recent quizzes array
    recentQuizzes: [
      {
        quizId: { type: Types.ObjectId, ref: "Quiz", required: true },
        score: {
          type: Number,
          required: true,
          min: [0, "Score cannot be negative"],
        },
        completedAt: { type: Date, required: true },
      },
    ],
    // Recommended topics array
    recommendedTopics: [
      {
        type: Types.ObjectId,
        ref: "Topic",
        required: true,
      },
    ],
    // User streak counter
    streak: {
      type: Number,
      default: 0,
      min: [0, "Streak cannot be negative"],
    },
    // Notifications array
    notifications: [
      {
        type: Types.ObjectId,
        ref: "Notification",
        required: true,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for query performance
DashboardSchema.index({ userId: 1 }, { unique: true });
DashboardSchema.index({ "upcomingExams.date": 1 });
DashboardSchema.index({ "recentQuizzes.completedAt": -1 });
DashboardSchema.index({ streak: -1 });

/**
 * Virtual field for total number of upcoming exams.
 * @returns {number} Length of upcomingExams array.
 */
DashboardSchema.virtual("totalUpcomingExams").get(function () {
  return this.upcomingExams?.length ?? 0;
});

/**
 * Virtual field for total number of recent quizzes.
 * @returns {number} Length of recentQuizzes array.
 */
DashboardSchema.virtual("totalRecentQuizzes").get(function () {
  return this.recentQuizzes?.length ?? 0;
});

/**
 * Virtual field for average score of recent quizzes.
 * @returns {number} Rounded average quiz score, or 0 if no quizzes.
 */
DashboardSchema.virtual("averageQuizScore").get(function () {
  if (!this.recentQuizzes?.length) return 0;
  const total = this.recentQuizzes.reduce(
    (sum, quiz) => sum + (quiz.score ?? 0),
    0
  );
  return Math.round(total / this.recentQuizzes.length);
});

/**
 * Virtual field for total number of notifications.
 * @returns {number} Length of notifications array.
 */
DashboardSchema.virtual("totalNotifications").get(function () {
  return this.notifications?.length ?? 0;
});

/**
 * Dashboard model for interacting with the Dashboard collection.
 * @type {mongoose.Model}
 */
module.exports = {
  Dashboard: model("Dashboard", DashboardSchema),
};
