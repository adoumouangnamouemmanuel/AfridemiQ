const mongoose = require("mongoose");
const { Schema } = mongoose;

// Shared constants
const QUESTION_TYPES = ["multiple_choice", "short_answer", "essay"];
const MEDIA_TYPES = ["image", "audio", "video"];

const QuestionSchema = new Schema(
  {
    topicId: {
      type: Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
      index: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },
    series: String,
    question: { type: String, required: true },
    type: { type: String, enum: QUESTION_TYPES, required: true },
    options: [String],
    correctAnswer: { type: Schema.Types.Mixed, required: true },
    explanation: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    points: { type: Number, required: true },
    steps: [String],
    tags: [String],
    relatedQuestions: [{ type: Schema.Types.ObjectId, ref: "Question" }],
    difficultyMetrics: {
      successRate: Number,
      averageTimeToAnswer: Number,
      skipRate: Number,
    },
    content: {
      media: [
        {
          mediaType: { type: String, enum: MEDIA_TYPES },
          url: { type: String, match: /^https?:\/\/.+/ },
          altText: String,
        },
      ],
      accessibility: {
        hasAudioVersion: Boolean,
        hasBrailleVersion: Boolean,
        hasSignLanguageVideo: Boolean,
      },
    },
    premiumOnly: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = {
  Question: mongoose.model("Question", QuestionSchema),
};
