const mongoose = require("mongoose");
const { Schema } = mongoose;

// Shared constants
const DIFFICULTY_LEVELS = ["beginner", "intermediate", "advanced"];

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
      views: { type: Number, default: 0 },
      downloads: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
      userFeedback: [FeedbackSchema],
    },
  },
  { timestamps: true }
);

// Indexes for better performance
ResourceSchema.index({ subjectId: 1, series: 1 });
ResourceSchema.index({ topicIds: 1 });
ResourceSchema.index({ examIds: 1 });
ResourceSchema.index({ format: 1, level: 1 });
ResourceSchema.index({ "metadata.tags": 1 });
ResourceSchema.index({ "analytics.averageRating": -1 });
ResourceSchema.index({ "analytics.views": -1 });

// Virtual fields
ResourceSchema.virtual("popularity").get(function () {
  return this.analytics.views + this.analytics.downloads * 2;
});

ResourceSchema.virtual("ratingCount").get(function () {
  return this.analytics.userFeedback.length;
});

ResourceSchema.virtual("isPopular").get(function () {
  return this.analytics.views > 100 || this.analytics.averageRating > 7;
});

// Pre-save middleware to validate references
ResourceSchema.pre("save", async function (next) {
  try {
    // Validate subjectId
    if (this.subjectId) {
      const subject = await mongoose.model("Subject").findById(this.subjectId);
      if (!subject) {
        return next(new Error("Invalid subject ID"));
      }
    }

    // Validate topicIds
    if (this.topicIds && this.topicIds.length > 0) {
      const topics = await mongoose.model("Topic").find({
        _id: { $in: this.topicIds },
      });
      if (topics.length !== this.topicIds.length) {
        return next(new Error("One or more invalid topic IDs"));
      }
    }

    // Validate examIds
    if (this.examIds && this.examIds.length > 0) {
      const exams = await mongoose.model("Exam").find({
        _id: { $in: this.examIds },
      });
      if (exams.length !== this.examIds.length) {
        return next(new Error("One or more invalid exam IDs"));
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});


// Ensure virtual fields are serialized
ResourceSchema.set("toJSON", { virtuals: true });
ResourceSchema.set("toObject", { virtuals: true });

module.exports = {
  Resource: mongoose.model("Resource", ResourceSchema),
};