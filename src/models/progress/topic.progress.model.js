const mongoose = require("mongoose");
const { Schema } = mongoose;

const TopicProgressSchema = new Schema(
  {
    topicId: {
      type: Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    series: String,
    masteryLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "mastered"],
      required: true,
    },
    timeSpent: { type: Number, default: 0 },
    lastStudied: Date,
    practiceSessions: [
      {
        date: Date,
        score: Number,
        timeSpent: Number,
      },
    ],
    weakAreas: [String],
    strongAreas: [String],
  },
  { timestamps: true }
);

module.exports = {
  TopicProgress: mongoose.model("TopicProgress", TopicProgressSchema),
};
