const mongoose = require("mongoose");
const { Schema } = mongoose;

// Shared constants
const DIFFICULTY_LEVELS = ["beginner", "intermediate", "advanced"];
const QUESTION_TYPES = ["multiple_choice", "short_answer", "essay"];
const MEDIA_TYPES = ["image", "audio", "video"];
const INTERACTIVE_ELEMENT_TYPES = ["geogebra", "desmos", "video", "quiz"];
const EXERCISE_TYPES = ["practice", "quiz", "assignment", "exam"];
const PHILOSOPHY_TOPICS = [
  "ethics",
  "metaphysics",
  "epistemology",
  "political_philosophy",
];

// Philosophy Lesson Schema (New)
const PhilosophyLessonSchema = new Schema(
  {
    introduction: {
      text: { type: String, required: true },
      videoUrl: {
        type: String,
        match:
          /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
      },
      transcript: String,
      accessibility: {
        hasSubtitles: Boolean,
        hasAudioDescription: Boolean,
      },
    },
    concepts: [
      {
        name: { type: String, required: true },
        topic: { type: String, enum: PHILOSOPHY_TOPICS, required: true },
        description: { type: String, required: true },
        keyThinkers: [
          {
            name: String,
            contribution: String,
          },
        ],
        arguments: [
          {
            premise: String,
            conclusion: String,
            critique: String,
          },
        ],
        visualAid: {
          mediaType: { type: String, enum: MEDIA_TYPES },
          url: {
            type: String,
            match:
              /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
          },
          altText: String,
        },
        difficultyLevel: {
          type: String,
          enum: DIFFICULTY_LEVELS,
          required: true,
        },
        conceptQuizId: { type: Schema.Types.ObjectId, ref: "Quiz" },
      },
    ],
    textAnalysis: [
      {
        title: { type: String, required: true },
        author: { type: String, required: true },
        excerpt: String,
        context: String,
        questions: [
          {
            question: String,
            type: { type: String, enum: QUESTION_TYPES },
          },
        ],
        difficultyLevel: {
          type: String,
          enum: DIFFICULTY_LEVELS,
          required: true,
        },
        textQuizId: { type: Schema.Types.ObjectId, ref: "Quiz" },
      },
    ],
    workedExamples: [
      {
        problem: { type: String, required: true },
        type: { type: String, enum: EXERCISE_TYPES, required: true },
        solution: String,
        annotations: [String],
        difficultyLevel: {
          type: String,
          enum: DIFFICULTY_LEVELS,
          required: true,
        },
      },
    ],
    practiceExercises: [
      {
        exerciseId: {
          type: Schema.Types.ObjectId,
          ref: "Exercise",
          required: true,
        },
        type: { type: String, enum: EXERCISE_TYPES, required: true },
        description: String,
        difficultyLevel: {
          type: String,
          enum: DIFFICULTY_LEVELS,
          required: true,
        },
      },
    ],
    interactiveElements: [
      {
        elementType: {
          type: String,
          enum: INTERACTIVE_ELEMENT_TYPES,
          required: true,
        },
        url: {
          type: String,
          match:
            /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
          required: true,
        },
        instructions: String,
        offlineAvailable: { type: Boolean, default: false },
      },
    ],
    summary: {
      keyTakeaways: [String],
      suggestedNextTopics: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
    },
    prerequisites: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
    learningObjectives: [String],
    gamification: {
      badges: [String],
      points: { type: Number, default: 0 },
    },
    progressTracking: {
      completedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
      completionRate: { type: Number, default: 0 },
    },
    accessibilityOptions: {
      hasBraille: Boolean,
      hasSignLanguage: Boolean,
      languages: [String],
    },
    premiumOnly: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes for performance
PhilosophyLessonSchema.index({ "concepts.conceptQuizId": 1 });
PhilosophyLessonSchema.index({ "textAnalysis.textQuizId": 1 });
PhilosophyLessonSchema.index({ "practiceExercises.exerciseId": 1 });

// Pre-save hook for reference validation
PhilosophyLessonSchema.pre("save", async function (next) {
  const quizIds = [
    ...this.concepts.filter((c) => c.conceptQuizId).map((c) => c.conceptQuizId),
    ...this.textAnalysis.filter((t) => t.textQuizId).map((t) => t.textQuizId),
  ];
  if (quizIds.length > 0) {
    const validQuizzes = await mongoose
      .model("Quiz")
      .countDocuments({ _id: { $in: quizIds } });
    if (validQuizzes !== quizIds.length) {
      return next(new Error("Invalid Quiz IDs in concepts or textAnalysis"));
    }
  }
  const exerciseIds = this.practiceExercises.map((p) => p.exerciseId);
  if (exerciseIds.length > 0) {
    const validExercises = await mongoose
      .model("Exercise")
      .countDocuments({ _id: { $in: exerciseIds } });
    if (validExercises !== exerciseIds.length) {
      return next(new Error("Invalid Exercise IDs in practiceExercises"));
    }
  }
  if (this.prerequisites.length > 0) {
    const validTopics = await mongoose
      .model("Topic")
      .countDocuments({ _id: { $in: this.prerequisites } });
    if (validTopics !== this.prerequisites.length) {
      return next(new Error("Invalid Topic IDs in prerequisites"));
    }
  }
  if (this.summary.suggestedNextTopics.length > 0) {
    const validTopics = await mongoose
      .model("Topic")
      .countDocuments({ _id: { $in: this.summary.suggestedNextTopics } });
    if (validTopics !== this.summary.suggestedNextTopics.length) {
      return next(new Error("Invalid Topic IDs in suggestedNextTopics"));
    }
  }
  next();
});

// Virtual for estimated time
PhilosophyLessonSchema.virtual("estimatedTime").get(function () {
  return (
    this.duration ||
    this.concepts.length * 15 +
      this.textAnalysis.length * 20 +
      this.practiceExercises.length * 15
  ); // Example calculation in minutes
});

// Virtual for completion status
PhilosophyLessonSchema.virtual("completionStatus").get(function () {
  // Placeholder: Implement based on user progress
  return "not_started";
});

module.exports = {
  PhilosophyLesson: mongoose
    .model("Lesson")
    .discriminator("philosophy", PhilosophyLessonSchema),
};
