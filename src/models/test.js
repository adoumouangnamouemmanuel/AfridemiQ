const mongoose = require('mongoose');
const { Schema } = mongoose;

// Shared constants
const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'];





const ExerciseSchema = new Schema({
  type: { type: String, enum: ['practice', 'quiz', 'assignment', 'exam'], required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  series: String,
  topicId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: DIFFICULTY_LEVELS, required: true },
  timeLimit: Number,
  points: { type: Number, required: true },
  content: {
    instructions: String,
    attachments: [{ type: String, url: String, description: String }],
    subjectSpecific: {
      math: {
        problems: [{ statement: String, variables: [String], constraints: [String] }],
        formulas: [String],
        calculatorAllowed: Boolean,
      },
      french: {
        textAnalysis: { text: String, questions: [String] },
        grammarExercises: [String],
      },
      // Add other subjects as needed
    },
  },
  solution: {
    answer: Schema.Types.Mixed,
    explanation: String,
    steps: [String],
    subjectSpecific: {
      math: {
        workingSteps: [String],
        formulas: [String],
      },
      french: {
        modelAnswer: String,
        guidelines: [String],
      },
    },
  },
  metadata: {
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: Date,
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    lastModified: Date,
    version: Number,
    tags: [String],
    difficultyMetrics: { successRate: Number, averageTimeToComplete: Number, skipRate: Number },
    accessibility: {
      hasAudioVersion: Boolean,
      hasBrailleVersion: Boolean,
      hasSignLanguageVideo: Boolean,
    },
  },
  premiumOnly: { type: Boolean, default: false },
}, { timestamps: true });


// Models
module.exports = {
  Exercise: mongoose.model('Exercise', ExerciseSchema),
};