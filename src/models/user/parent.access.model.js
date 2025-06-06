const mongoose = require("mongoose");
const { Schema } = mongoose;

const ParentAccessSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    parentEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    accessLevel: {
      type: String,
      enum: ["viewProgress", "viewReports", "fullAccess"],
      required: true,
      default: "viewProgress",
    },
    notifications: [
      {
        type: {
          type: String,
          enum: [
            "daily_progress",
            "weekly_summary",
            "achievement",
            "low_performance",
            "exam_reminder",
          ],
          required: true,
        },
        frequency: {
          type: String,
          enum: ["immediate", "daily", "weekly", "monthly"],
          required: true,
          default: "weekly",
        },
        enabled: {
          type: Boolean,
          default: true,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastAccessDate: Date,
    verificationCode: String,
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes for better performance
ParentAccessSchema.index({ parentEmail: 1, userId: 1 });
ParentAccessSchema.index({ isActive: 1, isVerified: 1 });

// Virtual fields
ParentAccessSchema.virtual("hasFullAccess").get(function () {
  return this.accessLevel === "fullAccess";
});

ParentAccessSchema.virtual("canViewReports").get(function () {
  return (
    this.accessLevel === "viewReports" || this.accessLevel === "fullAccess"
  );
});

ParentAccessSchema.virtual("enabledNotifications").get(function () {
  return this.notifications.filter((notification) => notification.enabled);
});

ParentAccessSchema.virtual("isRecentlyActive").get(function () {
  if (!this.lastAccessDate) return false;
  const daysSinceLastAccess = Math.floor(
    (new Date() - this.lastAccessDate) / (1000 * 60 * 60 * 24)
  );
  return daysSinceLastAccess <= 30;
});

module.exports = {
  ParentAccess: mongoose.model("ParentAccess", ParentAccessSchema),
};