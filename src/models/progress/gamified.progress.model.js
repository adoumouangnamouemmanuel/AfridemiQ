const mongoose = require("mongoose");
const { Schema } = mongoose;

const GamifiedProgressSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    series: [String],
    milestones: [
      {
        id: String,
        description: String,
        targetValue: Number,
        currentValue: Number,
        achieved: Boolean,
        achievedDate: Date,
        reward: {
          type: { type: String, enum: ["badge", "points", "feature"] },
          value: String,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = {
  GamifiedProgress: mongoose.model("GamifiedProgress", GamifiedProgressSchema),
};
