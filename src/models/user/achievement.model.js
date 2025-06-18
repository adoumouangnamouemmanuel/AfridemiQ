const { Schema, model, Types } = require("mongoose");

// ==================== SCHEMA ==================
/**
 * Mongoose schema for user achievements, tracking progress and completion status.
 * @module AchievementSchema
 */
const AchievementSchema = new Schema(
  {
    // Achievement name
    name: {
      type: String,
      required: [true, "Le nom de la réalisation est requis"],
    },
    // Achievement description
    description: {
      type: String,
      required: [true, "La description de la réalisation est requise"],
    },
    // Achievement icon
    icon: {
      type: String,
      required: [true, "L'icône de la réalisation est requise"],
    },
    // Achievement color
    color: {
      type: String,
      required: [true, "La couleur de la réalisation est requise"],
    },
    // Date achievement was earned
    earnedDate: {
      type: Date,
    },
    // Current progress toward achievement
    progress: {
      type: Number,
      default: 0,
      min: [0, "Le progrès ne peut pas être négatif"],
      required: [true, "Le progrès est requis"],
    },
    // Target progress to complete achievement
    target: {
      type: Number,
      required: [true, "La cible de la réalisation est requise"],
      min: [1, "La cible doit être supérieure à zéro"],
    },
    // Associated subject reference
    subjectId: {
      type: Types.ObjectId,
      ref: "Subject",
      default: null,
    },
    // Achievement series identifier
    series: {
      type: String,
    },

    // Achievement category
    // Categories: academic (academic achievements), engagement (community or platform engagement), social (social
    category: {
      type: String,
      enum: ["academic", "engagement", "social", "milestone"],
      required: true,
    },
    tier: {
      type: String,
      enum: ["bronze", "silver", "gold"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// =============== INDEXES =================
AchievementSchema.index({ subjectId: 1, series: 1 }, { sparse: true });
AchievementSchema.index({ earnedDate: 1 }, { sparse: true });
AchievementSchema.index({ progress: 1, target: 1 });

// =============== VIRTUALS =============
/**
 * Virtual field for achievement completion percentage.
 * @returns {number} Rounded percentage of progress toward target, or 0 if target is invalid.
 */
AchievementSchema.virtual("completionPercentage").get(function () {
  return this.target > 0 ? Math.round((this.progress / this.target) * 100) : 0;
});

/**
 * Virtual field for achievement completion status.
 * @returns {boolean} True if progress meets or exceeds target, false otherwise.
 */
AchievementSchema.virtual("isCompleted").get(function () {
  return this.progress >= this.target;
});

/**
 * Achievement model for interacting with the Achievement collection.
 * @type {mongoose.Model}
 */
module.exports = {
  Achievement: model("Achievement", AchievementSchema),
};
