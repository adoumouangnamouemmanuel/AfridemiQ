const { Schema, model, Types } = require("mongoose");
const {
  EDUCATION_LEVELS,
  EXAM_SCHEDULE_TYPES,
  VENUE_TYPES,
  PARTICIPANT_STATUSES,
  PAYMENT_STATUSES_EXAM_SCHEDULE,
  PROCTORING_TYPES,
  EXAM_SCHEDULE_STATUSES,
} = require("../../constants");

// =============== CONSTANTS =============
/**
 * Imported constants for education levels, exam schedule types, venue types, participant statuses, payment statuses, proctoring types, and exam schedule statuses.
 * @see module:constants/index
 */

// =============== SUBSCHEMAS =============
/**
 * Subschema for reminder schedules.
 * @module ReminderScheduleSubSchema
 */
const ReminderScheduleSchema = new Schema({
  time: {
    type: Number, // minutes before exam
  },
  sent: {
    type: Boolean,
    default: false,
  },
});

/**
 * Subschema for exam participants.
 * @module ParticipantSubSchema
 */
const ParticipantSchema = new Schema({
  userId: {
    type: Types.ObjectId,
    ref: "User",
    required: [true, "L'ID de l'utilisateur est requis"],
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: PARTICIPANT_STATUSES,
    default: PARTICIPANT_STATUSES[0], // registered
  },
  paymentStatus: {
    type: String,
    enum: PAYMENT_STATUSES_EXAM_SCHEDULE,
    default: PAYMENT_STATUSES_EXAM_SCHEDULE[0], // pending
  },
});

// ==================== SCHEMA ==================
/**
 * Mongoose schema for exam schedules, managing exam events and participant registration.
 * @module ExamScheduleSchema
 */
const ExamScheduleSchema = new Schema(
  {
    // Schedule details
    examId: {
      type: Types.ObjectId,
      ref: "Exam",
      required: [true, "L'ID de l'examen est requis"],
    },
    subjectId: {
      type: Types.ObjectId,
      ref: "Subject",
      required: [true, "L'ID de la matière est requis"],
    },
    creatorId: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "L'ID du créateur est requis"],
    },
    title: {
      type: String,
      required: [true, "Le titre est requis"],
      trim: true,
      maxlength: [200, "Le titre est trop long (max 200 caractères)"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "La description est trop longue (max 1000 caractères)"],
    },
    series: {
      type: [String],
      default: [],
    },
    level: {
      type: String,
      enum: EDUCATION_LEVELS,
      required: [true, "Le niveau d'éducation est requis"],
    },
    examType: {
      type: String,
      enum: EXAM_SCHEDULE_TYPES,
      default: EXAM_SCHEDULE_TYPES[1], // practice
    },
    // Scheduling
    scheduling: {
      date: {
        type: Date,
        required: [true, "La date est requise"],
      },
      time: {
        type: String,
        required: [true, "L'heure est requise"],
      }, // Format: "HH:MM"
      duration: {
        type: Number,
        required: [true, "La durée est requise"],
        min: [1, "La durée doit être d'au moins 1 minute"],
        max: [480, "La durée ne peut dépasser 8 heures"],
      },
      timezone: {
        type: String,
        default: "Africa/Lagos",
      },
      buffer: {
        before: {
          type: Number,
          default: 15, // minutes before exam starts
        },
        after: {
          type: Number,
          default: 15, // minutes after exam ends
        },
      },
    },
    // Venue
    venue: {
      type: {
        type: String,
        enum: VENUE_TYPES,
        default: VENUE_TYPES[0], // online
      },
      location: {
        type: String, // Physical address for physical/hybrid exams
      },
      onlineLink: {
        type: String, // Meeting link for online exams
      },
      capacity: {
        type: Number,
      },
      requirements: {
        type: [String], // Equipment, software requirements
        default: [],
      },
    },
    // Registration
    registration: {
      isRequired: {
        type: Boolean,
        default: true,
      },
      deadline: {
        type: Date,
      },
      fee: {
        type: Number,
        default: 0,
        min: [0, "Les frais ne peuvent pas être négatifs"],
      },
      maxParticipants: {
        type: Number,
      },
      currentParticipants: {
        type: Number,
        default: 0,
        min: [0, "Le nombre de participants ne peut pas être négatif"],
      },
    },
    participants: {
      type: [ParticipantSchema],
      default: [],
    },
    // Proctoring
    proctoring: {
      enabled: {
        type: Boolean,
        default: false,
      },
      type: {
        type: String,
        enum: PROCTORING_TYPES,
        default: PROCTORING_TYPES[0], // automated
      },
      settings: {
        cameraRequired: { type: Boolean, default: false },
        screenRecording: { type: Boolean, default: false },
        tabSwitchDetection: { type: Boolean, default: false },
        plagiarismCheck: { type: Boolean, default: false },
      },
    },
    // Instructions
    instructions: {
      general: {
        type: [String],
        default: [],
      },
      technical: {
        type: [String],
        default: [],
      },
      materials: {
        type: [String], // Allowed materials
        default: [],
      },
    },
    // Notifications
    notifications: {
      reminder: {
        enabled: { type: Boolean, default: true },
        schedule: {
          type: [ReminderScheduleSchema],
          default: [],
        },
      },
      updates: {
        enabled: { type: Boolean, default: true },
        lastSent: { type: Date },
      },
    },
    // Results
    results: {
      publishDate: { type: Date },
      published: { type: Boolean, default: false },
      analytics: {
        totalParticipants: { type: Number, default: 0 },
        completionRate: { type: Number, default: 0 },
        averageScore: { type: Number, default: 0 },
        passRate: { type: Number, default: 0 },
      },
    },
    // Metadata
    status: {
      type: String,
      enum: EXAM_SCHEDULE_STATUSES,
      default: EXAM_SCHEDULE_STATUSES[0], // draft
    },
    tags: {
      type: [String],
      default: [],
    },
    notes: {
      type: String, // Internal notes for administrators
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
ExamScheduleSchema.index({ examId: 1, subjectId: 1 });
ExamScheduleSchema.index({ "scheduling.date": 1, status: 1 });
ExamScheduleSchema.index({ level: 1, examType: 1 });
ExamScheduleSchema.index({ creatorId: 1, status: 1 });
ExamScheduleSchema.index({ "registration.deadline": 1 });
ExamScheduleSchema.index({ tags: 1 }, { sparse: true });

// =============== VIRTUALS =============
/**
 * Virtual field to check if registration is open.
 * @returns {boolean} True if registration is open, false otherwise.
 */
ExamScheduleSchema.virtual("isRegistrationOpen").get(function () {
  if (!this.registration.isRequired) return false;
  const now = new Date();
  const deadline = this.registration.deadline ?? this.scheduling.date;
  return this.status === EXAM_SCHEDULE_STATUSES[1] && now < deadline; // scheduled
});

/**
 * Virtual field for available participant slots.
 * @returns {number|null} Number of available slots or null if no limit.
 */
ExamScheduleSchema.virtual("availableSlots").get(function () {
  if (!this.registration.maxParticipants) return null;
  return (
    this.registration.maxParticipants - this.registration.currentParticipants
  );
});

/**
 * Virtual field for exam start date and time.
 * @returns {Date} Combined date and time of the exam.
 */
ExamScheduleSchema.virtual("examDateTime").get(function () {
  const date = new Date(this.scheduling.date);
  const [hours, minutes] = this.scheduling.time.split(":");
  date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return date;
});

/**
 * Virtual field for exam end time.
 * @returns {Date} End time of the exam.
 */
ExamScheduleSchema.virtual("examEndTime").get(function () {
  const startTime = this.examDateTime;
  return new Date(startTime.getTime() + this.scheduling.duration * 60000);
});

/**
 * Virtual field to check if the exam is currently active.
 * @returns {boolean} True if exam is active and within time window, false otherwise.
 */
ExamScheduleSchema.virtual("isCurrentlyActive").get(function () {
  const now = new Date();
  const startTime = this.examDateTime;
  const endTime = this.examEndTime;
  return (
    this.status === EXAM_SCHEDULE_STATUSES[2] && // active
    now >= startTime &&
    now <= endTime
  );
});

/**
 * Virtual field to check if the exam can start.
 * @returns {boolean} True if exam can start, false otherwise.
 */
ExamScheduleSchema.virtual("canStart").get(function () {
  const now = new Date();
  const startTime = new Date(
    this.examDateTime.getTime() - this.scheduling.buffer.before * 60000
  );
  return this.status === EXAM_SCHEDULE_STATUSES[1] && now >= startTime; // scheduled
});

// =============== METHODS =============
/**
 * Checks if a user can register for the exam.
 * @param {string} userId - ID of the user.
 * @returns {boolean} True if user can register, false otherwise.
 */
ExamScheduleSchema.methods.canUserRegister = function (userId) {
  if (!this.isRegistrationOpen) return false;
  if (
    this.registration.maxParticipants &&
    this.registration.currentParticipants >= this.registration.maxParticipants
  ) {
    return false;
  }

  const existingRegistration = this.participants.find((p) =>
    p.userId.equals(userId)
  );
  return (
    !existingRegistration ||
    existingRegistration.status === PARTICIPANT_STATUSES[4]
  ); // cancelled
};

/**
 * Registers a user for the exam.
 * @param {string} userId - ID of the user to register.
 * @param {boolean} [paymentRequired=false] - Whether payment is required.
 * @returns {Promise<Document>} Updated exam schedule document.
 * @throws {Error} If user cannot register.
 */
ExamScheduleSchema.methods.registerUser = function (
  userId,
  paymentRequired = false
) {
  if (!this.canUserRegister(userId)) {
    throw new Error("L'utilisateur ne peut pas s'inscrire à cet examen");
  }

  const existingIndex = this.participants.findIndex((p) =>
    p.userId.equals(userId)
  );

  if (existingIndex >= 0) {
    // Reactivate cancelled registration
    this.participants[existingIndex].status = PARTICIPANT_STATUSES[0]; // registered
    this.participants[existingIndex].registeredAt = new Date();
    this.participants[existingIndex].paymentStatus = paymentRequired
      ? PAYMENT_STATUSES_EXAM_SCHEDULE[0] // pending
      : PAYMENT_STATUSES_EXAM_SCHEDULE[1]; // paid
  } else {
    // New registration
    this.participants.push({
      userId,
      status: PARTICIPANT_STATUSES[0], // registered
      paymentStatus: paymentRequired
        ? PAYMENT_STATUSES_EXAM_SCHEDULE[0] // pending
        : PAYMENT_STATUSES_EXAM_SCHEDULE[1], // paid
    });
    this.registration.currentParticipants += 1;
  }

  return this.save();
};

/**
 * Unregisters a user from the exam.
 * @param {string} userId - ID of the user to unregister.
 * @returns {Promise<Document>} Updated exam schedule document.
 * @throws {Error} If user is not registered or has attended.
 */
ExamScheduleSchema.methods.unregisterUser = function (userId) {
  const participantIndex = this.participants.findIndex((p) =>
    p.userId.equals(userId)
  );

  if (participantIndex === -1) {
    throw new Error("L'utilisateur n'est pas inscrit à cet examen");
  }

  if (this.participants[participantIndex].status === PARTICIPANT_STATUSES[2]) {
    // attended
    throw new Error(
      "Impossible de désinscrire un utilisateur qui a déjà assisté à l'examen"
    );
  }

  this.participants[participantIndex].status = PARTICIPANT_STATUSES[4]; // cancelled
  this.registration.currentParticipants = Math.max(
    0,
    this.registration.currentParticipants - 1
  );

  return this.save();
};

/**
 * Updates a participant's status.
 * @param {string} userId - ID of the user.
 * @param {string} status - New status for the participant.
 * @returns {Promise<Document>} Updated exam schedule document.
 * @throws {Error} If user is not registered.
 */
ExamScheduleSchema.methods.updateParticipantStatus = function (userId, status) {
  const participant = this.participants.find((p) => p.userId.equals(userId));

  if (!participant) {
    throw new Error("L'utilisateur n'est pas inscrit à cet examen");
  }

  participant.status = status;
  return this.save();
};

/**
 * Starts the exam.
 * @returns {Promise<Document>} Updated exam schedule document.
 * @throws {Error} If exam cannot be started.
 */
ExamScheduleSchema.methods.startExam = function () {
  if (!this.canStart) {
    throw new Error("L'examen ne peut pas commencer maintenant");
  }

  this.status = EXAM_SCHEDULE_STATUSES[2]; // active
  return this.save();
};

/**
 * Completes the exam and updates analytics.
 * @returns {Promise<Document>} Updated exam schedule document.
 */
ExamScheduleSchema.methods.completeExam = function () {
  this.status = EXAM_SCHEDULE_STATUSES[3]; // completed

  // Calculate basic analytics
  const attendedCount = this.participants.filter(
    (p) => p.status === PARTICIPANT_STATUSES[2] // attended
  ).length;
  this.results.analytics.totalParticipants = attendedCount;
  this.results.analytics.completionRate =
    this.registration.currentParticipants > 0
      ? (attendedCount / this.registration.currentParticipants) * 100
      : 0;

  return this.save();
};

// =============== STATICS =============
/**
 * Finds upcoming exam schedules.
 * @param {number} [limit=10] - Maximum number of schedules to return.
 * @returns {Promise<Document[]>} Array of upcoming exam schedule documents.
 */
ExamScheduleSchema.statics.findUpcoming = function (limit = 10) {
  const now = new Date();
  return this.find({
    "scheduling.date": { $gte: now },
    status: { $in: [EXAM_SCHEDULE_STATUSES[1], EXAM_SCHEDULE_STATUSES[0]] }, // scheduled, draft
    isActive: true,
  })
    .populate("examId", "title description")
    .populate("subjectId", "name code")
    .sort({ "scheduling.date": 1 })
    .limit(limit);
};

/**
 * Finds exam schedules within a date range.
 * @param {Date|string} startDate - Start of the date range.
 * @param {Date|string} endDate - End of the date range.
 * @returns {Promise<Document[]>} Array of matching exam schedule documents.
 */
ExamScheduleSchema.statics.findByDateRange = function (startDate, endDate) {
  return this.find({
    "scheduling.date": {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
    isActive: true,
  })
    .populate("examId", "title description")
    .populate("subjectId", "name code")
    .sort({ "scheduling.date": 1 });
};

/**
 * Finds exam schedules by subject with optional filters.
 * @param {string} subjectId - ID of the subject.
 * @param {Object} [options={}] - Optional filters (level, examType, status).
 * @returns {Promise<Document[]>} Array of matching exam schedule documents.
 */
ExamScheduleSchema.statics.findBySubject = function (subjectId, options = {}) {
  const query = { subjectId, isActive: true };

  if (options.level) query.level = options.level;
  if (options.examType) query.examType = options.examType;
  if (options.status) query.status = options.status;

  return this.find(query)
    .populate("examId", "title description")
    .populate("subjectId", "name code")
    .sort({ "scheduling.date": 1 });
};

/**
 * ExamSchedule model for interacting with the ExamSchedule collection.
 * @type {mongoose.Model}
 */
module.exports = {
  ExamSchedule: model("ExamSchedule", ExamScheduleSchema),
};
