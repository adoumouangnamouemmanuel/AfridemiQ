const mongoose = require("mongoose");
const { Schema } = mongoose;

const TopicProgressSchema = new Schema(
  {
    topicId: {
      type: Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    series: String,
    masteryLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "mastered"],
      required: true,
      default: "beginner",
    },
    timeSpent: { type: Number, default: 0 },
    lastStudied: Date,
    practiceSessions: [
      {
        date: Date,
        score: Number,
        timeSpent: Number,
      },
    ],
    weakAreas: [String],
    strongAreas: [String],
  },
  { timestamps: true }
);

// Indexes for better performance
TopicProgressSchema.index({ userId: 1, topicId: 1 }, { unique: true });
TopicProgressSchema.index({ userId: 1, series: 1 });
TopicProgressSchema.index({ masteryLevel: 1 });
TopicProgressSchema.index({ lastStudied: -1 });

// Virtual fields
TopicProgressSchema.virtual("totalSessions").get(function () {
  return this.practiceSessions.length;
});

TopicProgressSchema.virtual("averageScore").get(function () {
  if (this.practiceSessions.length === 0) return 0;
  const total = this.practiceSessions.reduce(
    (sum, session) => sum + (session.score || 0),
    0
  );
  return Math.round(total / this.practiceSessions.length);
});

TopicProgressSchema.virtual("progressPercentage").get(function () {
  const levels = ["beginner", "intermediate", "advanced", "mastered"];
  const currentIndex = levels.indexOf(this.masteryLevel);
  return Math.round(((currentIndex + 1) / levels.length) * 100);
});

TopicProgressSchema.virtual("studyStreak").get(function () {
  if (this.practiceSessions.length === 0) return 0;

  const sortedSessions = this.practiceSessions.sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  let streak = 0;
  let currentDate = new Date();

  for (let session of sortedSessions) {
    const sessionDate = new Date(session.date);
    const daysDiff = Math.floor(
      (currentDate - sessionDate) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff <= 1) {
      streak++;
      currentDate = sessionDate;
    } else {
      break;
    }
  }

  return streak;
});

module.exports = {
  TopicProgress: mongoose.model("TopicProgress", TopicProgressSchema),
};
