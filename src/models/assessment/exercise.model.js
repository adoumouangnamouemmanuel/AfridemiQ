const { Schema, model, Types } = require("mongoose");
const {
  EXERCISE_DIFFICULTY_LEVELS,
  EXERCISE_TYPES,
  QUESTION_TYPES,
  EXERCISE_STATUSES,
  ATTACHMENT_TYPES,
  MATH_TOPICS,
  PHYSICS_TOPICS,
  PHYSICS_DIAGRAM_TYPES,
  CHEMISTRY_TOPICS,
  BIOLOGY_TOPICS,
  FRENCH_TOPICS,
  PHILOSOPHY_TOPICS,
  ENGLISH_TOPICS,
  HISTORY_TOPICS,
  HISTORY_SOURCE_TYPES,
  GEOGRAPHY_TOPICS,
  GEOGRAPHY_MAP_TYPES,
} = require("../../constants");

// =============== CONSTANTS =============
/**
 * Imported constants for exercises, including difficulty levels, types, question types, statuses, and subject-specific topics.
 * @see module:constants/index
 */

// =============== SUBSCHEMAS =============
/**
 * Subschema for feedback on exercises.
 * @module FeedbackSubSchema
 */
const FeedbackSchema = new Schema({
  userId: {
    type: Types.ObjectId,
    ref: "User",
    required: [true, "L'ID de l'utilisateur est requis"],
  },
  rating: {
    type: Number,
    min: [0, "La note doit être au moins 0"],
    max: [5, "La note ne peut pas dépasser 5"],
    required: [true, "La note est requise"],
  },
  comments: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/**
 * Subschema for exercise attachments.
 * @module AttachmentSubSchema
 */
const AttachmentSchema = new Schema({
  type: {
    type: String,
    enum: ATTACHMENT_TYPES,
  },
  url: {
    type: String,
    match: [
      /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/,
      "L'URL doit être valide",
    ],
  },
  description: {
    type: String,
  },
  size: {
    type: Number,
  },
  filename: {
    type: String,
  },
});

// ================= SCHEMAS =================
/**
 * Base Mongoose schema for exercises, supporting various subjects and formats.
 * @module ExerciseBaseSchema
 */
const ExerciseBaseSchema = new Schema(
  {
    // Exercise details
    type: {
      type: String,
      enum: EXERCISE_TYPES,
      required: [true, "Le type d'exercice est requis"],
    },
    subjectId: {
      type: Types.ObjectId,
      ref: "Subject",
      required: [true, "L'ID de la matière est requis"],
    },
    series: {
      type: [String],
      default: ["D"],
    },
    topicId: {
      type: Types.ObjectId,
      ref: "Topic",
      required: [true, "L'ID du sujet est requis"],
    },
    title: {
      type: String,
      required: [true, "Le titre est requis"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "La description est requise"],
      trim: true,
    },
    difficulty: {
      type: String,
      enum: EXERCISE_DIFFICULTY_LEVELS,
      required: [true, "La difficulté est requise"],
    },
    timeLimit: {
      type: Number,
      min: [0, "La limite de temps ne peut pas être négative"],
      default: 15, // In minutes
    },
    points: {
      type: Number,
      required: [true, "Les points sont requis"],
      min: [0, "Les points ne peuvent pas être négatifs"],
    },
    instructions: {
      type: String,
      required: [true, "Les instructions sont requises"],
      trim: true,
    },
    attachments: {
      type: [AttachmentSchema],
      default: [],
    },
    feedback: {
      type: [FeedbackSchema],
      default: [],
    },
    // Gamification
    gamification: {
      badges: { type: [String], default: [] },
      pointsAwarded: { type: Number, default: 0 },
      achievements: { type: [String], default: [] },
      streakBonus: { type: Number, default: 0 },
    },
    // Analytics
    analytics: {
      totalAttempts: { type: Number, default: 0 },
      successRate: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
      averageTimeSpent: { type: Number, default: 0 },
      difficultyRating: { type: Number, default: 0 },
    },
    // Metadata
    metadata: {
      createdBy: { type: Types.ObjectId, ref: "User" },
      createdAt: { type: Date, default: Date.now },
      updatedBy: { type: Types.ObjectId, ref: "User" },
      lastModified: { type: Date, default: Date.now },
      tags: { type: [String], default: [] },
      version: { type: Number, default: 1 },
      status: {
        type: String,
        enum: EXERCISE_STATUSES,
        default: EXERCISE_STATUSES[0], // draft
      },
      accessibility: {
        hasAudioVersion: { type: Boolean, default: false },
        hasBrailleVersion: { type: Boolean, default: false },
        hasSignLanguageVideo: { type: Boolean, default: false },
        screenReaderFriendly: { type: Boolean, default: true },
      },
    },
    // Settings
    settings: {
      allowHints: { type: Boolean, default: true },
      showSolution: { type: Boolean, default: true },
      randomizeQuestions: { type: Boolean, default: false },
      allowRetake: { type: Boolean, default: true },
      maxAttempts: { type: Number, default: 3 },
    },
    premiumOnly: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    discriminatorKey: "subjectType",
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Mongoose schema for math exercises.
 * @module MathExerciseSchema
 */
const MathExerciseSchema = new Schema({
  topic: {
    type: String,
    enum: MATH_TOPICS,
    required: [true, "Le sujet de mathématiques est requis"],
  },
  content: {
    problems: [
      {
        statement: {
          type: String,
          required: [true, "L'énoncé du problème est requis"],
        },
        questionType: {
          type: String,
          enum: QUESTION_TYPES,
          required: [true, "Le type de question est requis"],
        },
        variables: { type: [String], default: [] },
        constraints: { type: [String], default: [] },
        difficulty: { type: String, enum: EXERCISE_DIFFICULTY_LEVELS },
        points: { type: Number, default: 1 },
      },
    ],
    formulas: { type: [String], default: [] },
    calculatorAllowed: { type: Boolean, default: false },
    graphingRequired: { type: Boolean, default: false },
    theorems: { type: [String], default: [] },
  },
  solution: {
    answers: [
      {
        answer: Schema.Types.Mixed,
        problemIndex: Number,
        explanation: String,
        alternativeAnswers: { type: [Schema.Types.Mixed], default: [] },
      },
    ],
    explanation: String,
    workingSteps: { type: [String], default: [] },
    formulasUsed: { type: [String], default: [] },
    commonMistakes: { type: [String], default: [] },
  },
});

/**
 * Mongoose schema for physics exercises.
 * @module PhysicsExerciseSchema
 */
const PhysicsExerciseSchema = new Schema({
  topic: {
    type: String,
    enum: PHYSICS_TOPICS,
    required: [true, "Le sujet de physique est requis"],
  },
  content: {
    problems: [
      {
        statement: {
          type: String,
          required: [true, "L'énoncé du problème est requis"],
        },
        questionType: {
          type: String,
          enum: QUESTION_TYPES,
          required: [true, "Le type de question est requis"],
        },
        variables: {
          type: [{ name: String, value: String, unit: String }],
          default: [],
        },
        constants: {
          type: [{ name: String, value: String, unit: String }],
          default: [],
        },
        difficulty: { type: String, enum: EXERCISE_DIFFICULTY_LEVELS },
        points: { type: Number, default: 1 },
      },
    ],
    diagrams: [
      {
        url: String,
        altText: String,
        caption: String,
        type: { type: String, enum: PHYSICS_DIAGRAM_TYPES },
      },
    ],
    formulas: { type: [String], default: [] },
    experiments: [
      {
        name: String,
        procedure: { type: [String], default: [] },
        materials: { type: [String], default: [] },
        safetyNotes: { type: [String], default: [] },
      },
    ],
  },
  solution: {
    answers: [
      {
        answer: Schema.Types.Mixed,
        problemIndex: Number,
        unit: String,
        explanation: String,
      },
    ],
    explanation: String,
    calculations: { type: [String], default: [] },
    physicalInterpretation: String,
  },
});

/**
 * Mongoose schema for chemistry exercises.
 * @module ChemistryExerciseSchema
 */
const ChemistryExerciseSchema = new Schema({
  topic: {
    type: String,
    enum: CHEMISTRY_TOPICS,
    required: [true, "Le sujet de chimie est requis"],
  },
  content: {
    problems: [
      {
        statement: {
          type: String,
          required: [true, "L'énoncé du problème est requis"],
        },
        questionType: {
          type: String,
          enum: QUESTION_TYPES,
          required: [true, "Le type de question est requis"],
        },
        reaction: String,
        compounds: {
          type: [{ name: String, formula: String, molarity: Number }],
          default: [],
        },
        difficulty: { type: String, enum: EXERCISE_DIFFICULTY_LEVELS },
        points: { type: Number, default: 1 },
      },
    ],
    labSetup: {
      materials: { type: [String], default: [] },
      procedure: { type: [String], default: [] },
      safetyPrecautions: { type: [String], default: [] },
      equipment: { type: [String], default: [] },
    },
    periodicTableRequired: { type: Boolean, default: false },
  },
  solution: {
    answers: [
      {
        answer: Schema.Types.Mixed,
        problemIndex: Number,
        unit: String,
        explanation: String,
      },
    ],
    explanation: String,
    balancedEquation: String,
    calculations: { type: [String], default: [] },
    mechanisms: { type: [String], default: [] },
  },
});

/**
 * Mongoose schema for biology exercises.
 * @module BiologyExerciseSchema
 */
const BiologyExerciseSchema = new Schema({
  topic: {
    type: String,
    enum: BIOLOGY_TOPICS,
    required: [true, "Le sujet de biologie est requis"],
  },
  content: {
    problems: [
      {
        statement: {
          type: String,
          required: [true, "L'énoncé du problème est requis"],
        },
        questionType: {
          type: String,
          enum: QUESTION_TYPES,
          required: [true, "Le type de question est requis"],
        },
        diagram: {
          url: String,
          altText: String,
          labels: { type: [String], default: [] },
        },
        difficulty: { type: String, enum: EXERCISE_DIFFICULTY_LEVELS },
        points: { type: Number, default: 1 },
      },
    ],
    caseStudy: {
      context: String,
      data: {
        type: [{ variable: String, value: String, unit: String }],
        default: [],
      },
      scenario: String,
    },
    specimens: [
      {
        name: String,
        type: String,
        characteristics: { type: [String], default: [] },
        habitat: String,
      },
    ],
  },
  solution: {
    answers: [
      {
        answer: Schema.Types.Mixed,
        problemIndex: Number,
        explanation: String,
      },
    ],
    explanation: String,
    annotations: { type: [String], default: [] },
    biologicalProcesses: { type: [String], default: [] },
  },
});

/**
 * Mongoose schema for French exercises.
 * @module FrenchExerciseSchema
 */
const FrenchExerciseSchema = new Schema({
  topic: {
    type: String,
    enum: FRENCH_TOPICS,
    required: [true, "Le sujet de français est requis"],
  },
  content: {
    textAnalysis: {
      text: String,
      author: String,
      genre: String,
      period: String,
      questions: [
        {
          question: String,
          questionType: { type: String, enum: QUESTION_TYPES },
          difficulty: { type: String, enum: EXERCISE_DIFFICULTY_LEVELS },
          points: { type: Number, default: 1 },
        },
      ],
    },
    grammarExercises: [
      {
        statement: String,
        questionType: { type: String, enum: QUESTION_TYPES },
        grammarRule: String,
        difficulty: { type: String, enum: EXERCISE_DIFFICULTY_LEVELS },
        points: { type: Number, default: 1 },
      },
    ],
    vocabulary: {
      words: {
        type: [{ word: String, definition: String, example: String }],
        default: [],
      },
      context: String,
    },
  },
  solution: {
    answers: [
      {
        answer: Schema.Types.Mixed,
        problemIndex: Number,
        explanation: String,
      },
    ],
    modelAnswer: String,
    guidelines: { type: [String], default: [] },
    grammarExplanations: { type: [String], default: [] },
  },
});

/**
 * Mongoose schema for philosophy exercises.
 * @module PhilosophyExerciseSchema
 */
const PhilosophyExerciseSchema = new Schema({
  topic: {
    type: String,
    enum: PHILOSOPHY_TOPICS,
    required: [true, "Le sujet de philosophie est requis"],
  },
  content: {
    questions: [
      {
        question: String,
        questionType: { type: String, enum: QUESTION_TYPES },
        textExcerpt: String,
        philosopher: String,
        work: String,
        difficulty: { type: String, enum: EXERCISE_DIFFICULTY_LEVELS },
        points: { type: Number, default: 1 },
      },
    ],
    argumentAnalysis: {
      premise: String,
      conclusion: String,
      logicalStructure: String,
      fallacies: { type: [String], default: [] },
    },
    concepts: [
      {
        term: String,
        definition: String,
        philosopher: String,
        context: String,
      },
    ],
  },
  solution: {
    answers: [
      {
        answer: Schema.Types.Mixed,
        problemIndex: Number,
        explanation: String,
      },
    ],
    explanation: String,
    critique: String,
    philosophicalFramework: String,
  },
});

/**
 * Mongoose schema for English exercises.
 * @module EnglishExerciseSchema
 */
const EnglishExerciseSchema = new Schema({
  topic: {
    type: String,
    enum: ENGLISH_TOPICS,
    required: [true, "Le sujet d'anglais est requis"],
  },
  content: {
    readingComprehension: {
      text: String,
      author: String,
      genre: String,
      wordCount: Number,
      questions: [
        {
          question: String,
          questionType: { type: String, enum: QUESTION_TYPES },
          difficulty: { type: String, enum: EXERCISE_DIFFICULTY_LEVELS },
          points: { type: Number, default: 1 },
        },
      ],
    },
    grammarExercises: [
      {
        statement: String,
        questionType: { type: String, enum: QUESTION_TYPES },
        grammarRule: String,
        difficulty: { type: String, enum: EXERCISE_DIFFICULTY_LEVELS },
        points: { type: Number, default: 1 },
      },
    ],
    writingPrompt: {
      prompt: String,
      instructions: String,
      wordLimit: Number,
      format: String,
    },
    vocabulary: {
      words: {
        type: [
          { word: String, definition: String, example: String, level: String },
        ],
        default: [],
      },
    },
  },
  solution: {
    answers: [
      {
        answer: Schema.Types.Mixed,
        problemIndex: Number,
        explanation: String,
      },
    ],
    modelAnswer: String,
    guidelines: { type: [String], default: [] },
    rubric: {
      criteria: { type: [String], default: [] },
      scoring: String,
    },
  },
});

/**
 * Mongoose schema for history exercises.
 * @module HistoryExerciseSchema
 */
const HistoryExerciseSchema = new Schema({
  topic: {
    type: String,
    enum: HISTORY_TOPICS,
    required: [true, "Le sujet d'histoire est requis"],
  },
  content: {
    sourceAnalysis: {
      sourceType: { type: String, enum: HISTORY_SOURCE_TYPES },
      excerpt: String,
      author: String,
      date: String,
      context: String,
      questions: [
        {
          question: String,
          questionType: { type: String, enum: QUESTION_TYPES },
          difficulty: { type: String, enum: EXERCISE_DIFFICULTY_LEVELS },
          points: { type: Number, default: 1 },
        },
      ],
    },
    timelineQuestions: [
      {
        question: String,
        questionType: { type: String, enum: QUESTION_TYPES },
        period: String,
        difficulty: { type: String, enum: EXERCISE_DIFFICULTY_LEVELS },
        points: { type: Number, default: 1 },
      },
    ],
    events: [
      {
        name: String,
        date: String,
        significance: String,
        causes: { type: [String], default: [] },
        consequences: { type: [String], default: [] },
      },
    ],
  },
  solution: {
    answers: [
      {
        answer: Schema.Types.Mixed,
        problemIndex: Number,
        explanation: String,
      },
    ],
    explanation: String,
    annotations: { type: [String], default: [] },
    historicalContext: String,
  },
});

/**
 * Mongoose schema for geography exercises.
 * @module GeographyExerciseSchema
 */
const GeographyExerciseSchema = new Schema({
  topic: {
    type: String,
    enum: GEOGRAPHY_TOPICS,
    required: [true, "Le sujet de géographie est requis"],
  },
  content: {
    mapAnalysis: {
      mapUrl: String,
      mapType: { type: String, enum: GEOGRAPHY_MAP_TYPES },
      scale: String,
      region: String,
      questions: [
        {
          question: String,
          questionType: { type: String, enum: QUESTION_TYPES },
          difficulty: { type: String, enum: EXERCISE_DIFFICULTY_LEVELS },
          points: { type: Number, default: 1 },
        },
      ],
    },
    caseStudy: {
      region: String,
      country: String,
      population: Number,
      area: Number,
      climate: String,
      questions: [
        {
          question: String,
          questionType: { type: String, enum: QUESTION_TYPES },
          difficulty: { type: String, enum: EXERCISE_DIFFICULTY_LEVELS },
          points: { type: Number, default: 1 },
        },
      ],
    },
    fieldwork: {
      location: String,
      methodology: String,
      dataCollection: { type: [String], default: [] },
      analysis: String,
    },
  },
  solution: {
    answers: [
      {
        answer: Schema.Types.Mixed,
        problemIndex: Number,
        explanation: String,
      },
    ],
    explanation: String,
    annotations: { type: [String], default: [] },
    geographicalProcesses: { type: [String], default: [] },
  },
});

// =============== INDEXES =================
ExerciseBaseSchema.index({ subjectId: 1, topicId: 1 });
ExerciseBaseSchema.index({ difficulty: 1, type: 1 });
ExerciseBaseSchema.index({ "metadata.createdBy": 1 });
ExerciseBaseSchema.index({ "metadata.status": 1 }, { sparse: true });
ExerciseBaseSchema.index({ premiumOnly: 1 }, { sparse: true });
ExerciseBaseSchema.index({ isActive: 1 }, { sparse: true });
ExerciseBaseSchema.index({ createdAt: -1 });

// =============== VIRTUALS =============
/**
 * Virtual field for the average feedback rating.
 * @returns {string} Average rating rounded to one decimal place.
 */
ExerciseBaseSchema.virtual("averageRating").get(function () {
  if ((this.feedback ?? []).length > 0) {
    const sum = this.feedback.reduce((acc, fb) => acc + fb.rating, 0);
    return (sum / this.feedback.length).toFixed(1);
  }
  return "0";
});

/**
 * Virtual field for the total number of feedback entries.
 * @returns {number} Number of feedback entries.
 */
ExerciseBaseSchema.virtual("totalFeedback").get(function () {
  return (this.feedback ?? []).length;
});

/**
 * Virtual field to check if the exercise is expired (not applicable without expiry date).
 * @returns {boolean} Always false since no expiry date is defined.
 */
ExerciseBaseSchema.virtual("isExpired").get(function () {
  return false; // No expiryDate in schema
});

// =============== MIDDLEWARE =============
/**
 * Pre-save middleware to update last modified timestamp.
 * @param {Function} next - Callback to proceed with save.
 */
ExerciseBaseSchema.pre("save", function (next) {
  this.metadata.lastModified = new Date();
  next();
});

// =============== METHODS =============
/**
 * Adds feedback to the exercise.
 * @param {string} userId - ID of the user providing feedback.
 * @param {number} rating - Rating (0-5).
 * @param {string} comments - Optional comments.
 * @returns {Promise<Document>} Updated exercise document.
 */
ExerciseBaseSchema.methods.addFeedback = function (userId, rating, comments) {
  this.feedback.push({ userId, rating, comments });
  return this.save();
};

/**
 * Updates exercise analytics based on user performance.
 * @param {number} score - User's score.
 * @param {number} timeSpent - Time spent on the exercise.
 * @returns {Promise<Document>} Updated exercise document.
 */
ExerciseBaseSchema.methods.updateAnalytics = function (score, timeSpent) {
  this.analytics.totalAttempts += 1;
  this.analytics.averageScore =
    (this.analytics.averageScore * (this.analytics.totalAttempts - 1) + score) /
    this.analytics.totalAttempts;
  this.analytics.averageTimeSpent =
    (this.analytics.averageTimeSpent * (this.analytics.totalAttempts - 1) +
      timeSpent) /
    this.analytics.totalAttempts;
  this.analytics.successRate =
    score >= 70
      ? (this.analytics.successRate * (this.analytics.totalAttempts - 1) + 1) /
        this.analytics.totalAttempts
      : this.analytics.successRate;
  return this.save();
};

// =============== MODELS =============
/**
 * Exercise model for interacting with the Exercise collection.
 * @type {mongoose.Model}
 */
const Exercise = model("Exercise", ExerciseBaseSchema);

/**
 * Math exercise model.
 * @type {mongoose.Model}
 */
const MathExercise = Exercise.discriminator(
  "math_exercise",
  MathExerciseSchema
);

/**
 * Physics exercise model.
 * @type {mongoose.Model}
 */
const PhysicsExercise = Exercise.discriminator(
  "physics_exercise",
  PhysicsExerciseSchema
);

/**
 * Chemistry exercise model.
 * @type {mongoose.Model}
 */
const ChemistryExercise = Exercise.discriminator(
  "chemistry_exercise",
  ChemistryExerciseSchema
);

/**
 * Biology exercise model.
 * @type {mongoose.Model}
 */
const BiologyExercise = Exercise.discriminator(
  "biology_exercise",
  BiologyExerciseSchema
);

/**
 * French exercise model.
 * @type {mongoose.Model}
 */
const FrenchExercise = Exercise.discriminator(
  "french_exercise",
  FrenchExerciseSchema
);

/**
 * Philosophy exercise model.
 * @type {mongoose.Model}
 */
const PhilosophyExercise = Exercise.discriminator(
  "philosophy_exercise",
  PhilosophyExerciseSchema
);

/**
 * English exercise model.
 * @type {mongoose.Model}
 */
const EnglishExercise = Exercise.discriminator(
  "english_exercise",
  EnglishExerciseSchema
);

/**
 * History exercise model.
 * @type {mongoose.Model}
 */
const HistoryExercise = Exercise.discriminator(
  "history_exercise",
  HistoryExerciseSchema
);

/**
 * Geography exercise model.
 * @type {mongoose.Model}
 */
const GeographyExercise = Exercise.discriminator(
  "geography_exercise",
  GeographyExerciseSchema
);

module.exports = {
  Exercise,
  MathExercise,
  PhysicsExercise,
  ChemistryExercise,
  BiologyExercise,
  FrenchExercise,
  PhilosophyExercise,
  EnglishExercise,
  HistoryExercise,
  GeographyExercise,
};
