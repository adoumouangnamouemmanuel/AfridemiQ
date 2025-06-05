const mongoose = require("mongoose");
const { Schema } = mongoose;

const RESOURCE_TYPES = [
  "document",
  "video",
  "audio",
  "interactive",
  "past_exam",
];

// Shared Feedback Subschema
const FeedbackSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, min: 0, max: 10, required: true },
  comments: String,
  createdAt: { type: Date, default: Date.now },
});

const ResourceSchema = new Schema(
  {
    format: { type: String, enum: RESOURCE_TYPES, required: true },
    title: { type: String, required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    series: [String],
    topicIds: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
    url: { type: String, required: true },
    description: { type: String, required: true },
    level: { type: String, required: true },
    examIds: [{ type: Schema.Types.ObjectId, ref: "Exam" }],
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
  },
  { timestamps: true }
);

module.exports = {
  Resource: mongoose.model("Resource", ResourceSchema),
};
