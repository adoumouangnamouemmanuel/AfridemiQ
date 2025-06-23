const { Schema, model, Types } = require("mongoose");
const {
  PARENT_ACCESS_LEVELS,
  NOTIFICATION_TYPES,
  NOTIFICATION_FREQUENCIES,
} = require("../../constants");

// =============== CONSTANTS =============
/**
 * Imported constants for parent access levels and notification settings.
 * @see module:constants
 */

// =============== SUBSCHEMAS =============
/**
 * Subschema for parent notification preferences.
 * @module NotificationSubSchema
 */
const NotificationSchema = new Schema({
  type: {
    type: String,
    enum: NOTIFICATION_TYPES,
    required: [true, "Le type de notification est requis"],
  },
  frequency: {
    type: String,
    enum: NOTIFICATION_FREQUENCIES,
    required: [true, "La fréquence de notification est requise"],
    default: NOTIFICATION_FREQUENCIES[2], // weekly
  },
  enabled: {
    type: Boolean,
    default: true,
  },
});

// ==================== SCHEMA ==================
/**
 * Mongoose schema for managing parent access to user data.
 * @module ParentAccessSchema
 */
const ParentAccessSchema = new Schema(
  {
    // Parent access details
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "L'ID utilisateur est requis"],
      unique: true,
    },
    parentEmail: {
      type: String,
      required: [true, "L'email du parent est requis"],
      lowercase: true,
      trim: true,
    },
    accessLevel: {
      type: String,
      enum: PARENT_ACCESS_LEVELS,
      required: [true, "Le niveau d'accès est requis"],
      default: PARENT_ACCESS_LEVELS[0], // viewProgress
    },
    // Notification preferences
    notifications: {
      type: [NotificationSchema],
      default: [],
    },
    // Status and verification
    isActive: {
      type: Boolean,
      default: true,
    },
    lastAccessDate: {
      type: Date,
    },
    verificationCode: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// =============== INDEXES =================
ParentAccessSchema.index({ parentEmail: 1, userId: 1 });
ParentAccessSchema.index({ isActive: 1, isVerified: 1 }, { sparse: true });

// =============== VIRTUALS =============
/**
 * Virtual field to check if parent has full access.
 * @returns {boolean} True if accessLevel is fullAccess, false otherwise.
 */
ParentAccessSchema.virtual("hasFullAccess").get(function () {
  return this.accessLevel === PARENT_ACCESS_LEVELS[2]; // fullAccess
});

/**
 * Virtual field to check if parent can view reports.
 * @returns {boolean} True if accessLevel is viewReports or fullAccess, false otherwise.
 */
ParentAccessSchema.virtual("canViewReports").get(function () {
  return (
    this.accessLevel === PARENT_ACCESS_LEVELS[1] || // viewReports
    this.accessLevel === PARENT_ACCESS_LEVELS[2] // fullAccess
  );
});

/**
 * Virtual field for enabled notifications.
 * @returns {Object[]} Array of enabled notification preferences.
 */
ParentAccessSchema.virtual("enabledNotifications").get(function () {
  return (this.notifications ?? []).filter(
    (notification) => notification.enabled
  );
});

/**
 * Virtual field to check if parent access was recently active.
 * @returns {boolean} True if last accessed within 30 days, false otherwise.
 */
ParentAccessSchema.virtual("isRecentlyActive").get(function () {
  if (!this.lastAccessDate) return false;
  const daysSinceLastAccess = Math.floor(
    (new Date() - this.lastAccessDate) / (1000 * 60 * 60 * 24)
  );
  return daysSinceLastAccess <= 30;
});

/**
 * ParentAccess model for interacting with the ParentAccess collection.
 * @type {mongoose.Model}
 */
module.exports = {
  ParentAccess: model("ParentAccess", ParentAccessSchema),
};
