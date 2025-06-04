const mongoose = require("mongoose");
const { Schema } = mongoose;

// Shared constants
const DIFFICULTY_LEVELS = ["beginner", "intermediate", "advanced"];
const QUESTION_TYPES = ["multiple_choice", "short_answer", "essay"];
const MEDIA_TYPES = ["image", "audio", "video"];
const WRITING_FORMATS = ["essay", "letter", "commentary", "summary"];
const INTERACTIVE_ELEMENT_TYPES = ["geogebra", "desmos", "video", "quiz"];


// Philosophy Lesson Schema (New)
const PhilosophyLessonSchema = new Schema({
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
    topic: { type: String, enum: PHILOSOPHY_TOPICS, required: true },
    translations: {
      name: { fr: String, en: String },
      description: { fr: String, en: String },
    },
    description: { type: String, required: true },
    keyThinkers: [{
      name: String,
      contribution: String,
      translations: {
        name: { fr: String, en: String },
        contribution: { fr: String, en: String },
      },
    }],
    arguments: [{
      premise: String,
      conclusion: String,
      critique: String,
      translations: {
        premise: { fr: String, en: String },
        conclusion: { fr: String, en: String },
        critique: { fr: String, en: String },
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
  textAnalysis: [{
    title: { type: String, required: true },
    author: { type: String, required: true },
    excerpt: String,
    context: String,
    questions: [{
      question: String,
      type: { type: String, enum: QUESTION_TYPES },
      translations: {
        question: { fr: String, en: String },
      },
    }],
    difficultyLevel: { type: String, enum: DIFFICULTY_LEVELS, required: true },
    translations: {
      title: { fr: String, en: String },
      excerpt: { fr: String, en: String },
      context: { fr: String, en: String },
    },
    textQuizId: { type: Schema.Types.ObjectId, ref: 'Quiz' },
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
PhilosophyLessonSchema.index({ 'concepts.conceptQuizId': 1 });
PhilosophyLessonSchema.index({ 'textAnalysis.textQuizId': 1 });
PhilosophyLessonSchema.index({ 'practiceExercises.exerciseId': 1 });

// Pre-save hook for reference validation
PhilosophyLessonSchema.pre('save', async function (next) {
  const quizIds = [
    ...this.concepts.filter(c => c.conceptQuizId).map(c => c.conceptQuizId),
    ...this.textAnalysis.filter(t => t.textQuizId).map(t => t.textQuizId),
  ];
  if (quizIds.length > 0) {
    const validQuizzes = await mongoose.model('Quiz').countDocuments({ _id: { $in: quizIds } });
    if (validQuizzes !== quizIds.length) {
      return next(new Error('Invalid Quiz IDs in concepts or textAnalysis'));
    }
  }
  const exerciseIds = this.practiceExercises.map(p => p.exerciseId);
  if (exerciseIds.length > 0) {
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
PhilosophyLessonSchema.virtual('estimatedTime').get(function () {
  return this.duration || (
    this.concepts.length * 15 +
    this.textAnalysis.length * 20 +
    this.practiceExercises.length * 15
  ); // Example calculation in minutes
});

// Virtual for completion status
PhilosophyLessonSchema.virtual('completionStatus').get(function () {
  // Placeholder: Implement based on user progress
  return 'not_started';
});


// English Lesson Schema (New)
const EnglishLessonSchema = new Schema({
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
  grammar: [{
    rule: { type: String, required: true },
    topic: { type: String, enum: ENGLISH_TOPICS, default: 'grammar' },
    translations: {
      rule: { fr: String, en: String },
      explanation: { fr: String, en: String },
    },
    explanation: { type: String, required: true },
    examples: [String],
    difficultyLevel: { type: String, enum: DIFFICULTY_LEVELS, required: true },
    grammarExerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise' },
  }],
  vocabulary: [{
    word: { type: String, required: true },
    topic: { type: String, enum: ENGLISH_TOPICS, default: 'vocabulary' },
    translations: {
      word: { fr: String, en: String },
      definition: { fr: String, en: String },
      examples: [{ fr: String, en: String }],
    },
    definition: { type: String, required: true },
    partOfSpeech: String,
    examples: [String],
    pronunciation: String,
    synonyms: [String],
    difficultyLevel: { type: String, enum: DIFFICULTY_LEVELS, required: true },
    vocabularyQuizId: { type: Schema.Types.ObjectId, ref: 'Quiz' },
  }],
  readingComprehension: [{
    title: { type: String, required: true },
    text: { type: String, required: true },
    topic: { type: String, enum: ENGLISH_TOPICS, default: 'reading_comprehension' },
    translations: {
      title: { fr: String, en: String },
      text: { fr: String, en: String },
    },
    questions: [{
      question: String,
      type: { type: String, enum: QUESTION_TYPES },
      translations: {
        question: { fr: String, en: String },
      },
    }],
    difficultyLevel: { type: String, enum: DIFFICULTY_LEVELS, required: true },
    comprehensionQuizId: { type: Schema.Types.ObjectId, ref: 'Quiz' },
  }],
  writingSkills: [{
    format: { type: String, enum: WRITING_FORMATS, required: true },
    topic: { type: String, enum: ENGLISH_TOPICS, default: 'writing_skills' },
    translations: {
      guidelines: [{ fr: String, en: String }],
      modelAnswer: { fr: String, en: String },
    },
    guidelines: [String],
    prompts: [{
      prompt: String,
      instructions: String,
      translations: {
        prompt: { fr: String, en: String },
        instructions: { fr: String, en: String },
      },
    }],
    modelAnswer: String,
    difficultyLevel: { type: String, enum: DIFFICULTY_LEVELS, required: true },
    writingExerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise' },
  }],
  listeningComprehension: [{
    title: { type: String, required: true },
    audioUrl: {
      type: String,
      match: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
    },
    topic: { type: String, enum: ENGLISH_TOPICS, default: 'listening_comprehension' },
    transcript: String,
    questions: [{
      question: String,
      type: { type: String, enum: QUESTION_TYPES },
      translations: {
        question: { fr: String, en: String },
      },
    }],
    difficultyLevel: { type: String, enum: DIFFICULTY_LEVELS, required: true },
    translations: {
      title: { fr: String, en: String },
      transcript: { fr: String, en: String },
    },
    listeningQuizId: { type: Schema.Types.ObjectId, ref: 'Quiz' },
  }],
  speakingSkills: [{
    topic: { type: String, required: true, enum: ENGLISH_TOPICS, default: 'speaking_skills' },
    instructions: String,
    sampleDialogue: String,
    pronunciationGuide: String,
    difficultyLevel: { type: String, enum: DIFFICULTY_LEVELS, required: true },
    translations: {
      topic: { fr: String, en: String },
      instructions: { fr: String, en: String },
      sampleDialogue: { fr: String, en: String },
      pronunciationGuide: { fr: String, en: String },
    },
    speakingExerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise' },
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
EnglishLessonSchema.index({ 'grammar.grammarExerciseId': 1 });
EnglishLessonSchema.index({ 'vocabulary.vocabularyQuizId': 1 });
EnglishLessonSchema.index({ 'readingComprehension.comprehensionQuizId': 1 });
EnglishLessonSchema.index({ 'writingSkills.writingExerciseId': 1 });
EnglishLessonSchema.index({ 'listeningComprehension.listeningQuizId': 1 });
EnglishLessonSchema.index({ 'speakingSkills.speakingExerciseId': 1 });
EnglishLessonSchema.index({ 'practiceExercises.exerciseId': 1 });

// Pre-save hook for reference validation
EnglishLessonSchema.pre('save', async function (next) {
  const quizIds = [
    ...this.vocabulary.filter(v => v.vocabularyQuizId).map(v => v.vocabularyQuizId),
    ...this.readingComprehension.filter(r => r.comprehensionQuizId).map(r => r.comprehensionQuizId),
    ...this.listeningComprehension.filter(l => l.listeningQuizId).map(l => l.listeningQuizId),
  ];
  if (quizIds.length > 0) {
    const validQuizzes = await mongoose.model('Quiz').countDocuments({ _id: { $in: quizIds } });
    if (validQuizzes !== quizIds.length) {
      return next(new Error('Invalid Quiz IDs in vocabulary, readingComprehension, or listeningComprehension'));
    }
  }
  const exerciseIds = [
    ...this.grammar.filter(g => g.grammarExerciseId).map(g => g.grammarExerciseId),
    ...this.writingSkills.filter(w => w.writingExerciseId).map(w => w.writingExerciseId),
    ...this.speakingSkills.filter(s => s.speakingExerciseId).map(s => s.speakingExerciseId),
    ...this.practiceExercises.map(p => p.exerciseId),
  ];
  if (exerciseIds.length > 0) {
    const validExercises = await mongoose.model('Exercise').countDocuments({ _id: { $in: exerciseIds } });
    if (validExercises !== exerciseIds.length) {
      return next(new Error('Invalid Exercise IDs in grammar, writingSkills, speakingSkills, or practiceExercises'));
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
EnglishLessonSchema.virtual('estimatedTime').get(function () {
  return this.duration || (
    this.grammar.length * 10 +
    this.vocabulary.length * 5 +
    this.readingComprehension.length * 15 +
    this.writingSkills.length * 20 +
    this.listeningComprehension.length * 15 +
    this.speakingSkills.length * 15 +
    this.practiceExercises.length * 10
  ); // Example calculation in minutes
});

// Virtual for completion status
EnglishLessonSchema.virtual('completionStatus').get(function () {
  // Placeholder: Implement based on user progress
  return 'not_started';
});

module.exports = {
    EnglishLesson: mongoose.model('Lesson').discriminator('english', EnglishLessonSchema)
}