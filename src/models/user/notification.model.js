const mongoose = require("mongoose");
const { Schema } = mongoose;

const NotificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["reminder", "achievement", "study_group", "system", "friend_request", "friend_removed", "user_blocked"],
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
      default: "medium",
      index: true,
    },
    read: { type: Boolean, default: false, index: true },
    actionUrl: String,
    expiresAt: { type: Date, index: true },
    metadata: {
      relatedEntityId: String,
      relatedEntityType: String,
    },
  },
  { timestamps: true }
);

// Indexes for better performance
NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ userId: 1, type: 1 });
NotificationSchema.index({ userId: 1, priority: 1 });
// NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual fields
NotificationSchema.virtual("isExpired").get(function () {
  return this.expiresAt && new Date() > this.expiresAt;
});

NotificationSchema.virtual("timeUntilExpiry").get(function () {
  if (!this.expiresAt) return null;
  const now = new Date();
  const expiry = new Date(this.expiresAt);
  return Math.max(0, expiry - now);
});

NotificationSchema.virtual("isUrgent").get(function () {
  return this.priority === "high" && !this.read;
});

module.exports = {
  Notification: mongoose.model("Notification", NotificationSchema),
};