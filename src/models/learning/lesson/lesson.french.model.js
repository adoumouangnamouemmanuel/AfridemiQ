const mongoose = require("mongoose");
const { Schema } = mongoose;

// Shared constants
const DIFFICULTY_LEVELS = ["beginner", "intermediate", "advanced"];
const QUESTION_TYPES = ["multiple_choice", "short_answer", "essay"];
const WRITING_FORMATS = ["essay", "letter", "commentary", "summary"];
const INTERACTIVE_ELEMENT_TYPES = ["geogebra", "desmos", "video", "quiz"];
const EXERCISE_TYPES = ["practice", "quiz", "assignment", "exam"];
const FRENCH_TOPICS = ["grammar", "literature", "text_analysis", "composition"];

// French Lesson Schema (Enhanced)
const FrenchLessonSchema = new Schema({
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
  literaryAnalysis: [{
    text: { type: String, required: true },
    author: { type: String, required: true },
    title: { type: String, required: true },
    themes: [String],
    questions: [{
      question: String,
      type: { type: String, enum: QUESTION_TYPES },
    }],
    difficultyLevel: { type: String, enum: DIFFICULTY_LEVELS, required: true },
    context: String, // Historical/literary context
    analysisQuizId: { type: Schema.Types.ObjectId, ref: 'Quiz' },
  }],
  grammar: [{
    rule: { type: String, required: true },
    explanation: String,
    examples: [String],
    difficultyLevel: { type: String, enum: DIFFICULTY_LEVELS, required: true },
    grammarExerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise' },
  }],
  vocabulary: [{
    word: { type: String, required: true },
    definition: { type: String, required: true },
    partOfSpeech: String,
    examples: [String],
    pronunciation: String,
    synonyms: [String],
    vocabularyQuizId: { type: Schema.Types.ObjectId, ref: 'Quiz' },
  }],
  writingSkills: [{
    format: { type: String, enum: WRITING_FORMATS, required: true },
    guidelines: [String],
    prompts: [{
      prompt: String,
      instructions: String,
    }],
    modelAnswer: String,
    difficultyLevel: { type: String, enum: DIFFICULTY_LEVELS, required: true },
    writingExerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise' },
  }],
  oralSkills: [{
    topic: { type: String, required: true },
    instructions: String,
    sampleDialogue: String,
    pronunciationGuide: String,
    difficultyLevel: { type: String, enum: DIFFICULTY_LEVELS, required: true },
    oralExerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise' },
  }],
  workedExamples: [{
    type: { type: String, enum: WRITING_FORMATS.concat(['text_analysis', 'grammar_correction']) },
    problem: { type: String, required: true },
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
}, { timestamps: true });

// Indexes for performance
FrenchLessonSchema.index({ 'literaryAnalysis.analysisQuizId': 1 });
FrenchLessonSchema.index({ 'grammar.grammarExerciseId': 1 });
FrenchLessonSchema.index({ 'vocabulary.vocabularyQuizId': 1 });
FrenchLessonSchema.index({ 'writingSkills.writingExerciseId': 1 });
FrenchLessonSchema.index({ 'oralSkills.oralExerciseId': 1 });
FrenchLessonSchema.index({ 'practiceExercises.exerciseId': 1 });

// Pre-save hook for reference validation
FrenchLessonSchema.pre('save', async function (next) {
  const quizIds = [
    ...this.literaryAnalysis.filter(a => a.analysisQuizId).map(a => a.analysisQuizId),
    ...this.vocabulary.filter(v => v.vocabularyQuizId).map(v => v.vocabularyQuizId),
  ];
  if (quizIds.length > 0) {
    const validQuizzes = await mongoose.model('Quiz').countDocuments({ _id: { $in: quizIds } });
    if (validQuizzes !== quizIds.length) {
      return next(new Error('Invalid Quiz IDs in literaryAnalysis or vocabulary'));
    }
  }
  const exerciseIds = [
    ...this.grammar.filter(g => g.grammarExerciseId).map(g => g.grammarExerciseId),
    ...this.writingSkills.filter(w => w.writingExerciseId).map(w => w.writingExerciseId),
    ...this.oralSkills.filter(o => o.oralExerciseId).map(o => o.oralExerciseId),
    ...this.practiceExercises.map(p => p.exerciseId),
  ];
  if (exerciseIds.length > 0) {
    const validExercises = await mongoose.model('Exercise').countDocuments({ _id: { $in: exerciseIds } });
    if (validExercises !== exerciseIds.length) {
      return next(new Error('Invalid Exercise IDs in grammar, writingSkills, oralSkills, or practiceExercises'));
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
FrenchLessonSchema.virtual('estimatedTime').get(function () {
  return this.duration || (
    this.literaryAnalysis.length * 15 +
    this.grammar.length * 10 +
    this.vocabulary.length * 5 +
    this.writingSkills.length * 20 +
    this.oralSkills.length * 15 +
    this.practiceExercises.length * 10
  ); // Example calculation in minutes
});

// Virtual for completion status
FrenchLessonSchema.virtual('completionStatus').get(function () {
  // Placeholder: Implement based on user progress
  return 'not_started';
});


module.exports = {
    FrenchLesson: mongoose.model('Lesson').discriminator('french', FrenchLessonSchema),
}
