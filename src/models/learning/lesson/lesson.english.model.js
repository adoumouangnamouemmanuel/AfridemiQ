const mongoose = require("mongoose");
const { Schema } = mongoose;

// Shared constants
const DIFFICULTY_LEVELS = ["beginner", "intermediate", "advanced"];
const QUESTION_TYPES = ["multiple_choice", "short_answer", "essay"];
const MEDIA_TYPES = ["image", "audio", "video"];
const WRITING_FORMATS = ["essay", "letter", "commentary", "summary"];
const INTERACTIVE_ELEMENT_TYPES = ["geogebra", "desmos", "video", "quiz"];


// English Lesson Schema (New)
const EnglishLessonSchema = new Schema({
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
  grammar: [{
    rule: { type: String, required: true },
    topic: { type: String, enum: ENGLISH_TOPICS, default: 'grammar' },
    explanation: { type: String, required: true },
    examples: [String],
    difficultyLevel: { type: String, enum: DIFFICULTY_LEVELS, required: true },
    grammarExerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise' },
  }],
  vocabulary: [{
    word: { type: String, required: true },
    topic: { type: String, enum: ENGLISH_TOPICS, default: 'vocabulary' },
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
    questions: [{
      question: String,
      type: { type: String, enum: QUESTION_TYPES },
    }],
    difficultyLevel: { type: String, enum: DIFFICULTY_LEVELS, required: true },
    comprehensionQuizId: { type: Schema.Types.ObjectId, ref: 'Quiz' },
  }],
  writingSkills: [{
    format: { type: String, enum: WRITING_FORMATS, required: true },
    topic: { type: String, enum: ENGLISH_TOPICS, default: 'writing_skills' },
    guidelines: [String],
    prompts: [{
      prompt: String,
      instructions: String,
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
    }],
    difficultyLevel: { type: String, enum: DIFFICULTY_LEVELS, required: true },
    listeningQuizId: { type: Schema.Types.ObjectId, ref: 'Quiz' },
  }],
  speakingSkills: [{
    topic: { type: String, required: true, enum: ENGLISH_TOPICS, default: 'speaking_skills' },
    instructions: String,
    sampleDialogue: String,
    pronunciationGuide: String,
    difficultyLevel: { type: String, enum: DIFFICULTY_LEVELS, required: true },
    speakingExerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise' },
  }],
  workedExamples: [{
    problem: { type: String, required: true },
    type: { type: String, enum: EXERCISE_TYPES, required: true },
    solution: String,
    annotations: [String],
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