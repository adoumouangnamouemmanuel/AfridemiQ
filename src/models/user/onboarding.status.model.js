const { Schema, model, Types } = require("mongoose");
const { TOTAL_STEPS } = require("../../constants");

// =============== CONSTANTS =============
/**
 * Imported constants for onboarding steps.
 * @see module:constants
 */

// ==================== SCHEMA ==================
/**
 * Mongoose schema for tracking user onboarding progress.
 * @module OnboardingStatusSchema
 */
const OnboardingStatusSchema = new Schema(
  {
    // Onboarding details
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "L'ID utilisateur est requis"],
      unique: true,
    },
    completedSteps: [
      {
        step: { type: String },
        completedAt: { type: Date, default: Date.now },
    },
    ],
    currentStep: {
      type: String,
      required: [true, "L'étape actuelle est requise"],
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: Map,
      of: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// =============== INDEXES =================
OnboardingStatusSchema.index({ currentStep: 1 });
OnboardingStatusSchema.index({ lastUpdated: -1 });

// =============== VIRTUALS =============
/**
 * Virtual field for onboarding completion percentage.
 * @returns {number} Rounded percentage of completed steps, or 0 if no steps defined.
 */
OnboardingStatusSchema.virtual("completionPercentage").get(function () {
  return TOTAL_STEPS.length
    ? Math.round(
        ((this.completedSteps?.length ?? 0) / TOTAL_STEPS.length) * 100
      )
    : 0;
});

/**
 * Virtual field for remaining onboarding steps.
 * @returns {string[]} Array of steps not yet completed.
 */
OnboardingStatusSchema.virtual("remainingSteps").get(function () {
  return TOTAL_STEPS.filter(
    (step) => !(this.completedSteps ?? []).includes(step)
  );
});

/**
 * Virtual field to check if onboarding is complete.
 * @returns {boolean} True if all steps are completed, false otherwise.
 */
OnboardingStatusSchema.virtual("isCompleted").get(function () {
  return (this.completedSteps?.length ?? 0) >= TOTAL_STEPS.length;
});

/**
 * OnboardingStatus model for interacting with the OnboardingStatus collection.
 * @type {mongoose.Model}
 */
module.exports = {
  OnboardingStatus: model("OnboardingStatus", OnboardingStatusSchema),
};
