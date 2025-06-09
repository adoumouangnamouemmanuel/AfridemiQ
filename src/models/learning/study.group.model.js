const { Schema, model, Types } = require("mongoose");
const {
  STUDY_GROUP_ROLES,
  STUDY_GROUP_PERMISSIONS,
  STUDY_GROUP_ACTIVITY_TYPES,
  STUDY_GROUP_STATUSES,
  STUDY_GROUP_PRIVACY_LEVELS,
  STUDY_GROUP_DAYS,
} = require("../../constants");

// =============== CONSTANTS =============
/**
 * Imported constants for study group roles, permissions, and activity types.
 * @see module:constants/index
 */

// =============== SUBSCHEMAS =============
/**
 * Subschema for study group member roles and permissions.
 * @module RoleSubSchema
 */
const RoleSchema = new Schema({
  userId: {
    type: Types.ObjectId,
    ref: "User",
    required: [true, "L'ID de l'utilisateur est requis"],
  },
  role: {
    type: String,
    enum: {
      values: STUDY_GROUP_ROLES,
      message: "{VALUE} n'est pas un rôle valide",
    },
    required: [true, "Le rôle est requis"],
  },
  permissions: {
    type: [String],
    enum: {
      values: STUDY_GROUP_PERMISSIONS,
      message: "{VALUE} n'est pas une permission valide",
    },
    default: [],
  },
  assignedAt: {
    type: Date,
    default: Date.now,
  },
  assignedBy: {
    type: Types.ObjectId,
    ref: "User",
  },
});

/**
 * Subschema for study group activities.
 * @module ActivitySubSchema
 */
const ActivitySchema = new Schema(
  {
    type: {
      type: String,
      enum: {
        values: STUDY_GROUP_ACTIVITY_TYPES,
        message: "{VALUE} n'est pas un type d'activité valide",
      },
      required: [true, "Le type d'activité est requis"],
    },
    title: {
      type: String,
      required: [true, "Le titre de l'activité est requis"],
      trim: true,
      maxlength: [200, "Le titre ne peut pas dépasser 200 caractères"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "La description ne peut pas dépasser 1000 caractères"],
    },
    quizId: {
      type: Types.ObjectId,
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
      trim: true,
      maxlength: [2000, "Le message ne peut pas dépasser 2000 caractères"],
    },
    resourceId: {
      type: Types.ObjectId,
      ref: "Resource",
      required: function () {
        return this.type === "resource_share";
      },
    },
    scheduledDate: {
      type: Date,
      required: function () {
        return this.type === "session";
      },
    },
    duration: {
      type: Number,
      min: [1, "La durée doit être au moins 1 minute"],
      required: function () {
        return this.type === "session";
      },
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "Le créateur est requis"],
    },
    participants: {
      type: [{ type: Types.ObjectId, ref: "User" }],
      default: [],
    },
    completedBy: {
      type: [{ type: Types.ObjectId, ref: "User" }],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Subschema for study session scheduling.
 * @module SessionSubSchema
 */
const SessionSchema = new Schema({
  day: {
    type: String,
    enum: {
      values: STUDY_GROUP_DAYS,
      message: "{VALUE} n'est pas un jour valide",
    },
    required: [true, "Le jour est requis"],
  },
  time: {
    type: String,
    match: [
      /^([01]\d|2[0-3]):[0-5]\d$/,
      "Format d'heure invalide (utilisez HH:mm)",
    ],
    required: [true, "L'heure est requise"],
  },
  topic: {
    type: Types.ObjectId,
    ref: "Topic",
    required: [true, "Le sujet est requis"],
  },
  duration: {
    type: Number,
    min: [1, "La durée doit être au moins 1 minute"],
    required: [true, "La durée est requise"],
  },
  isRecurring: {
    type: Boolean,
    default: false,
  },
  facilitator: {
    type: Types.ObjectId,
    ref: "User",
  },
  maxParticipants: {
    type: Number,
    min: [1, "Le nombre maximum de participants doit être au moins 1"],
    default: 50,
  },
});

/**
 * Subschema for study schedule configuration.
 * @module StudyScheduleSubSchema
 */
const StudyScheduleSchema = new Schema({
  sessions: {
    type: [SessionSchema],
    default: [],
    validate: {
      validator: function (arr) {
        return arr.length <= 20;
      },
      message: "Trop de sessions (maximum 20)",
    },
  },
  timezone: {
    type: String,
    default: "UTC",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

/**
 * Subschema for group features configuration.
 * @module FeaturesSubSchema
 */
const FeaturesSchema = new Schema({
  chatEnabled: {
    type: Boolean,
    default: false,
  },
  fileSharing: {
    type: Boolean,
    default: false,
  },
  liveSessions: {
    type: Boolean,
    default: false,
  },
  progressTracking: {
    type: Boolean,
    default: false,
  },
  allowInvites: {
    type: Boolean,
    default: true,
  },
  moderationEnabled: {
    type: Boolean,
    default: false,
  },
});

/**
 * Subschema for group progress summary.
 * @module ProgressSummarySubSchema
 */
const ProgressSummarySchema = new Schema({
  completedTopics: {
    type: [{ type: Types.ObjectId, ref: "Topic" }],
    default: [],
  },
  averageScore: {
    type: Number,
    min: [0, "Le score moyen ne peut pas être négatif"],
    max: [100, "Le score moyen ne peut pas dépasser 100"],
    default: 0,
  },
  totalStudyTime: {
    type: Number,
    default: 0,
    min: [0, "Le temps d'étude total ne peut pas être négatif"],
  },
  activeMembersCount: {
    type: Number,
    default: 0,
    min: [0, "Le nombre de membres actifs ne peut pas être négatif"],
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

/**
 * Subschema for group metadata.
 * @module MetadataSubSchema
 */
const MetadataSchema = new Schema({
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: function (arr) {
        return arr.length <= 15;
      },
      message: "Trop de tags (maximum 15)",
    },
  },
  category: {
    type: String,
    trim: true,
    maxlength: [50, "La catégorie ne peut pas dépasser 50 caractères"],
  },
  difficulty: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    default: "beginner",
  },
  lastActivityDate: {
    type: Date,
    default: Date.now,
  },
  totalActivities: {
    type: Number,
    default: 0,
    min: [0, "Le nombre total d'activités ne peut pas être négatif"],
  },
});

// ==================== SCHEMA ==================
/**
 * Mongoose schema for study groups, managing collaborative learning environments.
 * @module StudyGroupSchema
 */
const StudyGroupSchema = new Schema(
  {
    // Group identification
    name: {
      type: String,
      required: [true, "Le nom est requis"],
      trim: true,
      maxlength: [100, "Le nom ne peut pas dépasser 100 caractères"],
      index: true,
    },
    description: {
      type: String,
      required: [true, "La description est requise"],
      trim: true,
      maxlength: [1000, "La description ne peut pas dépasser 1000 caractères"],
    },
    series: {
      type: [String],
      default: ["D"],
      validate: {
        validator: function (arr) {
          return arr.every((s) => s && s.trim().length > 0);
        },
        message: "Toutes les séries doivent avoir au moins 1 caractère",
      },
    },
    // Group management
    memberIds: {
      type: [{ type: Types.ObjectId, ref: "User" }],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 100;
        },
        message: "Trop de membres (maximum 100)",
      },
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "Le créateur est requis"],
      index: true,
    },
    roles: {
      type: [RoleSchema],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 100;
        },
        message: "Trop de rôles (maximum 100)",
      },
    },
    // Group content
    challengeIds: {
      type: [{ type: Types.ObjectId, ref: "Quiz" }],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 50;
        },
        message: "Trop de défis (maximum 50)",
      },
    },
    learningPathId: {
      type: Types.ObjectId,
      ref: "LearningPath",
    },
    resourceIds: {
      type: [{ type: Types.ObjectId, ref: "Resource" }],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 100;
        },
        message: "Trop de ressources (maximum 100)",
      },
    },
    activities: {
      type: [ActivitySchema],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 500;
        },
        message: "Trop d'activités (maximum 500)",
      },
    },
    // Group configuration
    features: {
      type: FeaturesSchema,
      default: () => ({}),
    },
    studySchedule: {
      type: StudyScheduleSchema,
      default: () => ({}),
    },
    // Group settings
    status: {
      type: String,
      enum: {
        values: STUDY_GROUP_STATUSES,
        message: "{VALUE} n'est pas un statut valide",
      },
      default: "active",
      index: true,
    },
    privacyLevel: {
      type: String,
      enum: {
        values: STUDY_GROUP_PRIVACY_LEVELS,
        message: "{VALUE} n'est pas un niveau de confidentialité valide",
      },
      default: "public",
    },
    maxMembers: {
      type: Number,
      min: [2, "Le nombre maximum de membres doit être au moins 2"],
      max: [100, "Le nombre maximum de membres ne peut pas dépasser 100"],
      default: 50,
    },
    inviteCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    // Group progress and analytics
    groupProgressSummary: {
      type: ProgressSummarySchema,
      default: () => ({}),
    },
    metadata: {
      type: MetadataSchema,
      default: () => ({}),
    },
    // Group status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// =============== INDEXES =================
StudyGroupSchema.index({ memberIds: 1 });
StudyGroupSchema.index({ status: 1, privacyLevel: 1 });
StudyGroupSchema.index({ "studySchedule.sessions.topic": 1 });
StudyGroupSchema.index({ "metadata.tags": 1 }, { sparse: true });
StudyGroupSchema.index({ name: "text", description: "text" });
StudyGroupSchema.index({ createdAt: -1 });
StudyGroupSchema.index({ "metadata.lastActivityDate": -1 });
StudyGroupSchema.index({ isActive: 1 });

// =============== VIRTUALS =============
/**
 * Virtual field for total number of members.
 * @returns {number} Number of members in the group.
 */
StudyGroupSchema.virtual("memberCount").get(function () {
  return (this.memberIds ?? []).length;
});

/**
 * Virtual field for total number of activities.
 * @returns {number} Number of activities in the group.
 */
StudyGroupSchema.virtual("activityCount").get(function () {
  return (this.activities ?? []).length;
});

/**
 * Virtual field for active sessions count.
 * @returns {number} Number of active study sessions.
 */
StudyGroupSchema.virtual("activeSessionsCount").get(function () {
  return (this.studySchedule?.sessions ?? []).filter(
    (session) => this.studySchedule?.isActive
  ).length;
});

/**
 * Virtual field for group completion rate.
 * @returns {number} Percentage of completed activities.
 */
StudyGroupSchema.virtual("completionRate").get(function () {
  const activities = this.activities ?? [];
  if (activities.length === 0) return 0;
  const completedActivities = activities.filter(
    (activity) => activity.completedBy && activity.completedBy.length > 0
  ).length;
  return Math.round((completedActivities / activities.length) * 100);
});

/**
 * Virtual field for admin users.
 * @returns {Array} Array of admin user IDs.
 */
StudyGroupSchema.virtual("adminUsers").get(function () {
  return (this.roles ?? [])
    .filter((role) => role.role === "admin")
    .map((role) => role.userId);
});

/**
 * Virtual field to check if group is full.
 * @returns {boolean} True if group has reached maximum capacity.
 */
StudyGroupSchema.virtual("isFull").get(function () {
  return this.memberCount >= this.maxMembers;
});

/**
 * Virtual field for group activity level.
 * @returns {string} Activity level based on recent activities.
 */
StudyGroupSchema.virtual("activityLevel").get(function () {
  const lastActivity = this.metadata?.lastActivityDate;
  if (!lastActivity) return "inactive";

  const daysSinceActivity = Math.floor(
    (Date.now() - lastActivity) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceActivity <= 1) return "very_active";
  if (daysSinceActivity <= 7) return "active";
  if (daysSinceActivity <= 30) return "moderate";
  return "inactive";
});

// =============== MIDDLEWARE =============
/**
 * Pre-save middleware to validate references and update metadata.
 * @param {Function} next - Callback to proceed with save.
 */
StudyGroupSchema.pre("save", async function (next) {
  try {
    // Validate user references
    const userIds = [
      ...new Set([
        ...(this.memberIds || []),
        this.createdBy,
        ...(this.roles || []).map((r) => r.userId),
        ...(this.activities || []).map((a) => a.createdBy),
      ]),
    ];
    if (userIds.length > 0) {
      const users = await model("User").find({ _id: { $in: userIds } });
      if (users.length !== userIds.length) {
        return next(new Error("Un ou plusieurs IDs d'utilisateur invalides"));
      }
    }

    // Ensure all memberIds have roles
    const roleUserIds = this.roles.map((r) => r.userId.toString());
    for (const memberId of this.memberIds) {
      if (!roleUserIds.includes(memberId.toString())) {
        return next(new Error("Tous les membres doivent avoir un rôle"));
      }
    }

    // Validate challengeIds
    if (this.challengeIds?.length > 0) {
      const quizzes = await model("Quiz").find({
        _id: { $in: this.challengeIds },
      });
      if (quizzes.length !== this.challengeIds.length) {
        return next(new Error("Un ou plusieurs IDs de quiz invalides"));
      }
    }

    // Validate resourceIds
    if (this.resourceIds?.length > 0) {
      const resources = await model("Resource").find({
        _id: { $in: this.resourceIds },
      });
      if (resources.length !== this.resourceIds.length) {
        return next(new Error("Un ou plusieurs IDs de ressource invalides"));
      }
    }

    // Validate learningPathId
    if (this.learningPathId) {
      const learningPath = await model("LearningPath").findById(
        this.learningPathId
      );
      if (!learningPath) {
        return next(new Error("ID de parcours d'apprentissage invalide"));
      }
    }

    // Validate activities
    for (const activity of this.activities) {
      if (activity.type === "quiz" && activity.quizId) {
        const quiz = await model("Quiz").findById(activity.quizId);
        if (!quiz) return next(new Error("Invalid quiz ID in activities"));
      }
      if (activity.type === "resource_share" && activity.resourceId) {
        const resource = await model("Resource").findById(activity.resourceId);
        if (!resource)
          return next(new Error("Invalid resource ID in activities"));
      }
    }

    // Validate studySchedule.sessions.topic
    const sessionTopics = this.studySchedule.sessions.map((s) => s.topic);
    if (sessionTopics.length > 0) {
      const topics = await model("Topic").find({ _id: { $in: sessionTopics } });
      if (topics.length !== sessionTopics.length) {
        return next(
          new Error("One or more invalid topic IDs in studySchedule")
        );
      }
    }

    // Validate groupProgressSummary.completedTopics
    if (this.groupProgressSummary.completedTopics.length > 0) {
      const topics = await model("Topic").find({
        _id: { $in: this.groupProgressSummary.completedTopics },
      });
      if (topics.length !== this.groupProgressSummary.completedTopics.length) {
        return next(
          new Error("One or more invalid topic IDs in groupProgressSummary")
        );
      }
    }

    // Update metadata
    if (this.isModified("activities")) {
      this.metadata.totalActivities = (this.activities ?? []).length;
      this.metadata.lastActivityDate = new Date();
    }

    // Generate invite code if needed
    if (this.privacyLevel === "invite_only" && !this.inviteCode) {
      this.inviteCode = Math.random().toString(36).substring(2, 15);
    }

    // Normalize tags
    if (this.metadata?.tags?.length > 0) {
      this.metadata.tags = this.metadata.tags
        .map((tag) => tag.toLowerCase().trim())
        .filter((tag) => tag.length > 0);
      // Remove duplicates
      this.metadata.tags = [...new Set(this.metadata.tags)];
    }

    next();
  } catch (error) {
    next(error);
  }
});

// =============== METHODS =============
/**
 * Add a member to the study group.
 * @param {string} userId - ID of the user to add.
 * @param {string} role - Role to assign to the member.
 * @returns {Promise<Document>} Updated study group document.
 */
StudyGroupSchema.methods.addMember = function (userId, role = "member") {
  if (this.memberIds.includes(userId)) {
    throw new Error("L'utilisateur est déjà membre du groupe");
  }

  if (this.isFull) {
    throw new Error("Le groupe a atteint sa capacité maximale");
  }

  this.memberIds.push(userId);
  this.roles.push({
    userId,
    role,
    assignedAt: new Date(),
    assignedBy: this.createdBy,
  });

  return this.save();
};

/**
 * Remove a member from the study group.
 * @param {string} userId - ID of the user to remove.
 * @returns {Promise<Document>} Updated study group document.
 */
StudyGroupSchema.methods.removeMember = function (userId) {
  this.memberIds = this.memberIds.filter((id) => id.toString() !== userId);
  this.roles = this.roles.filter((role) => role.userId.toString() !== userId);

  return this.save();
};

/**
 * Add an activity to the study group.
 * @param {Object} activityData - Activity data object.
 * @returns {Promise<Document>} Updated study group document.
 */
StudyGroupSchema.methods.addActivity = function (activityData) {
  this.activities.push({
    ...activityData,
    createdAt: new Date(),
  });

  return this.save();
};

/**
 * Update group progress summary.
 * @param {Object} progressData - Progress data to update.
 * @returns {Promise<Document>} Updated study group document.
 */
StudyGroupSchema.methods.updateProgress = function (progressData) {
  Object.assign(this.groupProgressSummary, {
    ...progressData,
    lastUpdated: new Date(),
  });

  return this.save();
};

/**
 * Archive the study group.
 * @param {string} reason - Reason for archiving.
 * @returns {Promise<Document>} Updated study group document.
 */
StudyGroupSchema.methods.archive = function (reason = "") {
  this.isActive = false;
  this.status = "archived";
  this.metadata.lastActivityDate = new Date();

  return this.save();
};

/**
 * Get study group statistics.
 * @returns {Object} Study group statistics object.
 */
StudyGroupSchema.methods.getStatistics = function () {
  return {
    memberCount: this.memberCount,
    activityCount: this.activityCount,
    activeSessionsCount: this.activeSessionsCount,
    completionRate: this.completionRate,
    activityLevel: this.activityLevel,
    averageScore: this.groupProgressSummary?.averageScore || 0,
    totalStudyTime: this.groupProgressSummary?.totalStudyTime || 0,
    activeMembersCount: this.groupProgressSummary?.activeMembersCount || 0,
  };
};

/**
 * StudyGroup model for interacting with the StudyGroup collection.
 * @type {mongoose.Model}
 */
module.exports = {
  StudyGroup: model("StudyGroup", StudyGroupSchema),
};
