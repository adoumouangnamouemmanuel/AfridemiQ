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

module.exports = {
  OnboardingStatus: mongoose.model("OnboardingStatus", OnboardingStatusSchema),
};
