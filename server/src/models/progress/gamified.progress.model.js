const { Schema, model, Types } = require("mongoose");
const { GAMIFIED_REWARD_TYPES } = require("../../constants");

// =============== CONSTANTS =============
/**
 * Imported constants for gamified reward types.
 * @see module:constants/index
 */

// =============== SUBSCHEMAS =============
/**
 * Subschema for milestone rewards.
 * @module RewardSchema
 */
const RewardSchema = new Schema({
  type: {
    type: String,
    enum: {
      values: GAMIFIED_REWARD_TYPES,
      message: `Le type de récompense doit être l'un des suivants : ${GAMIFIED_REWARD_TYPES.join(
        ", "
      )}`,
    },
  },
  value: {
    type: String,
  },
});

/**
 * Subschema for progress milestones.
 * @module MilestoneSchema
 */
const MilestoneSchema = new Schema({
  id: {
    type: String,
  },
  description: {
    type: String,
  },
  targetValue: {
    type: Number,
  },
  currentValue: {
    type: Number,
    default: 0,
  },
  achieved: {
    type: Boolean,
    default: false,
  },
  achievedDate: {
    type: Date,
  },
  reward: {
    type: RewardSchema,
    default: () => ({}),
  },
});

// ================= SCHEMA =================
/**
 * Mongoose schema for gamified progress, tracking user achievements in subjects.
 * @module GamifiedProgressSchema
 */
const GamifiedProgressSchema = new Schema(
  {
    // Progress details
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "L'ID de l'utilisateur est requis"],
    },
    subjectId: {
      type: Types.ObjectId,
      ref: "Subject",
      required: [true, "L'ID de la matière est requis"],
    },
    series: {
      type: [String],
      default: [],
    },
    // Milestones
    milestones: {
      type: [MilestoneSchema],
      default: [],
    },
    // Overall progress
    totalPoints: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
    experience: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// =============== INDEXES =================
GamifiedProgressSchema.index({ userId: 1, subjectId: 1 });
GamifiedProgressSchema.index({ "milestones.achieved": 1 }, { sparse: true });

// =============== VIRTUALS =============
/**
 * Virtual field for completion percentage of milestones.
 * @returns {number} Percentage of achieved milestones.
 */
GamifiedProgressSchema.virtual("completionPercentage").get(function () {
  if (!(this.milestones ?? []).length) return 0;
  const completed = this.milestones.filter((m) => m.achieved).length;
  return Math.round((completed / this.milestones.length) * 100);
});

/**
 * Virtual field for active (unachieved) milestones.
 * @returns {Object[]} Array of unachieved milestone objects.
 */
GamifiedProgressSchema.virtual("activeMilestones").get(function () {
  return (this.milestones ?? []).filter((m) => !m.achieved);
});

/**
 * GamifiedProgress model for interacting with the GamifiedProgress collection.
 * @type {mongoose.Model}
 */
module.exports = {
  GamifiedProgress: model("GamifiedProgress", GamifiedProgressSchema),
};
