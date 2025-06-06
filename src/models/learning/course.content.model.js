const mongoose = require("mongoose");
const { Schema } = mongoose;

// Shared constants
const DIFFICULTY_LEVELS = ["beginner", "intermediate", "advanced"];

const CourseContentSchema = new Schema(
  {
    examId: [{ type: Schema.Types.ObjectId, ref: "Exam", required: true }],
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    topicId: [{ type: Schema.Types.ObjectId, ref: "Topic", required: true }],
    series: String,
    title: { type: String, required: true },
    description: { type: String, required: true },
    level: { type: String, enum: DIFFICULTY_LEVELS, required: true },
    modules: [
      {
        id: String,
        title: String,
        description: String,
        order: Number,
        series: String,
        lessons: [{ type: Schema.Types.ObjectId, ref: "Lesson" }],
        exerciseIds: [{ type: Schema.Types.ObjectId, ref: "Exercise" }],
        assessment: {
          type: Schema.Types.ObjectId,
          ref: "Assessment",
          default: null,
        },
        progressTracking: {
          completedLessons: Number,
          totalLessons: Number,
        },
      },
    ],
    prerequisites: [String],
    estimatedDuration: Number,
    progressTracking: {
      completedLessons: Number,
      totalLessons: Number,
    },
    accessibilityOptions: {
      languages: [String],
      formats: [String],
      accommodations: [String],
    },
    premiumOnly: { type: Boolean, default: false },
    metadata: {
      createdBy: { type: Schema.Types.ObjectId, ref: "User" },
      createdAt: Date,
      updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
      tags: [String],
    },
  },
  { timestamps: true }
);

// Performance indexes
CourseContentSchema.index({ subjectId: 1, series: 1 });
CourseContentSchema.index({ examId: 1 });
CourseContentSchema.index({ topicId: 1 });
CourseContentSchema.index({ level: 1 });
CourseContentSchema.index({ "modules.lessons": 1, series: 1 });
CourseContentSchema.index({ premiumOnly: 1 });
CourseContentSchema.index({ "metadata.tags": 1 });

// Virtual fields
CourseContentSchema.virtual("totalModules").get(function () {
  return this.modules ? this.modules.length : 0;
});

CourseContentSchema.virtual("completionPercentage").get(function () {
  if (!this.progressTracking || this.progressTracking.totalLessons === 0)
    return 0;
  return Math.round(
    (this.progressTracking.completedLessons /
      this.progressTracking.totalLessons) *
      100
  );
});

CourseContentSchema.virtual("isCompleted").get(function () {
  return (
    this.progressTracking &&
    this.progressTracking.completedLessons ===
      this.progressTracking.totalLessons
  );
});

// Ensure virtual fields are serialized
CourseContentSchema.set("toJSON", { virtuals: true });
CourseContentSchema.set("toObject", { virtuals: true });

module.exports = {
  CourseContent: mongoose.model("CourseContent", CourseContentSchema),
  DIFFICULTY_LEVELS,
};
