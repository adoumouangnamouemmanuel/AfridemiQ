const mongoose = require('mongoose');
const { Schema } = mongoose;

// Shared Feedback Subschema
const FeedbackSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 0, max: 10, required: true },
  comments: String,
  createdAt: { type: Date, default: Date.now },
});


const QuizResultSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
    questionIds: [{ type: Schema.Types.ObjectId, ref: "Question" }],
    correctCount: { type: Number, required: true },
    score: { type: Number, required: true },
    timeTaken: { type: Number, required: true },
    completedAt: { type: Date, default: Date.now },
    hintUsages: [{ type: Schema.Types.ObjectId, ref: "HintUsage" }],
    questionFeedback: [FeedbackSchema],
    feedback: {
      title: String,
      subtitle: String,
      color: String,
      emoji: String,
      message: String,
    },
  },
  { timestamps: true }
);

// Index for quiz result queries
QuizResultSchema.index({ userId: 1, quizId: 1 });

module.exports = {
  QuizResult: mongoose.model("QuizResult", QuizResultSchema)
};  