const { Schema, model, Types } = require("mongoose");

// =============== SUBSCHEMAS =============
/**
 * Subschema for individual feedback entries.
 * @module FeedbackSubSchema
 */
const FeedbackSchema = new Schema({
  // Rating value
  rating: {
    type: Number,
    min: [0, "La note ne peut pas être négative"],
    max: [10, "La note ne peut pas dépasser 10"],
    required: [true, "La note est requise"],
  },
  // Optional comments
  comments: {
    type: String,
  },
  // Creation timestamp
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ==================== SCHEMA ==================
/**
 * Mongoose schema for feedback loops, managing user feedback and responses.
 * @module FeedbackLoopSchema
 */
const FeedbackLoopSchema = new Schema(
  {
    // Feedback loop details
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "L'ID utilisateur est requis"],
    },
    type: {
      type: String,
      enum: ["question", "exercise", "lesson", "platform"],
      required: [true, "Le type de feedback est requis"],
    },
    category: {
      type: String,
      enum: ["bug", "suggestion", "complaint", "praise"],
      required: true,
    },
    // Feedback entries
    feedback: [FeedbackSchema],
    // Feedback status
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved"],
      required: [true, "Le statut est requis"],
      default: "pending",
    },
    // Admin response
    response: {
      adminId: { type: Types.ObjectId, ref: "User" },
      message: { type: String },
      date: { type: Date },
    },
    // File attachments
    attachments: [{ type: String }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// =============== INDEXES =================
FeedbackLoopSchema.index({ userId: 1, type: 1 });
FeedbackLoopSchema.index({ status: 1, createdAt: -1 });
FeedbackLoopSchema.index({ "response.adminId": 1 }, { sparse: true });

// =============== VIRTUALS =============
/**
 * Virtual field for the average rating of feedback entries.
 * @returns {number} Rounded average rating to one decimal place, or 0 if no feedback.
 */
FeedbackLoopSchema.virtual("averageRating").get(function () {
  return this.feedback?.length
    ? Math.round(
        (this.feedback.reduce((sum, fb) => sum + (fb.rating ?? 0), 0) /
          this.feedback.length) *
          10
      ) / 10
    : 0;
});

/**
 * Virtual field for the number of feedback entries.
 * @returns {number} Length of feedback array.
 */
FeedbackLoopSchema.virtual("feedbackCount").get(function () {
  return this.feedback?.length ?? 0;
});

/**
 * Virtual field to check if an admin response exists.
 * @returns {boolean} True if response message exists, false otherwise.
 */
FeedbackLoopSchema.virtual("hasResponse").get(function () {
  return !!this.response?.message;
});

/**
 * Virtual field to check if feedback is overdue (unresolved after 7 days).
 * @returns {boolean} True if pending/reviewed and older than 7 days, false otherwise.
 */
FeedbackLoopSchema.virtual("isOverdue").get(function () {
  if (this.status === "resolved") return false;
  const daysSinceCreated = Math.floor(
    (new Date() - this.createdAt) / (1000 * 60 * 60 * 24)
  );
  return daysSinceCreated > 7;
});

/**
 * FeedbackLoop model for interacting with the FeedbackLoop collection.
 * @type {mongoose.Model}
 */
module.exports = {
  FeedbackLoop: model("FeedbackLoop", FeedbackLoopSchema),
};
