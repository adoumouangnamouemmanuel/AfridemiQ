const mongoose = require("mongoose");
const { Schema } = mongoose;

const FeedbackSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, min: 0, max: 10, required: true },
  comments: { type: String, maxlength: 1000 },
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
    series: [{ type: String, trim: true, minlength: 1 }],
    questionIds: [{ type: Schema.Types.ObjectId, ref: "Question" }],
    correctCount: { type: Number, required: true, min: 0 },
    score: { type: Number, required: true, min: 0 },
    timeTaken: { type: Number, required: true, min: 0 }, // in seconds
    completedAt: { type: Date, default: Date.now },
    hintUsages: [{ type: Schema.Types.ObjectId, ref: "HintUsage" }],
    questionFeedback: {
      type: [FeedbackSchema],
      default: [],
      validate: [(v) => v.length <= 100, "Too many feedback entries"],
    },
    feedback: {
      title: { type: String, trim: true },
      subtitle: { type: String, trim: true },
      color: { type: String, trim: true },
      emoji: { type: String, trim: true },
      message: { type: String, trim: true, maxlength: 1000 },
    },
  },
  { timestamps: true }
);

// Indexes
QuizResultSchema.index({ userId: 1, quizId: 1 });
QuizResultSchema.index({ completedAt: 1 });
QuizResultSchema.index({ hintUsages: 1 });

// Pre-save middleware
QuizResultSchema.pre("save", async function (next) {
  try {
    const [user, quiz, questions, feedbackUsers, hintUsages] =
      await Promise.all([
        mongoose.model("User").findById(this.userId),
        mongoose.model("Quiz").findById(this.quizId),
        this.questionIds.length > 0
          ? mongoose.model("Question").find({ _id: { $in: this.questionIds } })
          : Promise.resolve([]),
        this.questionFeedback.length > 0
          ? mongoose
              .model("User")
              .find({
                _id: { $in: this.questionFeedback.map((f) => f.userId) },
              })
          : Promise.resolve([]),
        this.hintUsages.length > 0
          ? mongoose.model("HintUsage").find({ _id: { $in: this.hintUsages } })
          : Promise.resolve([]),
      ]);
    if (!user) return next(new Error("Invalid user ID"));
    if (!quiz) return next(new Error("Invalid quiz ID"));
    if (questions.length !== this.questionIds.length)
      return next(new Error("One or more invalid question IDs"));
    if (feedbackUsers.length !== this.questionFeedback.length)
      return next(new Error("One or more invalid feedback user IDs"));
    if (hintUsages.length !== this.hintUsages.length)
      return next(new Error("One or more invalid hint usage IDs"));
    if (this.correctCount > this.questionIds.length)
      return next(new Error("correctCount cannot exceed number of questions"));
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = {
  QuizResult: mongoose.model("QuizResult", QuizResultSchema),
};