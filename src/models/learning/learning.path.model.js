const mongoose = require("mongoose");
const { Schema } = mongoose;
const {
  DIFFICULTY_LEVELS,
} = require("../../models/learning/adaptive.learning.model");

const LearningPathSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    targetExam: { type: Schema.Types.ObjectId, ref: "Exam", required: true },
    targetSeries: [{ type: String, trim: true, minlength: 1 }],
    duration: { type: Number, required: true, min: 1 }, // in weeks
    levels: [
      {
        level: { type: Number, required: true, min: 1 },
        name: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        difficulty: { type: String, enum: DIFFICULTY_LEVELS, required: true },
        modules: [{ type: Schema.Types.ObjectId, ref: "CourseContent" }],
        prerequisites: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
        expectedOutcomes: [{ type: String, trim: true }],
      },
    ],
    milestones: [
      {
        name: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        requiredAchievements: [{ type: String, trim: true }],
        reward: {
          type: {
            type: String,
            enum: ["badge", "certificate", "points"],
            required: true,
          },
          name: {
            type: String,
            required: function () {
              return this.type !== "points";
            },
          },
          points: {
            type: Number,
            required: function () {
              return this.type === "points";
            },
          },
        },
      },
    ],
    adaptiveLearning: {
      difficultyAdjustment: { type: Boolean, default: false },
      personalizedPacing: { type: Boolean, default: false },
      adaptiveLearningId: {
        type: Schema.Types.ObjectId,
        ref: "AdaptiveLearning",
      },
      remediationPaths: [
        {
          topicId: { type: Schema.Types.ObjectId, ref: "Topic" },
          alternativeResources: [
            { type: Schema.Types.ObjectId, ref: "Resource" },
          ],
          practiceExercises: [{ type: Schema.Types.ObjectId, ref: "Question" }],
        },
      ],
    },
  },
  { timestamps: true }
);

// Indexes for performance
LearningPathSchema.index({ targetExam: 1 });
LearningPathSchema.index({ "levels.level": 1 });

// Pre-save middleware to validate references
LearningPathSchema.pre("save", async function (next) {
  try {
    // Validate targetExam
    if (this.targetExam) {
      const exam = await mongoose.model("Exam").findById(this.targetExam);
      if (!exam) return next(new Error("Invalid exam ID"));
    }

    // Validate levels.modules and prerequisites
    for (const level of this.levels) {
      if (level.modules.length > 0) {
        const modules = await mongoose.model("CourseContent").find({
          _id: { $in: level.modules },
        });
        if (modules.length !== level.modules.length) {
          return next(new Error("One or more invalid module IDs"));
        }
      }
      if (level.prerequisites.length > 0) {
        const topics = await mongoose.model("Topic").find({
          _id: { $in: level.prerequisites },
        });
        if (topics.length !== level.prerequisites.length) {
          return next(new Error("One or more invalid prerequisite IDs"));
        }
      }
    }

    // Validate remediationPaths
    for (const path of this.adaptiveLearning.remediationPaths) {
      if (path.topicId) {
        const topic = await mongoose.model("Topic").findById(path.topicId);
        if (!topic)
          return next(new Error("Invalid topic ID in remediation path"));
      }
      if (path.alternativeResources.length > 0) {
        const resources = await mongoose.model("Resource").find({
          _id: { $in: path.alternativeResources },
        });
        if (resources.length !== path.alternativeResources.length) {
          return next(new Error("One or more invalid resource IDs"));
        }
      }
      if (path.practiceExercises.length > 0) {
        const questions = await mongoose.model("Question").find({
          _id: { $in: path.practiceExercises },
        });
        if (questions.length !== path.practiceExercises.length) {
          return next(new Error("One or more invalid question IDs"));
        }
      }
    }

    // Validate adaptiveLearningId
    if (this.adaptiveLearning.adaptiveLearningId) {
      const adaptive = await mongoose
        .model("AdaptiveLearning")
        .findById(this.adaptiveLearning.adaptiveLearningId);
      if (!adaptive) return next(new Error("Invalid adaptive learning ID"));
    }

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = {
  LearningPath: mongoose.model("LearningPath", LearningPathSchema),
};