const { Schema, model, Types } = require("mongoose");
const { PERFORMANCE_TRENDS } = require("../../constants");

// =============== CONSTANTS =============
/**
 * Imported constants for performance trends.
 * @see module:constants/index
 */

// =============== SUBSCHEMAS =============
/**
 * Subschema for leaderboard history entries.
 * @module HistorySchema
 */
const HistorySchema = new Schema({
  date: {
    type: Date,
    default: Date.now,
  },
  rank: {
    type: Number,
  },
  points: {
    type: Number,
  },
});

// ================= SCHEMA =================
/**
 * Mongoose schema for leaderboard entries, tracking user rankings and performance.
 * @module LeaderboardEntrySchema
 */
const LeaderboardEntrySchema = new Schema(
  {
    // Leaderboard details
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "L'ID de l'utilisateur est requis"],
    },
    nationalRank: {
      type: Number,
      required: [true, "Le classement national est requis"],
    },
    regionalRank: {
      type: Number,
      required: [true, "Le classement régional est requis"],
    },
    globalRank: {
      type: Number,
      required: [true, "Le classement global est requis"],
    },
    // Achievements
    badgeCount: {
      type: Number,
      required: [true, "Le nombre de badges est requis"],
      default: 0,
    },
    streak: {
      type: Number,
      required: [true, "La série est requise"],
      default: 0,
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
    topPerformance: {
      type: Boolean,
      default: false,
    },
    mostImproved: {
      type: Boolean,
      default: false,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    // History
    history: {
      type: [HistorySchema],
      default: [],
    },
    // Context
    series: {
      type: String,
    },
    region: {
      type: String,
    },
    country: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// =============== INDEXES =================
LeaderboardEntrySchema.index({ globalRank: 1, series: 1 }, { sparse: true });
LeaderboardEntrySchema.index({ nationalRank: 1, country: 1 }, { sparse: true });
LeaderboardEntrySchema.index({ regionalRank: 1, region: 1 }, { sparse: true });
LeaderboardEntrySchema.index({ userId: 1, series: 1 });

// =============== VIRTUALS =============
/**
 * Virtual field for rank improvement based on history.
 * @returns {number} Difference between previous and current rank.
 */
LeaderboardEntrySchema.virtual("rankImprovement").get(function () {
  if ((this.history ?? []).length < 2) return 0;
  const current = this.history.slice(-1)[0];
  const previous = this.history.slice(-2)[0];
  return (previous?.rank ?? 0) - (current?.rank ?? 0);
});

/**
 * Virtual field for performance trend based on recent history.
 * @returns {string} Trend: improving, declining, or stable.
 */
LeaderboardEntrySchema.virtual("performanceTrend").get(function () {
  if ((this.history ?? []).length < 3) return PERFORMANCE_TRENDS[2]; // stable
  const recent = this.history.slice(-3);
  const improving = recent.every(
    (entry, index) => index === 0 || entry.rank <= recent[index - 1].rank
  );
  const declining = recent.every(
    (entry, index) => index === 0 || entry.rank >= recent[index - 1].rank
  );

  if (improving) return PERFORMANCE_TRENDS[0]; // improving
  if (declining) return PERFORMANCE_TRENDS[1]; // declining
  return PERFORMANCE_TRENDS[2]; // stable
});

/**
 * LeaderboardEntry model for interacting with the LeaderboardEntry collection.
 * @type {mongoose.Model}
 */
module.exports = {
  LeaderboardEntry: model("LeaderboardEntry", LeaderboardEntrySchema),
};
