const mongoose = require('mongoose');
const { Schema } = mongoose;

// Shared constants
const SUBJECT_TYPES = [
  'french', 'english', 'math', 'physics', 'chemistry', 'biology',
  'history', 'geography', 'philosophy'
];
const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'];
const INTERACTIVITY_LEVELS = ['low', 'medium', 'high'];
const QUESTION_TYPES = ['multiple_choice', 'short_answer', 'essay'];
const RESOURCE_TYPES = ['document', 'video', 'audio', 'interactive', 'past_exam'];
const MEDIA_TYPES = ['image', 'audio', 'video'];
const WRITING_FORMATS = ['essay', 'letter', 'commentary', 'summary'];
const INTERACTIVE_ELEMENT_TYPES = ['geogebra', 'desmos', 'video', 'quiz'];
const USER_ROLES = ['student', 'teacher', 'admin'];

// Shared Feedback Subschema
const FeedbackSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 0, max: 10, required: true },
  comments: String,
  createdAt: { type: Date, default: Date.now },
});



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

// History Lesson Schema (New)
const HistoryLessonSchema = new Schema({
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
    topic: { type: String, enum: HISTORY_TOPICS, required: true },
    translations: {
      name: { fr: String, en: String },
      description: { fr: String, en: String },
    },
    description: { type: String, required: true },
    keyEvents: [{
      event: String,
      date: String,
      significance: String,
      translations: {
        event: { fr: String, en: String },
        significance: { fr: String, en: String },
      },
    }],
    keyFigures: [{
      name: String,
      role: String,
      translations: {
        name: { fr: String, en: String },
        role: { fr: String, en: String },
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
  sourceAnalysis: [{
    title: { type: String, required: true },
    sourceType: { type: String, enum: ['primary', 'secondary'], required: true },
    excerpt: String,
    author: String,
    date: String,
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
    sourceQuizId: { type: Schema.Types.ObjectId, ref: 'Quiz' },
  }],
  timeline: [{
    period: { type: String, required: true },
    startDate: String,
    endDate: String,
    events: [{
      event: String,
      date: String,
      description: String,
      translations: {
        event: { fr: String, en: String },
        description: { fr: String, en: String },
      },
    }],
    difficultyLevel: { type: String, enum: DIFFICULTY_LEVELS, required: true },
    translations: {
      period: { fr: String, en: String },
    },
    timelineExerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise' },
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
      match: /^https?:\/\/(www\.)?[-a-zA-Z0-9()@:%._\+~#=]{1,256}\.[a-z]{2,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
      required: true,
    },
    instructions: String,
    translations: {
      instructions: [{ fr: String, en: String }],
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
HistoryLessonSchema.index({ 'concepts.conceptQuizId': 1 });
HistoryLessonSchema.index({ 'sourceAnalysis.sourceQuizId': 1 });
HistoryLessonSchema.index({ 'timeline.timelineExerciseId': 1 });
HistoryLessonSchema.index({ 'practiceExercises.exerciseId': 1 });

// Pre-save hook for reference validation
HistoryLessonSchema.pre('save', async function (next) {
  const quizIds = [
    ...this.concepts.filter(c => c.conceptQuizId).map(c => c.conceptQuizId),
    ...this.sourceAnalysis.filter(s => s.sourceQuizId).map(s => s.sourceQuizId),
  ];
  if (quizIds.length > 0) {
    const validQuizzes = await mongoose.model('Quiz').countDocuments({ _id: { $in: quizIds } });
    if (validQuizzes !== quizIds.length) {
      return next(new Error('Invalid Quiz IDs in concepts or sourceAnalysis'));
    }
  }
  const exerciseIds = [
    ...this.timeline.filter(t => t.timelineExerciseId).map(t => t.timelineExerciseId),
    ...this.practiceExercises.map(p => p.exerciseId),
  ];
  if (exerciseIds.length > 0) {
    const validExercises = await mongoose.model('Exercise').countDocuments({ _id: { $in: exerciseIds } });
    if (validExercises !== exerciseIds.length) {
      return next(new Error('Invalid Exercise IDs in timeline or practiceExercises'));
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
HistoryLessonSchema.virtual('estimatedTime').get(function () {
  return this.duration || (
    this.concepts.length * 15 +
    this.sourceAnalysis.length * 20 +
    this.timeline.length * 10 +
    this.practiceExercises.length * 15
  ); // Example calculation in minutes
});

// Virtual for completion status
HistoryLessonSchema.virtual('completionStatus').get(function () {
  // Placeholder: Implement based on user progress
  return 'not_started';
});

// Geography Lesson Schema (New)
const GeographyLessonSchema = new Schema({
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
    topic: { type: String, enum: GEOGRAPHY_TOPICS, required: true },
    translations: {
      name: { fr: String, en: String },
      description: { fr: String, en: String },
    },
    description: { type: String, required: true },
    keyFeatures: [{
      feature: String,
      explanation: String,
      translations: {
        feature: { fr: String, en: String },
        explanation: { fr: String, en: String },
      },
    }],
    examples: [{
      example: String,
      explanation: String,
      translations: {
        example: { fr: String, en: String },
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
  mapAnalysis: [{
    title: { type: String, required: true },
    mapType: { type: String, enum: ['physical', 'political', 'thematic'], required: true },
    mapUrl: {
      type: String,
      match: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
    },
    description: String,
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
      description: { fr: String, en: String },
    },
    mapQuizId: { type: Schema.Types.ObjectId, ref: 'Quiz' },
  }],
  caseStudies: [{
    title: { type: String, required: true },
    region: String,
    context: String,
    data: [{
      variable: String,
      value: String,
      unit: String,
      translations: {
        variable: { fr: String, en: String },
        value: { fr: String, en: String },
      },
    }],
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
      context: { fr: String, en: String },
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
GeographyLessonSchema.index({ 'concepts.conceptQuizId': 1 });
GeographyLessonSchema.index({ 'mapAnalysis.mapQuizId': 1 });
GeographyLessonSchema.index({ 'caseStudies.caseStudyQuizId': 1 });
GeographyLessonSchema.index({ 'practiceExercises.exerciseId': 1 });

// Pre-save hook for reference validation
GeographyLessonSchema.pre('save', async function (next) {
  const quizIds = [
    ...this.concepts.filter(c => c.conceptQuizId).map(c => c.conceptQuizId),
    ...this.mapAnalysis.filter(m => m.mapQuizId).map(m => m.mapQuizId),
    ...this.caseStudies.filter(c => c.caseStudyQuizId).map(c => c.caseStudyQuizId),
  ];
  if (quizIds.length > 0) {
    const validQuizzes = await mongoose.model('Quiz').countDocuments({ _id: { $in: quizIds } });
    if (validQuizzes !== quizIds.length) {
      return next(new Error('Invalid Quiz IDs in concepts, mapAnalysis, or caseStudies'));
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
GeographyLessonSchema.virtual('estimatedTime').get(function () {
  return this.duration || (
    this.concepts.length * 15 +
    this.mapAnalysis.length * 20 +
    this.caseStudies.length * 20 +
    this.practiceExercises.length * 15
  ); // Example calculation in minutes
});

// Virtual for completion status
GeographyLessonSchema.virtual('completionStatus').get(function () {
  // Placeholder: Implement based on user progress
  return 'not_started';
});

// Assessment Schema
const AssessmentSchema = new Schema({
  type: { type: String, enum: ['quiz', 'exam', 'project'], required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  questionIds: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
  passingScore: { type: Number, required: true },
  timeLimit: Number,
  attempts: { type: Number, required: true },
  feedback: {
    immediate: Boolean,
    detailed: Boolean,
    solutions: Boolean,
  },
  premiumOnly: { type: Boolean, default: false },
}, { timestamps: true });

const QuestionSchema = new Schema({
  topicId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true, index: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
  series: String,
  question: { type: String, required: true },
  type: { type: String, enum: QUESTION_TYPES, required: true },
  options: [String],
  correctAnswer: { type: Schema.Types.Mixed, required: true },
  explanation: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  points: { type: Number, required: true },
  steps: [String],
  tags: [String],
  relatedQuestions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
  difficultyMetrics: {
    successRate: Number,
    averageTimeToAnswer: Number,
    skipRate: Number,
  },
  content: {
    media: [{
      mediaType: { type: String, enum: MEDIA_TYPES },
      url: { type: String, match: /^https?:\/\/.+/ },
      altText: String,
    }],
    accessibility: {
      hasAudioVersion: Boolean,
      hasBrailleVersion: Boolean,
      hasSignLanguageVideo: Boolean,
    },
  },
  premiumOnly: { type: Boolean, default: false },
}, { timestamps: true });

const QuizSchema = new Schema({
  title: { type: String, required: true },
  translations: {
    title: { fr: String, en: String },
    description: { fr: String, en: String },
  },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  series: String,
  topicIds: [{ type: Schema.Types.ObjectId, ref: 'Topic' }],
  questionIds: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
  totalQuestions: { type: Number, required: true },
  totalPoints: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  level: { type: String, required: true },
  timeLimit: { type: Number, required: true },
  retakePolicy: {
    maxAttempts: Number,
    cooldownMinutes: Number,
  },
  resultIds: [{ type: Schema.Types.ObjectId, ref: 'QuizResult' }],
  offlineAvailable: { type: Boolean, default: false },
  premiumOnly: { type: Boolean, default: false },
}, { timestamps: true });

const QuizSessionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
  startTime: { type: Date, default: Date.now },
  lastActive: Date,
  answers: [{
    questionId: { type: Schema.Types.ObjectId, ref: 'Question' },
    selectedAnswer: Schema.Types.Mixed,
    timeSpent: Number,
  }],
  status: { type: String, enum: ['in_progress', 'completed', 'abandoned'], required: true },
  deviceInfo: {
    platform: String,
    version: String,
    lastSync: Date,
  },
}, { timestamps: true });

const QuizResultSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
  questionIds: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
  correctCount: { type: Number, required: true },
  score: { type: Number, required: true },
  timeTaken: { type: Number, required: true },
  completedAt: { type: Date, default: Date.now },
  hintUsages: [{ type: Schema.Types.ObjectId, ref: 'HintUsage' }],
  questionFeedback: [FeedbackSchema],
  feedback: {
    title: String,
    subtitle: String,
    color: String,
    emoji: String,
    message: String,
  },
}, { timestamps: true });

// Index for quiz result queries
QuizResultSchema.index({ userId: 1, quizId: 1 });

const HintUsageSchema = new Schema({
  questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  usedAt: { type: Date, default: Date.now },
  stepsViewed: [Number],
}, { timestamps: true });

const BookmarkSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

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

const StudyGroupSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  memberIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  challengeIds: [{ type: Schema.Types.ObjectId, ref: 'Challenge' }],
  createdAt: { type: Date, default: Date.now },
  features: {
    chatEnabled: Boolean,
    fileSharing: Boolean,
    liveSessions: Boolean,
    progressTracking: Boolean,
  },
  roles: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['admin', 'moderator', 'member'] },
    permissions: [String],
  }],
  activities: [{
    type: { type: String, enum: ['quiz', 'discussion', 'resource_share'] },
    content: Schema.Types.Mixed,
    createdAt: Date,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  }],
  studySchedule: {
    sessions: [{
      day: String,
      time: String,
      topic: String,
      duration: Number,
    }],
  },
  resourceIds: [{ type: Schema.Types.ObjectId, ref: 'Resource' }],
  groupProgressSummary: {
    completedTopics: Number,
    averageScore: Number,
  },
}, { timestamps: true });

const PeerTutorProfileSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  subjects: [{ type: Schema.Types.ObjectId, ref: 'Subject' }],
  series: [String],
  topics: [{ type: Schema.Types.ObjectId, ref: 'Topic' }],
  availability: [{
    day: String,
    startTime: String,
    endTime: String,
  }],
  bio: { type: String, required: true },
  rating: { type: Number, default: 0 },
  reviews: [FeedbackSchema],
  isAvailable: { type: Boolean, default: true },
  premiumOnly: { type: Boolean, default: false },
}, { timestamps: true });

const TutoringSessionSchema = new Schema({
  tutorId: { type: Schema.Types.ObjectId, ref: 'PeerTutorProfile', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  series: String,
  topicId: { type: Schema.Types.ObjectId, ref: 'Topic' },
  scheduledAt: { type: Date, required: true },
  duration: { type: Number, required: true },
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], required: true },
  feedback: String,
  sessionRecording: {
    url: String,
    duration: Number,
  },
  premiumOnly: { type: Boolean, default: false },
}, { timestamps: true });

const ChallengeSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  topicId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
  series: String,
  questionIds: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
  timeLimit: { type: Number, required: true },
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  endsAt: Date,
  premiumOnly: { type: Boolean, default: false },
}, { timestamps: true });

const LeaderboardEntrySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  nationalRank: { type: Number, required: true },
  regionalRank: { type: Number, required: true },
  globalRank: { type: Number, required: true },
  badgeCount: { type: Number, required: true },
  streak: { type: Number, required: true },
  topPerformance: { type: Boolean, default: false },
  mostImproved: Boolean,
  longestStreak: Number,
  history: [{
    date: Date,
    rank: Number,
  }],
  series: String,
}, { timestamps: true });

const MissionSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['daily', 'weekly', 'custom'], required: true },
  progress: { type: Number, default: 0 },
  target: { type: Number, required: true },
  reward: { type: String, required: true },
  icon: { type: String, required: true },
  completed: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject' },
  series: String,
}, { timestamps: true });

const NoteSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  topicId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
  series: String,
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
}, { timestamps: true });

const ExamScheduleSchema = new Schema({
  examId: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  series: String,
  level: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  duration: { type: Number, required: true },
  location: String,
  onlineLink: String,
  notes: String,
}, { timestamps: true });

const CountrySchema = new Schema({
  name: { type: String, required: true, unique: true },
  flagUrl: { type: String, required: true },
  supportedExams: [{ type: Schema.Types.ObjectId, ref: 'Exam' }],
  languages: [String],
}, { timestamps: true });

const AdaptiveLearningSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  currentLevel: { type: String, enum: DIFFICULTY_LEVELS, required: true },
  series: String,
  adjustmentRules: [{
    metric: { type: String, enum: ['score', 'timeSpent', 'accuracy'] },
    threshold: Number,
    action: { type: String, enum: ['increaseDifficulty', 'decreaseDifficulty', 'suggestResource'] },
    resourceId: { type: Schema.Types.ObjectId, ref: 'Resource' },
  }],
  recommendedContent: [{
    contentType: { type: String, enum: ['topic', 'quiz', 'resource'] },
    id: String,
  }],
}, { timestamps: true });

const OnboardingStatusSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  completedSteps: [String],
  currentStep: { type: String, required: true },
  lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

const DashboardSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  upcomingExams: [{
    examId: { type: Schema.Types.ObjectId, ref: 'Exam' },
    series: String,
    date: Date,
  }],
  recentQuizzes: [{
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz' },
    score: Number,
    completedAt: Date,
  }],
  recommendedTopics: [{ type: Schema.Types.ObjectId, ref: 'Topic' }],
  streak: { type: Number, default: 0 },
  notifications: [{ type: Schema.Types.ObjectId, ref: 'Notification' }],
}, { timestamps: true });

const ParentAccessSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  parentEmail: { type: String, required: true },
  accessLevel: { type: String, enum: ['viewProgress', 'viewReports', 'fullAccess'], required: true },
  notifications: [{
    type: String,
    frequency: String,
  }],
}, { timestamps: true });

const NotificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['reminder', 'achievement', 'study_group', 'system'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], required: true },
  read: { type: Boolean, default: false },
  actionUrl: String,
  expiresAt: Date,
  metadata: {
    relatedEntityId: String,
    relatedEntityType: String,
  },
}, { timestamps: true });

const StudyPlanSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  targetExam: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
  targetSeries: String,
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  dailyGoals: [{
    day: String,
    topics: [{
      topicId: { type: Schema.Types.ObjectId, ref: 'Topic' },
      duration: Number,
      priority: { type: String, enum: ['high', 'medium', 'low'] },
    }],
    exercises: [{
      exerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise' },
      count: Number,
      type: String,
    }],
    breaks: [{
      startTime: Number,
      endTime: Number,
      duration: Number,
    }],
  }],
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
  reminders: [{
    type: { type: String, enum: ['study', 'review', 'assessment'] },
    time: String,
    message: String,
    repeat: { type: String, enum: ['daily', 'weekly', 'monthly'] },
  }],
}, { timestamps: true });

// Index for study plan queries
StudyPlanSchema.index({ userId: 1, 'dailyGoals.topics.topicId': 1 });

const CurriculumSchema = new Schema({
  country: { type: String, required: true },
  educationLevel: { type: String, required: true },
  examId: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
  series: [String],
  subjects: [{
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject' },
    name: String,
    description: String,
    topics: [{
      topicId: { type: Schema.Types.ObjectId, ref: 'Topic' },
      name: String,
      description: String,
      learningObjectives: [String],
      assessmentCriteria: [String],
      resourceIds: [{ type: Schema.Types.ObjectId, ref: 'Resource' }],
    }],
    assessments: [{
      type: { type: String, enum: ['formative', 'summative'] },
      weightage: Number,
      criteria: [String],
    }],
  }],
  academicYear: {
    startDate: Date,
    endDate: Date,
    terms: [{
      term: Number,
      startDate: Date,
      endDate: Date,
      holidays: [{
        name: String,
        startDate: Date,
        endDate: Date,
      }],
    }],
  },
}, { timestamps: true });

const FeedbackLoopSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['question', 'exercise', 'lesson', 'platform'], required: true },
  contentId: { type: Schema.Types.ObjectId, required: true },
  feedback: [FeedbackSchema],
  status: { type: String, enum: ['pending', 'reviewed', 'resolved'], required: true },
  response: {
    adminId: { type: Schema.Types.ObjectId, ref: 'User' },
    message: String,
    date: Date,
  },
  attachments: [String],
}, { timestamps: true });

const GamifiedProgressSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  series: [String],
  milestones: [{
    id: String,
    description: String,
    targetValue: Number,
    currentValue: Number,
    achieved: Boolean,
    achievedDate: Date,
    reward: {
      type: { type: String, enum: ['badge', 'points', 'feature'] },
      value: String,
    },
  }],
}, { timestamps: true });

const LearningPathSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  targetExam: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
  targetSeries: String,
  duration: { type: Number, required: true },
  levels: [{
    level: Number,
    name: String,
    description: String,
    modules: [String],
    prerequisites: [String],
    expectedOutcomes: [String],
  }],
  milestones: [{
    id: String,
    name: String,
    description: String,
    requiredAchievements: [String],
    reward: {
      type: { type: String, enum: ['badge', 'certificate', 'points'] },
      value: String,
    },
  }],
  adaptiveLearning: {
    difficultyAdjustment: Boolean,
    personalizedPacing: Boolean,
    remediationPaths: [{
      topicId: String,
      alternativeResources: [String],
      practiceExercises: [String],
    }],
  },
}, { timestamps: true });

// Models
module.exports = {
    BiologyLesson: mongoose.model('Lesson').discriminator('biology', BiologyLessonSchema),
    PhilosophyLesson: mongoose.model('Lesson').discriminator('philosophy', PhilosophyLessonSchema),
    EnglishLesson: mongoose.model('Lesson').discriminator('english', EnglishLessonSchema),
  HistoryLesson: mongoose.model('Lesson').discriminator('history', HistoryLessonSchema),
  Assessment: mongoose.model('Assessment', AssessmentSchema),
  Question: mongoose.model('Question', QuestionSchema),
  Quiz: mongoose.model('Quiz', QuizSchema),
  QuizSession: mongoose.model('QuizSession', QuizSessionSchema),
  QuizResult: mongoose.model('QuizResult', QuizResultSchema),
  Hint: mongoose.model('HintUsage', HintUsageSchema),
  Bookmark: mongoose.model('Bookmark', BookmarkSchema),
  Exercise: mongoose.model('Exercise', ExerciseSchema),
  Resource: mongoose.model('Resource', ResourceSchema),
  StudyGroup: mongoose.model('StudyGroup', StudyGroupSchema),
  PeerTutorProfile: mongoose.model('PeerTutorProfile', PeerTutorProfileSchema),
  TutoringSession: mongoose.model('TutoringSession', TutoringSessionSchema),
  Challenge: mongoose.model('Challenge', ChallengeSchema),
  LeaderboardEntry: mongoose.model('LeaderboardEntry', LeaderboardEntrySchema),
  Mission: mongoose.model('Mission', MissionSchema),
  Note: mongoose.model('Note', NoteSchema),
  ExamSchedule: mongoose.model('ExamSchedule', ExamScheduleSchema),
  Country: mongoose.model('Country', CountrySchema),
  AdaptiveLearning: mongoose.model('AdaptiveLearning', AdaptiveLearningSchema),
  OnboardingStatus: mongoose.model('OnboardingStatus', OnboardingStatusSchema),
  Dashboard: mongoose.model('Dashboard', DashboardSchema),
  ParentAccess: mongoose.model('ParentAccess', ParentAccessSchema),
  Notification: mongoose.model('Notification', NotificationSchema),
  StudyPlan: mongoose.model('StudyPlan', StudyPlanSchema),
  Curriculum: mongoose.model('Curriculum', CurriculumSchema),
  FeedbackLoop: mongoose.model('FeedbackLoop', FeedbackLoopSchema),
  GamifiedProgress: mongoose.model('GamifiedProgress', GamifiedProgressSchema),
  LearningPath: mongoose.model('LearningPath', LearningPathSchema),
};