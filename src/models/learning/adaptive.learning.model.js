const mongoose = require("mongoose");
const { Schema } = mongoose;

// Shared constants
const DIFFICULTY_LEVELS = ["beginner", "intermediate", "advanced"];

const AdaptiveLearningSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    currentLevel: { type: String, enum: DIFFICULTY_LEVELS, required: true },
    series: [String],
    adjustmentRules: [
      {
        metric: {
          type: String,
          enum: ["score", "timeSpent", "accuracy", "completionRate"],
          required: true,
        },
        threshold: { type: Number, required: true },
        action: {
          type: String,
          enum: ["increaseDifficulty", "decreaseDifficulty", "suggestResource"],
          required: true,
        },
        resourceId: {
          type: Schema.Types.ObjectId,
          ref: "Resource",
          required: function () {
            return this.action === "suggestResource";
          },
        },
        value: { type: Number, default: 1 }, // e.g., steps to adjust difficulty
      },
    ],
    recommendedContent: [
      {
        contentType: {
          type: String,
          enum: ["topic", "quiz", "resource"],
          required: true,
        },
        contentId: {
          type: Schema.Types.ObjectId,
          required: true,
          refPath: "recommendedContent.contentType",
        },
      },
    ],
    progress: {
      scores: [{ type: Number, min: 0, max: 100 }],
      timeSpent: [{ type: Number, min: 0 }], // in seconds
      accuracy: [{ type: Number, min: 0, max: 100 }],
      completionRate: [{ type: Number, min: 0, max: 100 }],
    },
  },
  { timestamps: true }
);

// Dynamic ref for recommendedContent
AdaptiveLearningSchema.path("recommendedContent")
  .schema.path("contentType")
  .validate(function (value) {
    return ["topic", "quiz", "resource"].includes(value);
  });

AdaptiveLearningSchema.path("recommendedContent")
  .schema.path("contentId")
  .ref(function () {
    const contentTypeMap = {
      topic: "Topic",
      quiz: "Quiz",
      resource: "Resource",
    };
    return contentTypeMap[this.contentType];
  });

// Indexes for performance
AdaptiveLearningSchema.index({ currentLevel: 1 });
AdaptiveLearningSchema.index({ "recommendedContent.contentId": 1 });

// Pre-save middleware to validate references
AdaptiveLearningSchema.pre("save", async function (next) {
  try {
    // Validate resourceId in adjustmentRules
    const resourceIds = this.adjustmentRules
      .filter((rule) => rule.action === "suggestResource" && rule.resourceId)
      .map((rule) => rule.resourceId);
    if (resourceIds.length > 0) {
      const resources = await mongoose.model("Resource").find({
        _id: { $in: resourceIds },
      });
      if (resources.length !== resourceIds.length) {
        return next(new Error("One or more invalid resource IDs"));
      }
    }

    // Validate recommendedContent IDs
    const contentIds = this.recommendedContent.map((content) => ({
      id: content.contentId,
      type: content.contentType,
    }));
    if (contentIds.length > 0) {
      for (const { id, type } of contentIds) {
        const modelName = {
          topic: "Topic",
          quiz: "Quiz",
          resource: "Resource",
        }[type];
        const exists = await mongoose.model(modelName).findById(id);
        if (!exists) {
          return next(new Error(`Invalid ${type} ID: ${id}`));
        }
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = {
  AdaptiveLearning: mongoose.model("AdaptiveLearning", AdaptiveLearningSchema),
  DIFFICULTY_LEVELS,
};