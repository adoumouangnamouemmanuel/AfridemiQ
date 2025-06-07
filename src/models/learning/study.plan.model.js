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
    targetSeries: [{ type: String, trim: true, minlength: 1 }],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    adaptiveLearningId: {
      type: Schema.Types.ObjectId,
      ref: "AdaptiveLearning",
    },
    dailyGoals: [
      {
        date: { type: Date, required: true },
        topics: [
          {
            topicId: {
              type: Schema.Types.ObjectId,
              ref: "Topic",
              required: true,
            },
            duration: { type: Number, min: 1, required: true }, // in minutes
            priority: {
              type: String,
              enum: ["high", "medium", "low"],
              required: true,
            },
          },
        ],
        exercises: [
          {
            exerciseId: {
              type: Schema.Types.ObjectId,
              ref: "Question",
              required: true,
            },
            count: { type: Number, min: 1, required: true },
            type: {
              type: String,
              enum: ["practice", "assessment"],
              required: true,
            },
          },
        ],
        breaks: [
          {
            startTime: {
              type: String,
              match: /^([01]\d|2[0-3]):[0-5]\d$/,
              required: true,
            }, // HH:mm
            endTime: {
              type: String,
              match: /^([01]\d|2[0-3]):[0-5]\d$/,
              required: true,
            }, // HH:mm
            duration: { type: Number, min: 1, required: true }, // in minutes
          },
        ],
      },
    ],
    weeklyReview: {
      day: {
        type: String,
        enum: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        required: true,
      },
      topics: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
      assessmentType: {
        type: String,
        enum: ["quiz", "mock_exam", "review"],
        required: true,
      },
    },
    progressTracking: {
      completedTopics: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
      weakAreas: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
      strongAreas: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
      adjustmentNeeded: { type: Boolean, default: false },
      lastAdjusted: { type: Date },
    },
    reminders: [
      {
        type: {
          type: String,
          enum: ["study", "review", "assessment"],
          required: true,
        },
        time: {
          type: String,
          match: /^([01]\d|2[0-3]):[0-5]\d$/,
          required: true,
        }, // HH:mm
        message: { type: String, trim: true, required: true },
        repeat: {
          type: String,
          enum: ["daily", "weekly", "monthly"],
          required: true,
        },
        status: {
          type: String,
          enum: ["active", "inactive"],
          default: "active",
        },
      },
    ],
  },
  { timestamps: true }
);

// Indexes for performance
StudyPlanSchema.index({ userId: 1, "dailyGoals.topics.topicId": 1 });
StudyPlanSchema.index({ targetExam: 1 });
StudyPlanSchema.index({ "dailyGoals.date": 1 });

// Pre-save middleware for validation
StudyPlanSchema.pre("save", async function (next) {
  try {
    // Validate userId and targetExam
    const [user, exam] = await Promise.all([
      mongoose.model("User").findById(this.userId),
      mongoose.model("Exam").findById(this.targetExam),
    ]);
    if (!user) return next(new Error("Invalid user ID"));
    if (!exam) return next(new Error("Invalid exam ID"));

    // Validate adaptiveLearningId
    if (this.adaptiveLearningId) {
      const adaptive = await mongoose
        .model("AdaptiveLearning")
        .findById(this.adaptiveLearningId);
      if (!adaptive) return next(new Error("Invalid adaptive learning ID"));
    }

    // Validate startDate < endDate
    if (this.startDate >= this.endDate) {
      return next(new Error("startDate must be before endDate"));
    }

    // Validate dailyGoals
    for (const goal of this.dailyGoals) {
      if (goal.date < this.startDate || goal.date > this.endDate) {
        return next(
          new Error("dailyGoals.date must be within startDate and endDate")
        );
      }
      if (goal.topics.length > 0) {
        const topics = await mongoose.model("Topic").find({
          _id: { $in: goal.topics.map((t) => t.topicId) },
        });
        if (topics.length !== goal.topics.length) {
          return next(new Error("One or more invalid topic IDs in dailyGoals"));
        }
      }
      if (goal.exercises.length > 0) {
        const questions = await mongoose.model("Question").find({
          _id: { $in: goal.exercises.map((e) => e.exerciseId) },
        });
        if (questions.length !== goal.exercises.length) {
          return next(
            new Error("One or more invalid exercise IDs in dailyGoals")
          );
        }
      }
    }

    // Validate weeklyReview.topics
    if (this.weeklyReview.topics.length > 0) {
      const topics = await mongoose.model("Topic").find({
        _id: { $in: this.weeklyReview.topics },
      });
      if (topics.length !== this.weeklyReview.topics.length) {
        return next(new Error("One or more invalid topic IDs in weeklyReview"));
      }
    }

    // Validate progressTracking
    const progressTopics = [
      ...this.progressTracking.completedTopics,
      ...this.progressTracking.weakAreas,
      ...this.progressTracking.strongAreas,
    ];
    if (progressTopics.length > 0) {
      const topics = await mongoose.model("Topic").find({
        _id: { $in: progressTopics },
      });
      if (topics.length !== progressTopics.length) {
        return next(
          new Error("One or more invalid topic IDs in progressTracking")
        );
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = {
  StudyPlan: mongoose.model("StudyPlan", StudyPlanSchema),
};