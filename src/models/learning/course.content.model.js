const mongoose = require("mongoose");
const { Schema } = mongoose;

// Shared constants
const DIFFICULTY_LEVELS = ["Beginner", "Intermediate", "Advanced"];

const CourseContentSchema = new Schema(
  {
    examId: [{ type: Schema.Types.ObjectId, ref: "Exam", required: true }],
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    topicIds: [{ type: Schema.Types.ObjectId, ref: "Topic", required: true }],
    series: [String],
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

// Pre-save middleware to validate references
CourseContentSchema.pre("save", async function (next) {
  try {
    // Validate subjectId
    if (this.subjectId) {
      const subject = await mongoose.model("Subject").findById(this.subjectId);
      if (!subject) {
        return next(new Error("Invalid subject ID"));
      }
    }

    // Validate topicIds
    if (this.topicIds && this.topicIds.length > 0) {
      const topics = await mongoose.model("Topic").find({
        _id: { $in: this.topicIds },
      });
      if (topics.length !== this.topicIds.length) {
        return next(new Error("One or more invalid topic IDs"));
      }
    }

    // Validate examId
    if (this.examId && this.examId.length > 0) {
      const exams = await mongoose.model("Exam").find({
        _id: { $in: this.examId },
      });
      if (exams.length !== this.examId.length) {
        return next(new Error("One or more invalid exam IDs"));
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Ensure virtual fields are serialized
CourseContentSchema.set("toJSON", { virtuals: true });
CourseContentSchema.set("toObject", { virtuals: true });

module.exports = {
  CourseContent: mongoose.model("CourseContent", CourseContentSchema),
  DIFFICULTY_LEVELS,
};
