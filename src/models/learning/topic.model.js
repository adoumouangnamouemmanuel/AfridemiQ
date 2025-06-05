const mongoose = require('mongoose');
const { Schema } = mongoose;

const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'];

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
    resourceIds: [{ type: Schema.Types.ObjectId, ref: "Resource", default: [] }],
    assessmentCriteria: {
      minimumScore: Number,
      requiredPracticeQuestions: Number,
      masteryThreshold: Number,
    },
  },
  { timestamps: true }
);

module.exports = {
    Topic: mongoose.model('Topic', TopicSchema),
}
