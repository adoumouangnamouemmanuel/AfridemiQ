const mongoose = require("mongoose");
const { Schema } = mongoose;

const CourseContentSchema = new Schema(
  {
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
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
          id: String,
          type: { type: String, enum: ["quiz", "exam", "project"] },
          title: String,
          description: String,
          questionIds: [{ type: Schema.Types.ObjectId, ref: "Question" }],
          passingScore: Number,
          timeLimit: Number,
          attempts: Number,
          feedback: {
            immediate: Boolean,
            detailed: Boolean,
            solutions: Boolean,
          },
          premiumOnly: Boolean,
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

// Index for lesson queries
CourseContentSchema.index({ "modules.lessons": 1, series: 1 });

module.exports = {
  CourseContent: mongoose.model("CourseContent", CourseContentSchema),
};
