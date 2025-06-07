const { Schema, model, Types } = require("mongoose");

// ==================== SCHEMA ==================
/**
 * Mongoose schema for notifications, managing user alerts and their status.
 * @module NotificationSchema
 */
const NotificationSchema = new Schema(
  {
    // Notification details
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "L'ID utilisateur est requis"],
    },
    type: {
      type: String,
      enum: [
        "reminder",
        "achievement",
        "study_group",
        "system",
        "friend_request",
        "friend_removed",
        "user_blocked",
      ],
      required: [true, "Le type de notification est requis"],
    },
    title: {
      type: String,
      required: [true, "Le titre est requis"],
    },
    message: {
      type: String,
      required: [true, "Le message est requis"],
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      required: [true, "La priorité est requise"],
      default: "medium",
    },
    // Notification status
    read: {
      type: Boolean,
      default: false,
    },
    // Optional metadata
    actionUrl: {
      type: String,
    },
    expiresAt: {
      type: Date,
    },
    metadata: {
      relatedEntityId: { type: String },
      relatedEntityType: { type: String },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// =============== INDEXES =================
NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ userId: 1, type: 1 });
NotificationSchema.index({ userId: 1, priority: 1 });
NotificationSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0, sparse: true }
);

// =============== VIRTUALS =============
/**
 * Virtual field to check if the notification has expired.
 * @returns {boolean} True if expiresAt is set and past current time, false otherwise.
 */
NotificationSchema.virtual("isExpired").get(function () {
  return this.expiresAt ? new Date() > this.expiresAt : false;
});

/**
 * Virtual field for time remaining until notification expiry.
 * @returns {number|null} Milliseconds until expiry, 0 if expired, or null if no expiresAt.
 */
NotificationSchema.virtual("timeUntilExpiry").get(function () {
  return this.expiresAt
    ? Math.max(0, new Date(this.expiresAt) - new Date())
    : null;
});

/**
 * Virtual field to check if the notification is urgent.
 * @returns {boolean} True if priority is high and unread, false otherwise.
 */
NotificationSchema.virtual("isUrgent").get(function () {
  return this.priority === "high" && !this.read;
});

/**
 * Notification model for interacting with the Notification collection.
 * @type {mongoose.Model}
 */
module.exports = {
  Notification: model("Notification", NotificationSchema),
};
