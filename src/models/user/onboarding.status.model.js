const mongoose = require("mongoose");
const { Schema } = mongoose;

const OnboardingStatusSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    completedSteps: [String],
    currentStep: { type: String, required: true },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Indexes for better performance
// OnboardingStatusSchema.index({ userId: 1 });
OnboardingStatusSchema.index({ currentStep: 1 });
OnboardingStatusSchema.index({ lastUpdated: -1 });

// Virtual for completion percentage
OnboardingStatusSchema.virtual("completionPercentage").get(function () {
  const totalSteps = [
    "profile_setup",
    "preferences",
    "subjects_selection",
    "exam_selection",
    "goals_setting",
    "tutorial_completion",
  ];

  if (totalSteps.length === 0) return 0;
  return Math.round((this.completedSteps.length / totalSteps.length) * 100);
});

// Virtual for remaining steps
OnboardingStatusSchema.virtual("remainingSteps").get(function () {
  const totalSteps = [
    "profile_setup",
    "preferences",
    "subjects_selection",
    "exam_selection",
    "goals_setting",
    "tutorial_completion",
  ];

  return totalSteps.filter((step) => !this.completedSteps.includes(step));
});

// Virtual for is completed
OnboardingStatusSchema.virtual("isCompleted").get(function () {
  const totalSteps = [
    "profile_setup",
    "preferences",
    "subjects_selection",
    "exam_selection",
    "goals_setting",
    "tutorial_completion",
  ];

  return this.completedSteps.length >= totalSteps.length;
});

// Ensure virtual fields are serialized
OnboardingStatusSchema.set("toJSON", { virtuals: true });
OnboardingStatusSchema.set("toObject", { virtuals: true });

module.exports = {
  OnboardingStatus: mongoose.model("OnboardingStatus", OnboardingStatusSchema),
};