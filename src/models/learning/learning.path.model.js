const mongoose = require("mongoose");
const { Schema } = mongoose;

const LearningPathSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    targetExam: { type: Schema.Types.ObjectId, ref: "Exam", required: true },
    targetSeries: String,
    duration: { type: Number, required: true },
    levels: [
      {
        level: Number,
        name: String,
        description: String,
        modules: [String],
        prerequisites: [String],
        expectedOutcomes: [String],
      },
    ],
    milestones: [
      {
        id: String,
        name: String,
        description: String,
        requiredAchievements: [String],
        reward: {
          type: { type: String, enum: ["badge", "certificate", "points"] },
          value: String,
        },
      },
    ],
    adaptiveLearning: {
      difficultyAdjustment: Boolean,
      personalizedPacing: Boolean,
      remediationPaths: [
        {
          topicId: String,
          alternativeResources: [String],
          practiceExercises: [String],
        },
      ],
    },
  },
  { timestamps: true }
);

module.exports = {
  LearningPath: mongoose.model("LearningPath", LearningPathSchema),
};
