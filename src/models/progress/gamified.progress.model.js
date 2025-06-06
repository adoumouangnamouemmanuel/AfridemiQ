const mongoose = require("mongoose");
const { Schema } = mongoose;

const GamifiedProgressSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },
    series: [String],
    milestones: [
      {
        id: String,
        description: String,
        targetValue: Number,
        currentValue: { type: Number, default: 0 },
        achieved: { type: Boolean, default: false },
        achievedDate: Date,
        reward: {
          type: { type: String, enum: ["badge", "points", "feature"] },
          value: String,
        },
      },
    ],
    totalPoints: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    experience: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Indexes for better performance
GamifiedProgressSchema.index({ userId: 1, subjectId: 1 });
GamifiedProgressSchema.index({ "milestones.achieved": 1 });

// Virtual for completion percentage
GamifiedProgressSchema.virtual("completionPercentage").get(function () {
  if (!this.milestones || this.milestones.length === 0) return 0;
  const completed = this.milestones.filter((m) => m.achieved).length;
  return Math.round((completed / this.milestones.length) * 100);
});

// Virtual for active milestones
GamifiedProgressSchema.virtual("activeMilestones").get(function () {
  return this.milestones ? this.milestones.filter((m) => !m.achieved) : [];
});

module.exports = {
  GamifiedProgress: mongoose.model("GamifiedProgress", GamifiedProgressSchema),
};