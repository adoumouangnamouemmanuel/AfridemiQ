const mongoose = require("mongoose");
const { Schema } = mongoose;

const StudyGroupSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    series: [{ type: String, trim: true, minlength: 1 }],
    memberIds: [{ type: Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    challengeIds: [{ type: Schema.Types.ObjectId, ref: "Quiz" }],
    learningPathId: { type: Schema.Types.ObjectId, ref: "LearningPath" },
    features: {
      chatEnabled: { type: Boolean, default: false },
      fileSharing: { type: Boolean, default: false },
      liveSessions: { type: Boolean, default: false },
      progressTracking: { type: Boolean, default: false },
    },
    roles: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        role: {
          type: String,
          enum: ["admin", "moderator", "member"],
          required: true,
        },
        permissions: [
          {
            type: String,
            enum: ["manage_members", "post_content", "schedule_sessions"],
          },
        ],
      },
    ],
    activities: [
      {
        type: {
          type: String,
          enum: ["quiz", "discussion", "resource_share"],
          required: true,
        },
        quizId: {
          type: Schema.Types.ObjectId,
          ref: "Quiz",
          required: function () {
            return this.type === "quiz";
          },
        },
        message: {
          type: String,
          required: function () {
            return this.type === "discussion";
          },
        },
        resourceId: {
          type: Schema.Types.ObjectId,
          ref: "Resource",
          required: function () {
            return this.type === "resource_share";
          },
        },
        createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
      },
    ],
    studySchedule: {
      sessions: [
        {
          day: {
            type: String,
            enum: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ],
            required: true,
          },
          time: {
            type: String,
            match: /^([01]\d|2[0-3]):[0-5]\d$/,
            required: true,
          }, // HH:mm
          topic: { type: Schema.Types.ObjectId, ref: "Topic", required: true },
          duration: { type: Number, min: 1, required: true }, // in minutes
        },
      ],
    },
    resourceIds: [{ type: Schema.Types.ObjectId, ref: "Resource" }],
    groupProgressSummary: {
      completedTopics: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
      averageScore: { type: Number, min: 0, max: 100 },
      lastUpdated: { type: Date },
    },
  },
  { timestamps: true }
);

// Indexes for performance
StudyGroupSchema.index({ createdBy: 1 });
StudyGroupSchema.index({ memberIds: 1 });
StudyGroupSchema.index({ "studySchedule.sessions.topic": 1 });

// Pre-save middleware for validation
StudyGroupSchema.pre("save", async function (next) {
  try {
    // Validate createdBy and memberIds
    const userIds = [
      ...new Set([
        ...(this.memberIds || []),
        this.createdBy,
        ...(this.roles || []).map((r) => r.userId),
        ...(this.activities || []).map((a) => a.createdBy),
      ]),
    ];
    if (userIds.length > 0) {
      const users = await mongoose
        .model("User")
        .find({ _id: { $in: userIds } });
      if (users.length !== userIds.length) {
        return next(new Error("One or more invalid user IDs"));
      }
    }

    // Ensure all memberIds have roles
    const roleUserIds = this.roles.map((r) => r.userId.toString());
    for (const memberId of this.memberIds) {
      if (!roleUserIds.includes(memberId.toString())) {
        return next(new Error("All members must have a role"));
      }
    }

    // Validate challengeIds
    if (this.challengeIds.length > 0) {
      const quizzes = await mongoose
        .model("Quiz")
        .find({ _id: { $in: this.challengeIds } });
      if (quizzes.length !== this.challengeIds.length) {
        return next(new Error("One or more invalid quiz IDs"));
      }
    }

    // Validate resourceIds
    if (this.resourceIds.length > 0) {
      const resources = await mongoose
        .model("Resource")
        .find({ _id: { $in: this.resourceIds } });
      if (resources.length !== this.resourceIds.length) {
        return next(new Error("One or more invalid resource IDs"));
      }
    }

    // Validate learningPathId
    if (this.learningPathId) {
      const learningPath = await mongoose
        .model("LearningPath")
        .findById(this.learningPathId);
      if (!learningPath) return next(new Error("Invalid learning path ID"));
    }

    // Validate activities
    for (const activity of this.activities) {
      if (activity.type === "quiz" && activity.quizId) {
        const quiz = await mongoose.model("Quiz").findById(activity.quizId);
        if (!quiz) return next(new Error("Invalid quiz ID in activities"));
      }
      if (activity.type === "resource_share" && activity.resourceId) {
        const resource = await mongoose
          .model("Resource")
          .findById(activity.resourceId);
        if (!resource)
          return next(new Error("Invalid resource ID in activities"));
      }
    }

    // Validate studySchedule.sessions.topic
    const sessionTopics = this.studySchedule.sessions.map((s) => s.topic);
    if (sessionTopics.length > 0) {
      const topics = await mongoose
        .model("Topic")
        .find({ _id: { $in: sessionTopics } });
      if (topics.length !== sessionTopics.length) {
        return next(
          new Error("One or more invalid topic IDs in studySchedule")
        );
      }
    }

    // Validate groupProgressSummary.completedTopics
    if (this.groupProgressSummary.completedTopics.length > 0) {
      const topics = await mongoose.model("Topic").find({
        _id: { $in: this.groupProgressSummary.completedTopics },
      });
      if (topics.length !== this.groupProgressSummary.completedTopics.length) {
        return next(
          new Error("One or more invalid topic IDs in groupProgressSummary")
        );
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = {
  StudyGroup: mongoose.model("StudyGroup", StudyGroupSchema),
};
