const mongoose = require("mongoose");
const { Schema } = mongoose;

// Shared constants
const INTERACTIVITY_LEVELS = ["low", "medium", "high"];

// Shared Feedback Subschema
const FeedbackSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, min: 0, max: 10, required: true },
  comments: String,
  createdAt: { type: Date, default: Date.now },
});

// Lesson Base Schema
const LessonBaseSchema = new Schema(
  {
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    title: { type: String, required: true },
    series: String,
    overview: String,
    objectives: [String],
    keyPoints: [String],
    duration: { type: Number, required: true },
    resourceIds: [{ type: Schema.Types.ObjectId, ref: "Resource" }],
    exerciseIds: [{ type: Schema.Types.ObjectId, ref: "Exercise" }],
    interactivityLevel: {
      type: String,
      enum: INTERACTIVITY_LEVELS,
      required: true,
    },
    offlineAvailable: { type: Boolean, default: false },
    premiumOnly: { type: Boolean, default: false },
    feedback: [FeedbackSchema],
    metadata: {
      createdBy: { type: Schema.Types.ObjectId, ref: "User" },
      updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
  },
  {
    timestamps: true,
    discriminatorKey: "subjectType",
  }
);

// Pre-save hook for resource and exercise validation
LessonBaseSchema.pre("save", async function (next) {
  if (this.resourceIds.length > 0) {
    const validResources = await mongoose
      .model("Resource")
      .countDocuments({ _id: { $in: this.resourceIds } });
    if (validResources !== this.resourceIds.length) {
      return next(new Error("Invalid Resource IDs"));
    }
  }
  if (this.exerciseIds.length > 0) {
    const validExercises = await mongoose
      .model("Exercise")
      .countDocuments({ _id: { $in: this.exerciseIds } });
    if (validExercises !== this.exerciseIds.length) {
      return next(new Error("Invalid Exercise IDs"));
    }
  }
  next();
});

// Virtual for completion status
LessonBaseSchema.virtual("completionStatus").get(function () {
  // Placeholder: Implement based on user progress
  return "not_started";
});

module.exports = {
  Lesson: mongoose.model("Lesson", LessonBaseSchema),
};
