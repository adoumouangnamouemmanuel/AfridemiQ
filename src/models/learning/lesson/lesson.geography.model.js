const mongoose = require("mongoose");
const { Schema } = mongoose;
// Shared constants

const DIFFICULTY_LEVELS = ["beginner", "intermediate", "advanced"];
const QUESTION_TYPES = ["multiple_choice", "short_answer", "essay"];
const MEDIA_TYPES = ["image", "audio", "video"];
const INTERACTIVE_ELEMENT_TYPES = ["geogebra", "desmos", "video", "quiz"];
const EXERCISE_TYPES = ["practice", "quiz", "assignment", "exam"];
const GEOGRAPHY_TOPICS = [
  "physical_geography",
  "human_geography",
  "climate_and_environment",
  "chadian_geography",
];

// Geography Lesson Schema (New)
const GeographyLessonSchema = new Schema(
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
        topic: { type: String, enum: GEOGRAPHY_TOPICS, required: true },
        description: { type: String, required: true },
        keyFeatures: [
          {
            feature: String,
            explanation: String,
          },
        ],
        examples: [
          {
            example: String,
            explanation: String,
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
    mapAnalysis: [
      {
        title: { type: String, required: true },
        mapType: {
          type: String,
          enum: ["physical", "political", "thematic"],
          required: true,
        },
        mapUrl: {
          type: String,
          match:
            /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
        },
        description: String,
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
        mapQuizId: { type: Schema.Types.ObjectId, ref: "Quiz" },
      },
    ],
    caseStudies: [
      {
        title: { type: String, required: true },
        region: String,
        context: String,
        data: [
          {
            variable: String,
            value: String,
            unit: String,
          },
        ],
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
        caseStudyQuizId: { type: Schema.Types.ObjectId, ref: "Quiz" },
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
GeographyLessonSchema.index({ "concepts.conceptQuizId": 1 });
GeographyLessonSchema.index({ "mapAnalysis.mapQuizId": 1 });
GeographyLessonSchema.index({ "caseStudies.caseStudyQuizId": 1 });
GeographyLessonSchema.index({ "practiceExercises.exerciseId": 1 });

// Pre-save hook for reference validation
GeographyLessonSchema.pre("save", async function (next) {
  const quizIds = [
    ...this.concepts.filter((c) => c.conceptQuizId).map((c) => c.conceptQuizId),
    ...this.mapAnalysis.filter((m) => m.mapQuizId).map((m) => m.mapQuizId),
    ...this.caseStudies
      .filter((c) => c.caseStudyQuizId)
      .map((c) => c.caseStudyQuizId),
  ];
  if (quizIds.length > 0) {
    const validQuizzes = await mongoose
      .model("Quiz")
      .countDocuments({ _id: { $in: quizIds } });
    if (validQuizzes !== quizIds.length) {
      return next(
        new Error("Invalid Quiz IDs in concepts, mapAnalysis, or caseStudies")
      );
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
GeographyLessonSchema.virtual("estimatedTime").get(function () {
  return (
    this.duration ||
    this.concepts.length * 15 +
      this.mapAnalysis.length * 20 +
      this.caseStudies.length * 20 +
      this.practiceExercises.length * 15
  ); // Example calculation in minutes
});

// Virtual for completion status
GeographyLessonSchema.virtual("completionStatus").get(function () {
  // Placeholder: Implement based on user progress
  return "not_started";
});

module.exports = {
  GeographyLesson: mongoose
    .model("Lesson")
    .discriminator("geography", GeographyLessonSchema),
};
