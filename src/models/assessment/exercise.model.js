const mongoose = require("mongoose");
const { Schema } = mongoose;

const DIFFICULTY_LEVELS = ["beginner", "intermediate", "advanced"];
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
const FRENCH_TOPICS = ["grammar", "literature", "text_analysis", "composition"];
const PHILOSOPHY_TOPICS = [
  "ethics",
  "metaphysics",
  "epistemology",
  "political_philosophy",
];
const ENGLISH_TOPICS = [
  "grammar",
  "reading_comprehension",
  "writing_skills",
  "speaking",
];
const HISTORY_TOPICS = [
  "colonialism",
  "independence_movements",
  "world_wars",
  "chadian_history",
];
const GEOGRAPHY_TOPICS = [
  "physical_geography",
  "human_geography",
  "climate_and_environment",
  "chadian_geography",
];
const QUESTION_TYPES = [
  "multiple_choice",
  "short_answer",
  "essay",
  "calculation",
  "diagram_labeling",
  "source_analysis",
  "map_analysis",
  "data_interpretation",
  "fill_in_the_blank",
  "text_sequencing",
];

// Feedback Subschema (simplified, 0-5 scale)
const FeedbackSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, min: 0, max: 5, required: true },
  comments: String,
  createdAt: { type: Date, default: Date.now },
});

// Base Exercise Schema
const ExerciseBaseSchema = new Schema(
  {
    type: { type: String, enum: EXERCISE_TYPES, required: true },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },
    series: [{ type: String, default: "D" }],
    topicId: {
      type: Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    difficulty: {
      type: String,
      enum: DIFFICULTY_LEVELS,
      required: true,
      index: true,
    },
    timeLimit: { type: Number, min: 0, default: 15 }, // In minutes
    points: { type: Number, required: true, min: 0 },
    instructions: { type: String, required: true, trim: true },
    attachments: [
      {
        type: { type: String, enum: ["image", "audio", "video", "document"] },
        url: {
          type: String,
          match:
            /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/,
        },
        description: String,
        size: Number,
        filename: String,
      },
    ],
    feedback: [FeedbackSchema],
    gamification: {
      badges: [String],
      pointsAwarded: { type: Number, default: 0 },
      achievements: [String],
      streakBonus: { type: Number, default: 0 },
    },
    analytics: {
      totalAttempts: { type: Number, default: 0 },
      successRate: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
      averageTimeSpent: { type: Number, default: 0 },
      difficultyRating: { type: Number, default: 0 },
    },
    metadata: {
      createdBy: { type: Schema.Types.ObjectId, ref: "User", index: true },
      createdAt: { type: Date, default: Date.now },
      updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
      lastModified: { type: Date, default: Date.now },
      tags: [String],
      version: { type: Number, default: 1 },
      status: {
        type: String,
        enum: ["draft", "published", "archived"],
        default: "draft",
      },
      accessibility: {
        hasAudioVersion: { type: Boolean, default: false },
        hasBrailleVersion: { type: Boolean, default: false },
        hasSignLanguageVideo: { type: Boolean, default: false },
        screenReaderFriendly: { type: Boolean, default: true },
      },
    },
    settings: {
      allowHints: { type: Boolean, default: true },
      showSolution: { type: Boolean, default: true },
      randomizeQuestions: { type: Boolean, default: false },
      allowRetake: { type: Boolean, default: true },
      maxAttempts: { type: Number, default: 3 },
    },
    premiumOnly: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    discriminatorKey: "subjectType",
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual fields
ExerciseBaseSchema.virtual("averageRating").get(function () {
  if (this.feedback && this.feedback.length > 0) {
    const sum = this.feedback.reduce((acc, fb) => acc + fb.rating, 0);
    return (sum / this.feedback.length).toFixed(1);
  }
  return 0;
});

ExerciseBaseSchema.virtual("totalFeedback").get(function () {
  return this.feedback ? this.feedback.length : 0;
});

ExerciseBaseSchema.virtual("isExpired").get(function () {
  if (this.type === "exam" && this.metadata.expiryDate) {
    return new Date() > this.metadata.expiryDate;
  }
  return false;
});

// Methods
ExerciseBaseSchema.methods.addFeedback = function (userId, rating, comments) {
  this.feedback.push({ userId, rating, comments });
  return this.save();
};

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

// Math Exercise Schema
const MathExerciseSchema = new Schema({
  topic: { type: String, enum: MATH_TOPICS, required: true },
  content: {
    problems: [
      {
        statement: { type: String, required: true },
        questionType: { type: String, enum: QUESTION_TYPES, required: true },
        variables: [String],
        constraints: [String],
        difficulty: { type: String, enum: DIFFICULTY_LEVELS },
        points: { type: Number, default: 1 },
      },
    ],
    formulas: [String],
    calculatorAllowed: { type: Boolean, default: false },
    graphingRequired: { type: Boolean, default: false },
    theorems: [String],
  },
  solution: {
    answers: [
      {
        answer: Schema.Types.Mixed,
        problemIndex: Number,
        explanation: String,
        alternativeAnswers: [Schema.Types.Mixed],
      },
    ],
    explanation: String,
    workingSteps: [String],
    formulasUsed: [String],
    commonMistakes: [String],
  },
});

// Physics Exercise Schema
const PhysicsExerciseSchema = new Schema({
  topic: { type: String, enum: PHYSICS_TOPICS, required: true },
  content: {
    problems: [
      {
        statement: { type: String, required: true },
        questionType: { type: String, enum: QUESTION_TYPES, required: true },
        variables: [{ name: String, value: String, unit: String }],
        constants: [{ name: String, value: String, unit: String }],
        difficulty: { type: String, enum: DIFFICULTY_LEVELS },
        points: { type: Number, default: 1 },
      },
    ],
    diagrams: [
      {
        url: String,
        altText: String,
        caption: String,
        type: { type: String, enum: ["circuit", "force", "wave", "field"] },
      },
    ],
    formulas: [String],
    experiments: [
      {
        name: String,
        procedure: [String],
        materials: [String],
        safetyNotes: [String],
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
    calculations: [String],
    physicalInterpretation: String,
  },
});

// Chemistry Exercise Schema
const ChemistryExerciseSchema = new Schema({
  topic: { type: String, enum: CHEMISTRY_TOPICS, required: true },
  content: {
    problems: [
      {
        statement: { type: String, required: true },
        questionType: { type: String, enum: QUESTION_TYPES, required: true },
        reaction: String,
        compounds: [{ name: String, formula: String, molarity: Number }],
        difficulty: { type: String, enum: DIFFICULTY_LEVELS },
        points: { type: Number, default: 1 },
      },
    ],
    labSetup: {
      materials: [String],
      procedure: [String],
      safetyPrecautions: [String],
      equipment: [String],
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
    calculations: [String],
    mechanisms: [String],
  },
});

// Biology Exercise Schema
const BiologyExerciseSchema = new Schema({
  topic: { type: String, enum: BIOLOGY_TOPICS, required: true },
  content: {
    problems: [
      {
        statement: { type: String, required: true },
        questionType: { type: String, enum: QUESTION_TYPES, required: true },
        diagram: { url: String, altText: String, labels: [String] },
        difficulty: { type: String, enum: DIFFICULTY_LEVELS },
        points: { type: Number, default: 1 },
      },
    ],
    caseStudy: {
      context: String,
      data: [{ variable: String, value: String, unit: String }],
      scenario: String,
    },
    specimens: [
      {
        name: String,
        type: String,
        characteristics: [String],
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
    annotations: [String],
    biologicalProcesses: [String],
  },
});

// French Exercise Schema
const FrenchExerciseSchema = new Schema({
  topic: { type: String, enum: FRENCH_TOPICS, required: true },
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
          difficulty: { type: String, enum: DIFFICULTY_LEVELS },
          points: { type: Number, default: 1 },
        },
      ],
    },
    grammarExercises: [
      {
        statement: String,
        questionType: { type: String, enum: QUESTION_TYPES },
        grammarRule: String,
        difficulty: { type: String, enum: DIFFICULTY_LEVELS },
        points: { type: Number, default: 1 },
      },
    ],
    vocabulary: {
      words: [{ word: String, definition: String, example: String }],
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
    guidelines: [String],
    grammarExplanations: [String],
  },
});

// Philosophy Exercise Schema
const PhilosophyExerciseSchema = new Schema({
  topic: { type: String, enum: PHILOSOPHY_TOPICS, required: true },
  content: {
    questions: [
      {
        question: String,
        questionType: { type: String, enum: QUESTION_TYPES },
        textExcerpt: String,
        philosopher: String,
        work: String,
        difficulty: { type: String, enum: DIFFICULTY_LEVELS },
        points: { type: Number, default: 1 },
      },
    ],
    argumentAnalysis: {
      premise: String,
      conclusion: String,
      logicalStructure: String,
      fallacies: [String],
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

// English Exercise Schema
const EnglishExerciseSchema = new Schema({
  topic: { type: String, enum: ENGLISH_TOPICS, required: true },
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
          difficulty: { type: String, enum: DIFFICULTY_LEVELS },
          points: { type: Number, default: 1 },
        },
      ],
    },
    grammarExercises: [
      {
        statement: String,
        questionType: { type: String, enum: QUESTION_TYPES },
        grammarRule: String,
        difficulty: { type: String, enum: DIFFICULTY_LEVELS },
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
      words: [
        { word: String, definition: String, example: String, level: String },
      ],
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
    guidelines: [String],
    rubric: {
      criteria: [String],
      scoring: String,
    },
  },
});

// History Exercise Schema
const HistoryExerciseSchema = new Schema({
  topic: { type: String, enum: HISTORY_TOPICS, required: true },
  content: {
    sourceAnalysis: {
      sourceType: { type: String, enum: ["primary", "secondary"] },
      excerpt: String,
      author: String,
      date: String,
      context: String,
      questions: [
        {
          question: String,
          questionType: { type: String, enum: QUESTION_TYPES },
          difficulty: { type: String, enum: DIFFICULTY_LEVELS },
          points: { type: Number, default: 1 },
        },
      ],
    },
    timelineQuestions: [
      {
        question: String,
        questionType: { type: String, enum: QUESTION_TYPES },
        period: String,
        difficulty: { type: String, enum: DIFFICULTY_LEVELS },
        points: { type: Number, default: 1 },
      },
    ],
    events: [
      {
        name: String,
        date: String,
        significance: String,
        causes: [String],
        consequences: [String],
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
    annotations: [String],
    historicalContext: String,
  },
});

// Geography Exercise Schema
const GeographyExerciseSchema = new Schema({
  topic: { type: String, enum: GEOGRAPHY_TOPICS, required: true },
  content: {
    mapAnalysis: {
      mapUrl: String,
      mapType: {
        type: String,
        enum: ["physical", "political", "climate", "economic"],
      },
      scale: String,
      region: String,
      questions: [
        {
          question: String,
          questionType: { type: String, enum: QUESTION_TYPES },
          difficulty: { type: String, enum: DIFFICULTY_LEVELS },
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
          difficulty: { type: String, enum: DIFFICULTY_LEVELS },
          points: { type: Number, default: 1 },
        },
      ],
    },
    fieldwork: {
      location: String,
      methodology: String,
      dataCollection: [String],
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
    annotations: [String],
    geographicalProcesses: [String],
  },
});

// Indexes for performance
ExerciseBaseSchema.index({ subjectId: 1, topicId: 1 });
ExerciseBaseSchema.index({ difficulty: 1, type: 1 });
// ExerciseBaseSchema.index({ "metadata.createdBy": 1 });
ExerciseBaseSchema.index({ "metadata.status": 1 });
ExerciseBaseSchema.index({ premiumOnly: 1 });
ExerciseBaseSchema.index({ isActive: 1 });
ExerciseBaseSchema.index({ createdAt: -1 });

// Pre-save middleware
ExerciseBaseSchema.pre("save", function (next) {
  this.metadata.lastModified = new Date();
  next();
});

// Models
const Exercise = mongoose.model("Exercise", ExerciseBaseSchema);

module.exports = {
  Exercise,
  MathExercise: Exercise.discriminator("math_exercise", MathExerciseSchema),
  PhysicsExercise: Exercise.discriminator("physics_exercise", PhysicsExerciseSchema),
  ChemistryExercise: Exercise.discriminator("chemistry_exercise", ChemistryExerciseSchema),
  BiologyExercise: Exercise.discriminator("biology_exercise", BiologyExerciseSchema),
  FrenchExercise: Exercise.discriminator("french_exercise", FrenchExerciseSchema),
  PhilosophyExercise: Exercise.discriminator("philosophy_exercise", PhilosophyExerciseSchema),
  EnglishExercise: Exercise.discriminator("english_exercise", EnglishExerciseSchema),
  HistoryExercise: Exercise.discriminator("history_exercise", HistoryExerciseSchema),
  GeographyExercise: Exercise.discriminator("geography_exercise", GeographyExerciseSchema),
  // Export constants for use in other modules
  DIFFICULTY_LEVELS,
  EXERCISE_TYPES,
  QUESTION_TYPES,
  MATH_TOPICS,
  PHYSICS_TOPICS,
  CHEMISTRY_TOPICS,
  BIOLOGY_TOPICS,
  FRENCH_TOPICS,
  PHILOSOPHY_TOPICS,
  ENGLISH_TOPICS,
  HISTORY_TOPICS,
  GEOGRAPHY_TOPICS,
};