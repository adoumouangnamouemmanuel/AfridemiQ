const mongoose = require("mongoose");
const { Schema } = mongoose;
// Shared constants
const DIFFICULTY_LEVELS = ["beginner", "intermediate", "advanced"];
const MEDIA_TYPES = ["image", "audio", "video"];
const INTERACTIVE_ELEMENT_TYPES = ["geogebra", "desmos", "video", "quiz"];

// Math Lesson Schema (Enhanced)
const MathLessonSchema = new Schema({
  introduction: {
    text: { type: String, required: true },
    videoUrl: {
      type: String,
      match: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
    },
    transcript: String,
    accessibility: {
      hasSubtitles: Boolean,
      hasAudioDescription: Boolean,
    },
  },
  concepts: [{
    name: { type: String, required: true },
    definition: { type: String, required: true },
    explanation: String,
    difficultyLevel: { type: String, enum: DIFFICULTY_LEVELS, required: true },
    examples: [{
      expression: { type: String, required: true },
      explanation: String,
      steps: [String],
    }],
    formulas: [{
      formula: { type: String, required: true },
      useCase: String,
      derivationSteps: [String],
    }],
    visualAid: {
      mediaType: { type: String, enum: MEDIA_TYPES },
      url: {
        type: String,
        match: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
      },
      altText: String,
    },
    conceptQuizId: { type: Schema.Types.ObjectId, ref: 'Quiz' },
  }],
  theorems: [{
    title: { type: String, required: true },
    statement: { type: String, required: true },
    proof: [String],
    diagram: {
      mediaType: { type: String, enum: MEDIA_TYPES },
      url: {
        type: String,
        match: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
      },
      altText: String,
    },
    applications: [String],
  }],
  workedExamples: [{
    problem: { type: String, required: true },
    solutionSteps: [String],
    answer: String,
    difficultyLevel: { type: String, enum: DIFFICULTY_LEVELS, required: true },
  }],
  practiceExercises: [{
    exerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise', required: true },
    type: { type: String, enum: EXERCISE_TYPES, required: true },
    description: String,
    difficultyLevel: { type: String, enum: DIFFICULTY_LEVELS, required: true },
  }],
  interactiveElements: [{
    elementType: { type: String, enum: INTERACTIVE_ELEMENT_TYPES, required: true },
    url: {
      type: String,
      match: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
      required: true,
    },
    instructions: String,
    offlineAvailable: { type: Boolean, default: false },
  }],
  summary: {
    keyTakeaways: [String],
    suggestedNextTopics: [{ type: Schema.Types.ObjectId, ref: 'Topic' }],
  },
  prerequisites: [{ type: Schema.Types.ObjectId, ref: 'Topic' }],
  learningObjectives: [String],
  gamification: {
    badges: [String],
    points: { type: Number, default: 0 },
  },
  progressTracking: {
    completedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    completionRate: { type: Number, default: 0 },
  },
  accessibilityOptions: {
    hasBraille: Boolean,
    hasSignLanguage: Boolean,
    languages: [String],
  },
}, { timestamps: true });

// Indexes for performance
MathLessonSchema.index({ 'concepts.conceptQuizId': 1 });
MathLessonSchema.index({ 'practiceExercises.exerciseId': 1 });

// Pre-save hook for reference validation
MathLessonSchema.pre('save', async function (next) {
  if (this.concepts.some(c => c.conceptQuizId)) {
    const quizIds = this.concepts.filter(c => c.conceptQuizId).map(c => c.conceptQuizId);
    const validQuizzes = await mongoose.model('Quiz').countDocuments({ _id: { $in: quizIds } });
    if (validQuizzes !== quizIds.length) {
      return next(new Error('Invalid Quiz IDs in concepts'));
    }
  }
  if (this.practiceExercises.length > 0) {
    const exerciseIds = this.practiceExercises.map(e => e.exerciseId);
    const validExercises = await mongoose.model('Exercise').countDocuments({ _id: { $in: exerciseIds } });
    if (validExercises !== exerciseIds.length) {
      return next(new Error('Invalid Exercise IDs in practiceExercises'));
    }
  }
  if (this.prerequisites.length > 0) {
    const validTopics = await mongoose.model('Topic').countDocuments({ _id: { $in: this.prerequisites } });
    if (validTopics !== this.prerequisites.length) {
      return next(new Error('Invalid Topic IDs in prerequisites'));
    }
  }
  if (this.summary.suggestedNextTopics.length > 0) {
    const validTopics = await mongoose.model('Topic').countDocuments({ _id: { $in: this.summary.suggestedNextTopics } });
    if (validTopics !== this.summary.suggestedNextTopics.length) {
      return next(new Error('Invalid Topic IDs in suggestedNextTopics'));
    }
  }
  next();
});

// Virtual for estimated time
MathLessonSchema.virtual('estimatedTime').get(function () {
  return this.duration || this.concepts.length * 10 + this.practiceExercises.length * 5; // Example calculation
});

module.exports = {
    MathLesson: mongoose.model('Lesson').discriminator('math', MathLessonSchema)
}