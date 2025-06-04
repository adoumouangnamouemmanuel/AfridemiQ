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
    nationalRank: { type: Number, required: true },
    regionalRank: { type: Number, required: true },
    globalRank: { type: Number, required: true },
    badgeCount: { type: Number, required: true },
    streak: { type: Number, required: true },
    topPerformance: { type: Boolean, default: false },
    mostImproved: Boolean,
    longestStreak: Number,
    history: [
      {
        date: Date,
        rank: Number,
      },
    ],
    series: String,
  },
  { timestamps: true }
);

module.exports = {
  LeaderboardEntry: mongoose.model("LeaderboardEntry", LeaderboardEntrySchema),
};
