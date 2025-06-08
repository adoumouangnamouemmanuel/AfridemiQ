const { Schema, model, Types } = require("mongoose");
const {
  MISSION_TYPES,
  MISSION_DIFFICULTIES,
  MISSION_CATEGORIES,
} = require("../../constants");

// =============== CONSTANTS =============
/**
 * Imported constants for mission types, difficulties, and categories.
 * @see module:constants/index
 */

// ================= SCHEMA =================
/**
 * Mongoose schema for missions, defining tasks with rewards and progress tracking.
 * @module MissionSchema
 */
const MissionSchema = new Schema(
  {
    // Mission details
    title: {
      type: String,
      required: [true, "Le titre est requis"],
    },
    description: {
      type: String,
      required: [true, "La description est requise"],
    },
    type: {
      type: String,
      enum: {
        values: MISSION_TYPES,
        message: `Le type doit être l'un des suivants : ${MISSION_TYPES.join(
          ", "
        )}`,
      },
      required: [true, "Le type est requis"],
    },
    // Progress
    progress: {
      type: Number,
      default: 0,
      min: [0, "La progression ne peut pas être négative"],
    },
    target: {
      type: Number,
      required: [true, "L'objectif est requis"],
      min: [1, "L'objectif doit être au moins 1"],
    },
    // Rewards
    reward: {
      type: String,
      required: [true, "La récompense est requise"],
    },
    icon: {
      type: String,
      required: [true, "L'icône est requise"],
    },
    points: {
      type: Number,
      default: 10,
    },
    // Status
    completed: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: [true, "La date d'expiration est requise"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Context
    subjectId: {
      type: Types.ObjectId,
      ref: "Subject",
    },
    series: {
      type: String,
    },
    difficulty: {
      type: String,
      enum: {
        values: MISSION_DIFFICULTIES,
        message: `La difficulté doit être l'une des suivantes : ${MISSION_DIFFICULTIES.join(
          ", "
        )}`,
      },
      default: MISSION_DIFFICULTIES[1], // medium
    },
    category: {
      type: String,
      enum: {
        values: MISSION_CATEGORIES,
        message: `La catégorie doit être l'une des suivantes : ${MISSION_CATEGORIES.join(
          ", "
        )}`,
      },
      default: MISSION_CATEGORIES[0], // study
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// =============== INDEXES =================
MissionSchema.index({ type: 1, completed: 1 });
MissionSchema.index({ expiresAt: 1, isActive: 1 });
MissionSchema.index({ subjectId: 1, series: 1 }, { sparse: true });

// =============== VIRTUALS =============
/**
 * Virtual field for completion percentage of the mission.
 * @returns {number} Percentage of progress toward the target.
 */
MissionSchema.virtual("completionPercentage").get(function () {
  return Math.min(
    Math.round(((this.progress ?? 0) / (this.target ?? 1)) * 100),
    100
  );
});

/**
 * Virtual field for time remaining until expiration.
 * @returns {number} Time remaining in milliseconds.
 */
MissionSchema.virtual("timeRemaining").get(function () {
  const now = new Date();
  const remaining = (this.expiresAt ?? now) - now;
  return Math.max(0, remaining);
});

/**
 * Virtual field to check if the mission is expired.
 * @returns {boolean} True if the mission is expired.
 */
MissionSchema.virtual("isExpired").get(function () {
  return new Date() > (this.expiresAt ?? new Date());
});

/**
 * Mission model for interacting with the Mission collection.
 * @type {mongoose.Model}
 */
module.exports = {
  Mission: model("Mission", MissionSchema),
};
