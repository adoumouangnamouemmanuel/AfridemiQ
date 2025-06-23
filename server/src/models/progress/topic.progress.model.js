const { Schema, model, Types } = require("mongoose");
const { MASTERY_LEVELS } = require("../../constants");

// =============== CONSTANTS =============
/**
 * Imported constants for mastery levels.
 * @see module:constants/index
 */

// =============== SUBSCHEMAS =============
/**
 * Subschema for practice sessions in topic progress.
 * @module PracticeSessionSchema
 */
const PracticeSessionSchema = new Schema({
  date: {
    type: Date,
  },
  score: {
    type: Number,
  },
  timeSpent: {
    type: Number,
  },
});

// ================= SCHEMA =================
/**
 * Mongoose schema for topic progress, tracking user mastery and practice sessions.
 * @module TopicProgressSchema
 */
const TopicProgressSchema = new Schema(
  {
    // Progress details
    topicId: {
      type: Types.ObjectId,
      ref: "Topic",
      required: [true, "L'ID du sujet est requis"],
    },
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "L'ID de l'utilisateur est requis"],
    },
    series: {
      type: String,
    },
    masteryLevel: {
      type: String,
      enum: {
        values: MASTERY_LEVELS,
        message: `Le niveau de maîtrise doit être l'un des suivants : ${MASTERY_LEVELS.join(
          ", "
        )}`,
      },
      required: [true, "Le niveau de maîtrise est requis"],
      default: MASTERY_LEVELS[0], // beginner
    },
    // Study metrics
    timeSpent: {
      type: Number,
      default: 0,
    },
    lastStudied: {
      type: Date,
    },
    practiceSessions: {
      type: [PracticeSessionSchema],
      default: [],
    },
    // Performance analysis
    weakAreas: {
      type: [String],
      default: [],
    },
    strongAreas: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// =============== INDEXES =================
TopicProgressSchema.index({ userId: 1, topicId: 1 }, { unique: true });
TopicProgressSchema.index({ userId: 1, series: 1 }, { sparse: true });
TopicProgressSchema.index({ masteryLevel: 1 });
TopicProgressSchema.index({ lastStudied: -1 }, { sparse: true });

// =============== VIRTUALS =============
/**
 * Virtual field for total number of practice sessions.
 * @returns {number} Count of practice sessions.
 */
TopicProgressSchema.virtual("totalSessions").get(function () {
  return (this.practiceSessions ?? []).length;
});

/**
 * Virtual field for average score across practice sessions.
 * @returns {number} Rounded average score.
 */
TopicProgressSchema.virtual("averageScore").get(function () {
  if (!(this.practiceSessions ?? []).length) return 0;
  const total = this.practiceSessions.reduce(
    (sum, session) => sum + (session.score ?? 0),
    0
  );
  return Math.round(total / this.practiceSessions.length);
});

/**
 * Virtual field for progress percentage based on mastery level.
 * @returns {number} Percentage of mastery progression.
 */
TopicProgressSchema.virtual("progressPercentage").get(function () {
  const currentIndex = MASTERY_LEVELS.indexOf(
    this.masteryLevel ?? MASTERY_LEVELS[0]
  );
  return Math.round(((currentIndex + 1) / MASTERY_LEVELS.length) * 100);
});

/**
 * Virtual field for current study streak based on practice sessions.
 * @returns {number} Number of consecutive study days.
 */
TopicProgressSchema.virtual("studyStreak").get(function () {
  if (!(this.practiceSessions ?? []).length) return 0;

  const sortedSessions = this.practiceSessions
    .slice()
    .sort((a, b) => new Date(b.date ?? 0) - new Date(a.date ?? 0));

  let streak = 0;
  let currentDate = new Date();

  for (let session of sortedSessions) {
    const sessionDate = new Date(session.date ?? currentDate);
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

/**
 * TopicProgress model for interacting with the TopicProgress collection.
 * @type {mongoose.Model}
 */
module.exports = {
  TopicProgress: model("TopicProgress", TopicProgressSchema),
};
