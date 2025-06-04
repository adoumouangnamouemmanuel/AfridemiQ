const mongoose = require("mongoose");
const { Schema } = mongoose;

const HintUsageSchema = new Schema(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    usedAt: { type: Date, default: Date.now },
    stepsViewed: [Number],
  },
  { timestamps: true }
);

module.exports = {
  Hint: mongoose.model("HintUsage", HintUsageSchema),
};
