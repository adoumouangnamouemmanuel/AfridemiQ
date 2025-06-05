const mongoose = require("mongoose");
const { Schema } = mongoose;

// Assessment Schema
const AssessmentSchema = new Schema(
  {
    format: { type: String, enum: ["quiz", "exam", "project"], required: true, default: "quiz" },
    title: { type: String, required: true },
    description: { type: String, required: true },
    questionIds: [{ type: Schema.Types.ObjectId, ref: "Question" }],
    passingScore: { type: Number, required: true },
    timeLimit: Number,
    attempts: { type: Number, required: true },
    feedback: {
      immediate: Boolean,
      detailed: Boolean,
      solutions: Boolean,
    },
    premiumOnly: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = {
  Assessment: mongoose.model("Assessment", AssessmentSchema),
};
