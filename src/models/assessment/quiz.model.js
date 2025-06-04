const mongoose = require("mongoose");
const { Schema } = mongoose;

const QuizSchema = new Schema(
  {
    title: { type: String, required: true },
    translations: {
      title: { fr: String, en: String },
      description: { fr: String, en: String },
    },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    series: String,
    topicIds: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
    questionIds: [{ type: Schema.Types.ObjectId, ref: "Question" }],
    totalQuestions: { type: Number, required: true },
    totalPoints: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    level: { type: String, required: true },
    timeLimit: { type: Number, required: true },
    retakePolicy: {
      maxAttempts: Number,
      cooldownMinutes: Number,
    },
    resultIds: [{ type: Schema.Types.ObjectId, ref: "QuizResult" }],
    offlineAvailable: { type: Boolean, default: false },
    premiumOnly: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = {
  Quiz: mongoose.model("Quiz", QuizSchema),
};
