const mongoose = require('mongoose');
const { Schema } = mongoose;

// Shared constants
const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'];
const RESOURCE_TYPES = ['document', 'video', 'audio', 'interactive', 'past_exam'];

// Shared Feedback Subschema
const FeedbackSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 0, max: 10, required: true },
  comments: String,
  createdAt: { type: Date, default: Date.now },
});





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

const ResourceSchema = new Schema({
  type: { type: String, enum: RESOURCE_TYPES, required: true },
  title: { type: String, required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  series: String,
  topicId: { type: Schema.Types.ObjectId, ref: 'Topic' },
  url: { type: String, required: true },
  description: { type: String, required: true },
  level: { type: String, required: true },
  examId: { type: Schema.Types.ObjectId, ref: 'Exam' },
  thumbnail: String,
  offlineAvailable: { type: Boolean, default: false },
  premiumOnly: { type: Boolean, default: false },
  metadata: {
    fileSize: Number,
    duration: Number,
    format: String,
    language: String,
    tags: [String],
    difficulty: { type: String, enum: DIFFICULTY_LEVELS },
    prerequisites: [String],
    lastUpdated: Date,
    version: String,
    contributors: [String],
    license: String,
  },
  accessibility: {
    hasTranscript: Boolean,
    hasSubtitles: Boolean,
    hasAudioDescription: Boolean,
  },
  analytics: {
    views: Number,
    downloads: Number,
    averageRating: Number,
    userFeedback: [FeedbackSchema],
  },
}, { timestamps: true });



// Models
module.exports = {
  Exercise: mongoose.model('Exercise', ExerciseSchema),
  Resource: mongoose.model('Resource', ResourceSchema)
};