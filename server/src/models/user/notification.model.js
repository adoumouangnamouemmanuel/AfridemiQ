const { Schema, model, Types } = require("mongoose");
const {
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITIES,
} = require("../../constants");

// =============== CONSTANTS =============
/**
 * Imported constants for notification types and priorities.
 * @see module:constants
 */

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
      enum: NOTIFICATION_TYPES,
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
      enum: NOTIFICATION_PRIORITIES,
      required: [true, "La priorité est requise"],
      default: NOTIFICATION_PRIORITIES[1], // medium
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
    category: {
      type: String,
      enum: ["system", "progress", "social", "marketing"],
      required: true,
    },
    delivery: {
      email: { type: Boolean, default: false },
      push: { type: Boolean, default: false },
      sentAt: { type: Date },
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
  return this.priority === NOTIFICATION_PRIORITIES[2] && !this.read; // high
});

/**
 * Notification model for interacting with the Notification collection.
 * @type {mongoose.Model}
 */
module.exports = {
  Notification: model("Notification", NotificationSchema),
};
