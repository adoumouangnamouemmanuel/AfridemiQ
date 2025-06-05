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
});

// Base Exercise Schema
const ExerciseBaseSchema = new Schema(
  {
    type: { type: String, enum: EXERCISE_TYPES, required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    series: { type: String, default: "D" },
    topicId: { type: Schema.Types.ObjectId, ref: "Topic", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: { type: String, enum: DIFFICULTY_LEVELS, required: true },
    timeLimit: { type: Number, min: 0 }, // In minutes
    points: { type: Number, required: true, min: 0 },
    instructions: { type: String, required: true },
    attachments: [
      {
        type: { type: String, enum: ["image", "audio", "video", "document"] },
        url: {
          type: String,
          match:
            /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
        },
        description: String,
      },
    ],
    feedback: [FeedbackSchema],
    gamification: {
      badges: [String],
      pointsAwarded: { type: Number, default: 0 },
    },
    metadata: {
      createdBy: { type: Schema.Types.ObjectId, ref: "User" },
      createdAt: { type: Date, default: Date.now },
      updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
      lastModified: { type: Date, default: Date.now },
      tags: [String],
      accessibility: {
        hasAudioVersion: Boolean,
        hasBrailleVersion: Boolean,
        hasSignLanguageVideo: Boolean,
      },
    },
    premiumOnly: { type: Boolean, default: false },
  },
  { timestamps: true, discriminatorKey: "subjectType" }
);

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
      },
    ],
    formulas: [String],
    calculatorAllowed: { type: Boolean, default: false },
  },
  solution: {
    answers: [{ answer: Schema.Types.Mixed, problemIndex: Number }],
    explanation: String,
    workingSteps: [String],
    formulasUsed: [String],
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
      },
    ],
    diagrams: [
      {
        url: String,
        altText: String,
      },
    ],
    formulas: [String],
  },
  solution: {
    answers: [{ answer: Schema.Types.Mixed, problemIndex: Number }],
    explanation: String,
    calculations: [String],
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
      },
    ],
    labSetup: {
      materials: [String],
      procedure: [String],
    },
  },
  solution: {
    answers: [{ answer: Schema.Types.Mixed, problemIndex: Number }],
    explanation: String,
    balancedEquation: String,
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
        diagram: { url: String, altText: String },
      },
    ],
    caseStudy: {
      context: String,
      data: [{ variable: String, value: String }],
    },
  },
  solution: {
    answers: [{ answer: Schema.Types.Mixed, problemIndex: Number }],
    explanation: String,
    annotations: [String],
  },
});

// French Exercise Schema
const FrenchExerciseSchema = new Schema({
  topic: { type: String, enum: FRENCH_TOPICS, required: true },
  content: {
    textAnalysis: {
      text: String,
      questions: [
        {
          question: String,
          questionType: { type: String, enum: QUESTION_TYPES },
        },
      ],
    },
    grammarExercises: [
      {
        statement: String,
        questionType: { type: String, enum: QUESTION_TYPES },
      },
    ],
  },
  solution: {
    answers: [{ answer: Schema.Types.Mixed, problemIndex: Number }],
    modelAnswer: String,
    guidelines: [String],
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
      },
    ],
    argumentAnalysis: {
      premise: String,
      conclusion: String,
    },
  },
  solution: {
    answers: [{ answer: Schema.Types.Mixed, problemIndex: Number }],
    explanation: String,
    critique: String,
  },
});

// English Exercise Schema
const EnglishExerciseSchema = new Schema({
  topic: { type: String, enum: ENGLISH_TOPICS, required: true },
  content: {
    readingComprehension: {
      text: String,
      questions: [
        {
          question: String,
          questionType: { type: String, enum: QUESTION_TYPES },
        },
      ],
    },
    grammarExercises: [
      {
        statement: String,
        questionType: { type: String, enum: QUESTION_TYPES },
      },
    ],
    writingPrompt: {
      prompt: String,
      instructions: String,
    },
  },
  solution: {
    answers: [{ answer: Schema.Types.Mixed, problemIndex: Number }],
    modelAnswer: String,
    guidelines: [String],
  },
});

// History Exercise Schema
const HistoryExerciseSchema = new Schema({
  topic: { type: String, enum: HISTORY_TOPICS, required: true },
  content: {
    sourceAnalysis: {
      sourceType: { type: String, enum: ["primary", "secondary"] },
      excerpt: String,
      questions: [
        {
          question: String,
          questionType: { type: String, enum: QUESTION_TYPES },
        },
      ],
    },
    timelineQuestions: [
      {
        question: String,
        questionType: { type: String, enum: QUESTION_TYPES },
      },
    ],
  },
  solution: {
    answers: [{ answer: Schema.Types.Mixed, problemIndex: Number }],
    explanation: String,
    annotations: [String],
  },
});

// Geography Exercise Schema
const GeographyExerciseSchema = new Schema({
  topic: { type: String, enum: GEOGRAPHY_TOPICS, required: true },
  content: {
    mapAnalysis: {
      mapUrl: String,
      questions: [
        {
          question: String,
          questionType: { type: String, enum: QUESTION_TYPES },
        },
      ],
    },
    caseStudy: {
      region: String,
      questions: [
        {
          question: String,
          questionType: { type: String, enum: QUESTION_TYPES },
        },
      ],
    },
  },
  solution: {
    answers: [{ answer: Schema.Types.Mixed, problemIndex: Number }],
    explanation: String,
    annotations: [String],
  },
});

// Indexes for performance
ExerciseBaseSchema.index({ subjectId: 1, topicId: 1 });
ExerciseBaseSchema.index({ difficulty: 1 });
ExerciseBaseSchema.index({ "metadata.createdBy": 1 });

// Models
module.exports = {
  Exercise: mongoose.model("Exercise", ExerciseBaseSchema),
  MathExercise: mongoose
    .model("Exercise")
    .discriminator("math", MathExerciseSchema),
  PhysicsExercise: mongoose
    .model("Exercise")
    .discriminator("physics", PhysicsExerciseSchema),
  ChemistryExercise: mongoose
    .model("Exercise")
    .discriminator("chemistry", ChemistryExerciseSchema),
  BiologyExercise: mongoose
    .model("Exercise")
    .discriminator("biology", BiologyExerciseSchema),
  FrenchExercise: mongoose
    .model("Exercise")
    .discriminator("french", FrenchExerciseSchema),
  PhilosophyExercise: mongoose
    .model("Exercise")
    .discriminator("philosophy", PhilosophyExerciseSchema),
  EnglishExercise: mongoose
    .model("Exercise")
    .discriminator("english", EnglishExerciseSchema),
  HistoryExercise: mongoose
    .model("Exercise")
    .discriminator("history", HistoryExerciseSchema),
  GeographyExercise: mongoose
    .model("Exercise")
    .discriminator("geography", GeographyExerciseSchema),
};
