const mongoose = require("mongoose");
const { Schema } = mongoose;

const DIFFICULTY_LEVELS = ["beginner", "intermediate", "advanced"];

const TopicSchema = new Schema(
  {
    name: { type: String, required: true },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },
    series: [String],
    description: { type: String, required: true },
    difficulty: { type: String, enum: DIFFICULTY_LEVELS, required: true },
    estimatedTime: { type: Number, required: true },
    estimatedCompletionDate: Date,
    relatedTopics: [String],
    hasPractice: { type: Boolean, default: false },
    hasNote: { type: Boolean, default: false },
    hasStudyMaterial: { type: Boolean, default: false },
    prerequisites: [String],
    learningObjectives: [String],
    estimatedTimeToMaster: { type: Number, required: true },
    resourceIds: [
      { type: Schema.Types.ObjectId, ref: "Resource", default: [] },
    ],
    assessmentCriteria: {
      minimumScore: Number,
      requiredPracticeQuestions: Number,
      masteryThreshold: Number,
    },
  },
  { timestamps: true }
);

// Indexes for better performance
TopicSchema.index({ name: 1 });
TopicSchema.index({ difficulty: 1 });
TopicSchema.index({ series: 1 });
TopicSchema.index({ subjectId: 1, difficulty: 1 });
TopicSchema.index({ createdAt: -1 });

// Virtual for related topics count
TopicSchema.virtual("relatedTopicsCount").get(function () {
  return this.relatedTopics ? this.relatedTopics.length : 0;
});

// Virtual for prerequisites count
TopicSchema.virtual("prerequisitesCount").get(function () {
  return this.prerequisites ? this.prerequisites.length : 0;
});

// Virtual for learning objectives count
TopicSchema.virtual("learningObjectivesCount").get(function () {
  return this.learningObjectives ? this.learningObjectives.length : 0;
});

// Ensure virtuals are included in JSON output
TopicSchema.set("toJSON", { virtuals: true });
TopicSchema.set("toObject", { virtuals: true });

module.exports = {
  Topic: mongoose.model("Topic", TopicSchema),
  DIFFICULTY_LEVELS,
};
