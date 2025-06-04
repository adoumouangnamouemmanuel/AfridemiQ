const mongoose = require("mongoose");
const { Schema } = mongoose;

const StudyGroupSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    memberIds: [{ type: Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    challengeIds: [{ type: Schema.Types.ObjectId, ref: "Challenge" }],
    createdAt: { type: Date, default: Date.now },
    features: {
      chatEnabled: Boolean,
      fileSharing: Boolean,
      liveSessions: Boolean,
      progressTracking: Boolean,
    },
    roles: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        role: { type: String, enum: ["admin", "moderator", "member"] },
        permissions: [String],
      },
    ],
    activities: [
      {
        type: { type: String, enum: ["quiz", "discussion", "resource_share"] },
        content: Schema.Types.Mixed,
        createdAt: Date,
        createdBy: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],
    studySchedule: {
      sessions: [
        {
          day: String,
          time: String,
          topic: String,
          duration: Number,
        },
      ],
    },
    resourceIds: [{ type: Schema.Types.ObjectId, ref: "Resource" }],
    groupProgressSummary: {
      completedTopics: Number,
      averageScore: Number,
    },
  },
  { timestamps: true }
);

module.exports = {
  StudyGroup: mongoose.model("StudyGroup", StudyGroupSchema),
};
