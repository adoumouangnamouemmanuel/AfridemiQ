const mongoose = require("mongoose");
const { Schema } = mongoose;

// Achievement Schema
const AchievementSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    color: { type: String, required: true },
    earnedDate: Date,
    progress: { type: Number, default: 0 },
    target: { type: Number, required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", default: null },
    series: String,
  },
  { timestamps: true }
);

// Indexes for better performance
AchievementSchema.index({ subjectId: 1, series: 1 });
AchievementSchema.index({ earnedDate: 1 });
AchievementSchema.index({ progress: 1, target: 1 });

// Virtual for completion percentage
AchievementSchema.virtual("completionPercentage").get(function () {
  return this.target > 0 ? Math.round((this.progress / this.target) * 100) : 0;
});

// Virtual for completion status
AchievementSchema.virtual("isCompleted").get(function () {
  return this.progress >= this.target;
});

// Ensure virtual fields are serialized
AchievementSchema.set("toJSON", { virtuals: true });
AchievementSchema.set("toObject", { virtuals: true });

module.exports = {
  Achievement: mongoose.model("Achievement", AchievementSchema),
};