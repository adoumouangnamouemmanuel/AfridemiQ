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
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["question", "exercise", "lesson", "platform"],
      required: true,
    },
    contentId: { type: Schema.Types.ObjectId, required: true },
    feedback: [FeedbackSchema],
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved"],
      required: true,
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

module.exports = {
  FeedbackLoop: mongoose.model("FeedbackLoop", FeedbackLoopSchema),
};
