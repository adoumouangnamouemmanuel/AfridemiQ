const mongoose = require("mongoose");
const { Schema } = mongoose;

const LeaderboardEntrySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    nationalRank: { type: Number, required: true, index: true },
    regionalRank: { type: Number, required: true, index: true },
    globalRank: { type: Number, required: true, index: true },
    badgeCount: { type: Number, required: true, default: 0 },
    streak: { type: Number, required: true, default: 0 },
    totalPoints: { type: Number, default: 0 },
    topPerformance: { type: Boolean, default: false },
    mostImproved: { type: Boolean, default: false },
    longestStreak: { type: Number, default: 0 },
    history: [
      {
        date: { type: Date, default: Date.now },
        rank: Number,
        points: Number,
      },
    ],
    series: String,
    region: String,
    country: String,
  },
  { timestamps: true }
);

// Compound indexes for efficient queries
LeaderboardEntrySchema.index({ globalRank: 1, series: 1 });
LeaderboardEntrySchema.index({ nationalRank: 1, country: 1 });
LeaderboardEntrySchema.index({ regionalRank: 1, region: 1 });
LeaderboardEntrySchema.index({ userId: 1, series: 1 });

// Virtual for rank improvement
LeaderboardEntrySchema.virtual("rankImprovement").get(function () {
  if (this.history.length < 2) return 0;
  const current = this.history[this.history.length - 1];
  const previous = this.history[this.history.length - 2];
  return previous.rank - current.rank;
});

// Virtual for performance trend
LeaderboardEntrySchema.virtual("performanceTrend").get(function () {
  if (this.history.length < 3) return "stable";
  const recent = this.history.slice(-3);
  const improving = recent.every(
    (entry, index) => index === 0 || entry.rank <= recent[index - 1].rank
  );
  const declining = recent.every(
    (entry, index) => index === 0 || entry.rank >= recent[index - 1].rank
  );

  if (improving) return "improving";
  if (declining) return "declining";
  return "stable";
});

module.exports = {
  LeaderboardEntry: mongoose.model("LeaderboardEntry", LeaderboardEntrySchema),
};
