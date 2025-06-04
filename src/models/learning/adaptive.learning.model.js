const mongoose = require("mongoose");
const { Schema } = mongoose;

// Shared constants
const DIFFICULTY_LEVELS = ["beginner", "intermediate", "advanced"];

const AdaptiveLearningSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    currentLevel: { type: String, enum: DIFFICULTY_LEVELS, required: true },
    series: String,
    adjustmentRules: [
      {
        metric: { type: String, enum: ["score", "timeSpent", "accuracy"] },
        threshold: Number,
        action: {
          type: String,
          enum: ["increaseDifficulty", "decreaseDifficulty", "suggestResource"],
        },
        resourceId: { type: Schema.Types.ObjectId, ref: "Resource" },
      },
    ],
    recommendedContent: [
      {
        contentType: { type: String, enum: ["topic", "quiz", "resource"] },
        id: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = {
  AdaptiveLearning: mongoose.model("AdaptiveLearning", AdaptiveLearningSchema),
};
