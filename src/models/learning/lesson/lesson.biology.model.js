const mongoose = require("mongoose");
const { Schema } = mongoose;

const DIFFICULTY_LEVELS = ["beginner", "intermediate", "advanced"];
const QUESTION_TYPES = ["multiple_choice", "short_answer", "essay"];
const MEDIA_TYPES = ["image", "audio", "video"];
const INTERACTIVE_ELEMENT_TYPES = ["geogebra", "desmos", "video", "quiz"];

// Biology Lesson Schema (New)
const BiologyLessonSchema = new Schema({
  introduction: {
    text: { type: String, required: true },
    translations: {
      text: { fr: String, en: String },
    },
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
    topic: { type: String, enum: BIOLOGY_TOPICS, required: true },
    translations: {
      name: { fr: String, en: String },
      description: { fr: String, en: String },
    },
    description: { type: String, required: true },
    keyProcesses: [{
      name: String,
      explanation: String,
      translations: {
        name: { fr: String, en: String },
        explanation: { fr: String, en: String },
      },
    }],
    examples: [{
      scenario: String,
      explanation: String,
      translations: {
        scenario: { fr: String, en: String },
        explanation: { fr: String, en: String },
      },
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
    translations: {
      title: { fr: String, en: String },
      objective: { fr: String, en: String },
      expectedResults: { fr: String, en: String },
    },
    experimentExerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise' },
  }],
  caseStudies: [{
    title: { type: String, required: true },
    context: String,
    questions: [{
      question: String,
      type: { type: String, enum: QUESTION_TYPES },
      translations: {
        question: { fr: String, en: String },
      },
    }],
    keyFindings: String,
    difficultyLevel: { type: String, enum: DIFFICULTY_LEVELS, required: true },
    translations: {
      title: { fr: String, en: String },
      context: { fr: String, en: String },
      keyFindings: { fr: String, en: String },
    },
    caseStudyQuizId: { type: Schema.Types.ObjectId, ref: 'Quiz' },
  }],
  workedExamples: [{
    problem: { type: String, required: true },
    type: { type: String, enum: EXERCISE_TYPES, required: true },
    solution: String,
    annotations: [String],
    difficultyLevel: { type: String, enum: DIFFICULTY_LEVELS, required: true },
    translations: {
      problem: { fr: String, en: String },
      solution: { fr: String, en: String },
      annotations: [{ fr: String, en: String }],
    },
  }],
  practiceExercises: [{
    exerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise', required: true },
    type: { type: String, enum: EXERCISE_TYPES, required: true },
    description: String,
    difficultyLevel: { type: String, enum: DIFFICULTY_LEVELS, required: true },
    translations: {
      description: { fr: String, en: String },
    },
  }],
  interactiveElements: [{
    elementType: { type: String, enum: INTERACTIVE_ELEMENT_TYPES, required: true },
    url: {
      type: String,
      match: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
      required: true,
    },
    instructions: String,
    translations: {
      instructions: { fr: String, en: String },
    },
    offlineAvailable: { type: Boolean, default: false },
  }],
  summary: {
    keyTakeaways: [String],
    translations: {
      keyTakeaways: [{ fr: String, en: String }],
    },
    suggestedNextTopics: [{ type: Schema.Types.ObjectId, ref: 'Topic' }],
  },
  prerequisites: [{ type: Schema.Types.ObjectId, ref: 'Topic' }],
  learningObjectives: [String],
  translations: {
    learningObjectives: [{ fr: String, en: String }],
  },
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
BiologyLessonSchema.index({ 'concepts.conceptQuizId': 1 });
BiologyLessonSchema.index({ 'experiments.experimentExerciseId': 1 });
BiologyLessonSchema.index({ 'caseStudies.caseStudyQuizId': 1 });
BiologyLessonSchema.index({ 'practiceExercises.exerciseId': 1 });

// Pre-save hook for reference validation
BiologyLessonSchema.pre('save', async function (next) {
  const quizIds = [
    ...this.concepts.filter(c => c.conceptQuizId).map(c => c.conceptQuizId),
    ...this.caseStudies.filter(c => c.caseStudyQuizId).map(c => c.caseStudyQuizId),
  ];
  if (quizIds.length > 0) {
    const validQuizzes = await mongoose.model('Quiz').countDocuments({ _id: { $in: quizIds } });
    if (validQuizzes !== quizIds.length) {
      return next(new Error('Invalid Quiz IDs in concepts or caseStudies'));
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
BiologyLessonSchema.virtual('estimatedTime').get(function () {
  return this.duration || (
    this.concepts.length * 15 +
    this.experiments.length * 20 +
    this.caseStudies.length * 15 +
    this.practiceExercises.length * 10
  ); // Example calculation in minutes
});

// Virtual for completion status
BiologyLessonSchema.virtual('completionStatus').get(function () {
  // Placeholder: Implement based on user progress
  return 'not_started';
});


module.exports = {
    BiologyLesson: mongoose.model('Lesson').discriminator('biology', BiologyLessonSchema)
}