const mongoose = require("mongoose");
const { Schema } = mongoose;

// Shared Feedback Subschema
const FeedbackSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, min: 0, max: 10, required: true },
  comments: String,
  createdAt: { type: Date, default: Date.now },
});

const FeedbackLoopSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["question", "exercise", "lesson", "platform"],
      required: true,
      index: true,
    },
    feedback: [FeedbackSchema],
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved"],
      required: true,
      default: "pending",
      index: true,
    },
    response: {
      adminId: { type: Schema.Types.ObjectId, ref: "User" },
      message: String,
      date: Date,
    },
    attachments: [String],
  },
  { timestamps: true }
);

// Indexes for better performance
FeedbackLoopSchema.index({ userId: 1, type: 1 });
FeedbackLoopSchema.index({ status: 1, createdAt: -1 });
FeedbackLoopSchema.index({ "response.adminId": 1 });

// Virtual fields
FeedbackLoopSchema.virtual("averageRating").get(function () {
  if (this.feedback.length === 0) return 0;
  const total = this.feedback.reduce((sum, fb) => sum + fb.rating, 0);
  return Math.round((total / this.feedback.length) * 10) / 10;
});

FeedbackLoopSchema.virtual("feedbackCount").get(function () {
  return this.feedback.length;
});

FeedbackLoopSchema.virtual("hasResponse").get(function () {
  return !!(this.response && this.response.message);
});

FeedbackLoopSchema.virtual("isOverdue").get(function () {
  if (this.status === "resolved") return false;
  const daysSinceCreated = Math.floor(
    (new Date() - this.createdAt) / (1000 * 60 * 60 * 24)
  );
  return daysSinceCreated > 7; // Consider overdue after 7 days
});

module.exports = {
  FeedbackLoop: mongoose.model("FeedbackLoop", FeedbackLoopSchema),
};
