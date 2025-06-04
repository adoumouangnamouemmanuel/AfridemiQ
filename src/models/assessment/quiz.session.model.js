const mongoose = require("mongoose");
const { Schema } = mongoose;

const QuizSessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
    startTime: { type: Date, default: Date.now },
    lastActive: Date,
    answers: [
      {
        questionId: { type: Schema.Types.ObjectId, ref: "Question" },
        selectedAnswer: Schema.Types.Mixed,
        timeSpent: Number,
      },
    ],
    status: {
      type: String,
      enum: ["in_progress", "completed", "abandoned"],
      required: true,
    },
    deviceInfo: {
      platform: String,
      version: String,
      lastSync: Date,
    },
  },
  { timestamps: true }
);

module.exports = {
  QuizSession: mongoose.model("QuizSession", QuizSessionSchema),
};
