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
      enum: ["reminder", "achievement", "study_group", "system"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    priority: { type: String, enum: ["low", "medium", "high"], required: true },
    read: { type: Boolean, default: false },
    actionUrl: String,
    expiresAt: Date,
    metadata: {
      relatedEntityId: String,
      relatedEntityType: String,
    },
  },
  { timestamps: true }
);

module.exports = {
  Notification: mongoose.model("Notification", NotificationSchema),
};
