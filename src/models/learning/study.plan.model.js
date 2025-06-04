const mongoose = require("mongoose");
const { Schema } = mongoose;

const StudyPlanSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    targetExam: { type: Schema.Types.ObjectId, ref: "Exam", required: true },
    targetSeries: String,
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    dailyGoals: [
      {
        day: String,
        topics: [
          {
            topicId: { type: Schema.Types.ObjectId, ref: "Topic" },
            duration: Number,
            priority: { type: String, enum: ["high", "medium", "low"] },
          },
        ],
        exercises: [
          {
            exerciseId: { type: Schema.Types.ObjectId, ref: "Exercise" },
            count: Number,
            type: String,
          },
        ],
        breaks: [
          {
            startTime: Number,
            endTime: Number,
            duration: Number,
          },
        ],
      },
    ],
    weeklyReview: {
      day: String,
      topics: [String],
      assessmentType: String,
    },
    progressTracking: {
      completedTopics: [String],
      weakAreas: [String],
      strongAreas: [String],
      adjustmentNeeded: Boolean,
    },
    reminders: [
      {
        type: { type: String, enum: ["study", "review", "assessment"] },
        time: String,
        message: String,
        repeat: { type: String, enum: ["daily", "weekly", "monthly"] },
      },
    ],
  },
  { timestamps: true }
);

module.exports = {
  StudyPlan: mongoose.model("StudyPlan", StudyPlanSchema),
};
