const { Schema, model, Types } = require("mongoose");
const {
  EDUCATION_LEVELS,
  DIFFICULTY_LEVELS,
  CHALLENGE_STATUSES,
} = require("../../constants");

// =============== CONSTANTS =============
/**
 * Imported constants for education levels, difficulty levels, and challenge statuses.
 * @see module:constants/index
 */

// =============== SUBSCHEMAS =============
/**
 * Subschema for challenge winners.
 * @module WinnerSubSchema
 */
const WinnerSchema = new Schema({
  userId: {
    type: Types.ObjectId,
    ref: "User",
  },
  rank: {
    type: Number,
    min: [1, "Le rang doit être au moins 1"],
  },
  score: {
    type: Number,
    min: [0, "Le score ne peut pas être négatif"],
  },
  timeSpent: {
    type: Number,
    min: [0, "Le temps passé ne peut pas être négatif"],
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
});

/**
 * Subschema for challenge prizes.
 * @module PrizeSubSchema
 */
const PrizeSchema = new Schema({
  rank: {
    type: Number,
    min: [1, "Le rang doit être au moins 1"],
  },
  description: {
    type: String,
  },
  points: {
    type: Number,
    min: [0, "Les points ne peuvent pas être négatifs"],
  },
  badge: {
    type: String,
  },
});

// ==================== SCHEMA ==================
/**
 * Mongoose schema for challenges, managing competitive assessments.
 * @module ChallengeSchema
 */
const ChallengeSchema = new Schema(
  {
    // Challenge details
    title: {
      type: String,
      required: [true, "Le titre est requis"],
      trim: true,
      maxlength: [200, "Le titre est trop long (max 200 caractères)"],
    },
    description: {
      type: String,
      required: [true, "La description est requise"],
      trim: true,
      maxlength: [1000, "La description est trop longue (max 1000 caractères)"],
    },
    creatorId: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "L'ID du créateur est requis"],
    },
    subjectId: {
      type: Types.ObjectId,
      ref: "Subject",
      required: [true, "L'ID de la matière est requis"],
    },
    topicId: {
      type: Types.ObjectId,
      ref: "Topic",
      required: [true, "L'ID du sujet est requis"],
    },
    // Categorization
    level: {
      type: String,
      enum: EDUCATION_LEVELS,
      required: [true, "Le niveau d'éducation est requis"],
    },
    difficulty: {
      type: String,
      enum: DIFFICULTY_LEVELS,
      required: [true, "La difficulté est requise"],
    },
    series: {
      type: [String],
      default: [],
    },
    // Questions and participants
    questionIds: {
      type: [{ type: Types.ObjectId, ref: "Question" }],
      required: [true, "Les IDs des questions sont requis"],
      default: [],
    },
    timeLimit: {
      type: Number,
      required: [true, "La limite de temps est requise"],
      min: [1, "La durée doit être d'au moins 1 minute"],
      max: [480, "La durée ne peut dépasser 8 heures"],
    },
    maxParticipants: {
      type: Number,
      min: [2, "Le nombre maximum de participants doit être au moins 2"],
      max: [1000, "Le nombre maximum de participants ne peut dépasser 1000"],
      default: 100,
    },
    participants: {
      type: [{ type: Types.ObjectId, ref: "User" }],
      default: [],
    },
    winners: {
      type: [WinnerSchema],
      default: [],
    },
    prizes: {
      type: [PrizeSchema],
      default: [],
    },
    // Rules
    rules: {
      allowMultipleAttempts: { type: Boolean, default: false },
      showLeaderboard: { type: Boolean, default: true },
      shuffleQuestions: { type: Boolean, default: true },
      preventCheating: { type: Boolean, default: true },
    },
    // Scheduling
    scheduling: {
      startDate: {
        type: Date,
        required: [true, "La date de début est requise"],
      },
      endDate: {
        type: Date,
        required: [true, "La date de fin est requise"],
      },
      timezone: { type: String, default: "Africa/Lagos" },
      registrationDeadline: { type: Date },
    },
    // Analytics
    analytics: {
      totalParticipants: { type: Number, default: 0 },
      completionRate: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
      averageTimeSpent: { type: Number, default: 0 },
    },
    // Metadata
    status: {
      type: String,
      enum: CHALLENGE_STATUSES,
      default: CHALLENGE_STATUSES[0], // draft
    },
    tags: {
      type: [String],
      default: [],
    },
    premiumOnly: {
      type: Boolean,
      default: false,
    },
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
ChallengeSchema.index({ creatorId: 1, status: 1 });
ChallengeSchema.index({ subjectId: 1, topicId: 1 });
ChallengeSchema.index({ level: 1, difficulty: 1 });
ChallengeSchema.index({ "scheduling.startDate": 1, "scheduling.endDate": 1 });
ChallengeSchema.index({ status: 1, isActive: 1 }, { sparse: true });
ChallengeSchema.index({ tags: 1 });

// =============== VIRTUALS =============
/**
 * Virtual field for the number of participants in the challenge.
 * @returns {number} Length of participants array.
 */
ChallengeSchema.virtual("participantCount").get(function () {
  return (this.participants ?? []).length;
});

/**
 * Virtual field for the number of questions in the challenge.
 * @returns {number} Length of questionIds array.
 */
ChallengeSchema.virtual("questionCount").get(function () {
  return (this.questionIds ?? []).length;
});

/**
 * Virtual field to check if registration is open.
 * @returns {boolean} True if status is open and before deadline, false otherwise.
 */
ChallengeSchema.virtual("isRegistrationOpen").get(function () {
  const now = new Date();
  const deadline =
    this.scheduling?.registrationDeadline ?? this.scheduling?.startDate;
  return this.status === CHALLENGE_STATUSES[1] && now < deadline; // open
});

/**
 * Virtual field to check if the challenge is currently active.
 * @returns {boolean} True if status is active and within scheduling window, false otherwise.
 */
ChallengeSchema.virtual("isCurrentlyActive").get(function () {
  const now = new Date();
  return (
    this.status === CHALLENGE_STATUSES[2] && // active
    this.scheduling?.startDate <= now &&
    this.scheduling?.endDate >= now
  );
});

/**
 * Virtual field to check if the challenge is completed.
 * @returns {boolean} True if status is completed or past end date, false otherwise.
 */
ChallengeSchema.virtual("isCompleted").get(function () {
  return (
    this.status === CHALLENGE_STATUSES[3] || // completed
    (new Date() > this.scheduling?.endDate &&
      this.status === CHALLENGE_STATUSES[2]) // active
  );
});

// =============== METHODS =============
/**
 * Checks if a user can join the challenge.
 * @param {string} userId - ID of the user.
 * @returns {boolean} True if user can join, false otherwise.
 */
ChallengeSchema.methods.canUserJoin = function (userId) {
  if (this.status !== CHALLENGE_STATUSES[1]) return false; // open
  if (this.participants.includes(userId)) return false;
  if (this.participants.length >= this.maxParticipants) return false;

  const now = new Date();
  const deadline =
    this.scheduling?.registrationDeadline ?? this.scheduling?.startDate;
  return now < deadline;
};

/**
 * Adds a participant to the challenge.
 * @param {string} userId - ID of the user to add.
 * @returns {Promise<Document>} Updated challenge document.
 * @throws {Error} If user cannot join the challenge.
 */
ChallengeSchema.methods.addParticipant = function (userId) {
  if (!this.canUserJoin(userId)) {
    throw new Error("L'utilisateur ne peut pas rejoindre ce défi");
  }

  this.participants.push(userId);
  this.analytics.totalParticipants = this.participants.length;
  return this.save();
};

/**
 * Removes a participant from the challenge.
 * @param {string} userId - ID of the user to remove.
 * @returns {Promise<Document>} Updated challenge document.
 */
ChallengeSchema.methods.removeParticipant = function (userId) {
  this.participants = this.participants.filter((id) => !id.equals(userId));
  this.analytics.totalParticipants = this.participants.length;
  return this.save();
};

/**
 * Adds a winner to the challenge and updates ranks.
 * @param {Object} winnerData - Winner data including userId, score, timeSpent, completedAt.
 * @returns {Promise<Document>} Updated challenge document.
 */
ChallengeSchema.methods.addWinner = function (winnerData) {
  this.winners.push(winnerData);
  this.winners.sort((a, b) => b.score - a.score || a.timeSpent - b.timeSpent);

  // Update ranks
  this.winners.forEach((winner, index) => {
    winner.rank = index + 1;
  });

  return this.save();
};

/**
 * Updates challenge analytics based on winners.
 * @returns {Promise<Document>} Updated challenge document.
 */
ChallengeSchema.methods.updateAnalytics = function () {
  if (this.winners.length > 0) {
    const totalScore = this.winners.reduce((sum, w) => sum + w.score, 0);
    const totalTime = this.winners.reduce((sum, w) => sum + w.timeSpent, 0);

    this.analytics.averageScore = totalScore / this.winners.length;
    this.analytics.averageTimeSpent = totalTime / this.winners.length;
    this.analytics.completionRate =
      (this.winners.length / this.analytics.totalParticipants) * 100;
  }

  return this.save();
};

// =============== STATICS =============
/**
 * Finds active challenges within their scheduling window.
 * @returns {Promise<Document[]>} Array of active challenge documents.
 */
ChallengeSchema.statics.findActive = function () {
  const now = new Date();
  return this.find({
    status: CHALLENGE_STATUSES[2], // active
    isActive: true,
    "scheduling.startDate": { $lte: now },
    "scheduling.endDate": { $gte: now },
  })
    .populate("creatorId", "name")
    .populate("subjectId", "name code")
    .populate("topicId", "name");
};

/**
 * Finds open challenges accepting registrations.
 * @returns {Promise<Document[]>} Array of open challenge documents.
 */
ChallengeSchema.statics.findOpen = function () {
  const now = new Date();
  return this.find({
    status: CHALLENGE_STATUSES[1], // open
    isActive: true,
    $or: [
      { "scheduling.registrationDeadline": { $gte: now } },
      {
        "scheduling.registrationDeadline": { $exists: false },
        "scheduling.startDate": { $gte: now },
      },
    ],
  })
    .populate("creatorId", "name")
    .populate("subjectId", "name code")
    .populate("topicId", "name");
};

/**
 * Finds active or open challenges by subject.
 * @param {string} subjectId - ID of the subject.
 * @returns {Promise<Document[]>} Array of matching challenge documents.
 */
ChallengeSchema.statics.findBySubject = function (subjectId) {
  return this.find({
    subjectId,
    isActive: true,
    status: { $in: [CHALLENGE_STATUSES[1], CHALLENGE_STATUSES[2]] }, // open, active
  })
    .populate("creatorId", "name")
    .populate("topicId", "name")
    .sort({ "scheduling.startDate": 1 });
};

/**
 * Challenge model for interacting with the Challenge collection.
 * @type {mongoose.Model}
 */
module.exports = {
  Challenge: model("Challenge", ChallengeSchema),
};
