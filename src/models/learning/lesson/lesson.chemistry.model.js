const mongoose = require("mongoose");
const { Schema } = mongoose;

// Shared constants
const DIFFICULTY_LEVELS = ["beginner", "intermediate", "advanced"];
const MEDIA_TYPES = ["image", "audio", "video"];
const INTERACTIVE_ELEMENT_TYPES = ["geogebra", "desmos", "video", "quiz"];
const EXERCISE_TYPES = ["practice", "quiz", "assignment", "exam"];
const MATH_TOPICS = ["algebra", "geometry", "calculus", "statistics"];
const PHYSICS_TOPICS = [
  "mechanics",
  "electromagnetism",
  "thermodynamics",
  "optics",
];
const CHEMISTRY_TOPICS = [
  "stoichiometry",
  "organic_chemistry",
  "thermodynamics",
  "acids_bases",
];
const BIOLOGY_TOPICS = ["cell_biology", "genetics", "ecology", "physiology"];


// Chemistry Lesson Schema (New)
const ChemistryLessonSchema = new Schema({
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
    topic: { type: String, enum: CHEMISTRY_TOPICS, required: true },
    description: { type: String, required: true },
    keyEquations: [{
      equation: String,
      explanation: String,
    }],
    examples: [{
      problem: String,
      solutionSteps: [String],
      answer: String,
    }],
    visualAid: {
      mediaType: { type: String, enum: MEDIA_TYPES },
      url: {
        type: String,
        match: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
      },
      altText: String,
    },
    difficultyLevel: { type: String, enum: DIFFICULTY_LEVELS, required: true },
    conceptQuizId: { type: Schema.Types.ObjectId, ref: 'Quiz' },
  }],
  experiments: [{
    title: { type: String, required: true },
    objective: String,
    materials: [String],
    procedure: [String],
    expectedResults: String,
    safetyNotes: [String],
    dataTableTemplate: [{
      variable: String,
      unit: String,
      values: [Number],
    }],
    diagram: {
      mediaType: { type: String, enum: MEDIA_TYPES },
      url: {
        type: String,
        match: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
      },
      altText: String,
    },
    difficultyLevel: { type: String, enum: DIFFICULTY_LEVELS, required: true },
    experimentExerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise' },
  }],
  reactionAnalysis: [{
    reaction: { type: String, required: true },
    type: { type: String, enum: ['synthesis', 'decomposition', 'redox', 'acid_base', 'precipitation'] },
    balancedEquation: String,
    explanation: String,
    applications: [String],
    difficultyLevel: { type: String, enum: DIFFICULTY_LEVELS, required: true },
    reactionQuizId: { type: Schema.Types.ObjectId, ref: 'Quiz' },
  }],
  workedExamples: [{
    problem: { type: String, required: true },
    type: { type: String, enum: EXERCISE_TYPES, required: true },
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
  premiumOnly: { type: Boolean, default: false },
}, { timestamps: true });

// Indexes for performance
ChemistryLessonSchema.index({ 'concepts.conceptQuizId': 1 });
ChemistryLessonSchema.index({ 'experiments.experimentExerciseId': 1 });
ChemistryLessonSchema.index({ 'reactionAnalysis.reactionQuizId': 1 });
ChemistryLessonSchema.index({ 'practiceExercises.exerciseId': 1 });

// Pre-save hook for reference validation
ChemistryLessonSchema.pre('save', async function (next) {
  const quizIds = [
    ...this.concepts.filter(c => c.conceptQuizId).map(c => c.conceptQuizId),
    ...this.reactionAnalysis.filter(r => r.reactionQuizId).map(r => r.reactionQuizId),
  ];
  if (quizIds.length > 0) {
    const validQuizzes = await mongoose.model('Quiz').countDocuments({ _id: { $in: quizIds } });
    if (validQuizzes !== quizIds.length) {
      return next(new Error('Invalid Quiz IDs in concepts or reactionAnalysis'));
    }
  }
  const exerciseIds = [
    ...this.experiments.filter(e => e.experimentExerciseId).map(e => e.experimentExerciseId),
    ...this.practiceExercises.map(p => p.exerciseId),
  ];
  if (exerciseIds.length > 0) {
    const validExercises = await mongoose.model('Exercise').countDocuments({ _id: { $in: exerciseIds } });
    if (validExercises !== exerciseIds.length) {
      return next(new Error('Invalid Exercise IDs in experiments or practiceExercises'));
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
ChemistryLessonSchema.virtual('estimatedTime').get(function () {
  return this.duration || (
    this.concepts.length * 15 +
    this.experiments.length * 20 +
    this.reactionAnalysis.length * 10 +
    this.practiceExercises.length * 10
  ); // Example calculation in minutes
});

// Virtual for completion status
ChemistryLessonSchema.virtual('completionStatus').get(function () {
  // Placeholder: Implement based on user progress
  return 'not_started';
});


module.exports = {
    ChemistryLesson: mongoose.model('Lesson').discriminator('chemistry', ChemistryLessonSchema)
}