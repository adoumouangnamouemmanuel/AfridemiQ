const mongoose = require("mongoose");
const { Schema } = mongoose;

const ExamScheduleSchema = new Schema(
  {
    examId: {
      type: Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
      index: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    series: [String],
    level: {
      type: String,
      enum: ["Primary", "JSS", "SSS", "University", "Professional"],
      required: true,
      index: true,
    },
    examType: {
      type: String,
      enum: ["mock", "practice", "official", "assessment"],
      default: "practice",
    },
    scheduling: {
      date: { type: Date, required: true },
      time: { type: String, required: true }, // Format: "HH:MM"
      duration: {
        type: Number,
        required: true,
        min: 1,
        max: 480, // 8 hours max
      },
      timezone: { type: String, default: "Africa/Lagos" },
      buffer: {
        before: { type: Number, default: 15 }, // minutes before exam starts
        after: { type: Number, default: 15 }, // minutes after exam ends
      },
    },
    venue: {
      type: {
        type: String,
        enum: ["online", "physical", "hybrid"],
        default: "online",
      },
      location: String, // Physical address for physical/hybrid exams
      onlineLink: String, // Meeting link for online exams
      capacity: Number,
      requirements: [String], // Equipment, software requirements
    },
    registration: {
      isRequired: { type: Boolean, default: true },
      deadline: Date,
      fee: { type: Number, default: 0 },
      maxParticipants: Number,
      currentParticipants: { type: Number, default: 0 },
    },
    participants: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        registeredAt: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ["registered", "confirmed", "attended", "absent", "cancelled"],
          default: "registered",
        },
        paymentStatus: {
          type: String,
          enum: ["pending", "paid", "failed", "refunded"],
          default: "pending",
        },
      },
    ],
    proctoring: {
      enabled: { type: Boolean, default: false },
      type: {
        type: String,
        enum: ["automated", "human", "hybrid"],
        default: "automated",
      },
      settings: {
        cameraRequired: { type: Boolean, default: false },
        screenRecording: { type: Boolean, default: false },
        tabSwitchDetection: { type: Boolean, default: false },
        plagiarismCheck: { type: Boolean, default: false },
      },
    },
    instructions: {
      general: [String],
      technical: [String],
      materials: [String], // Allowed materials
    },
    notifications: {
      reminder: {
        enabled: { type: Boolean, default: true },
        schedule: [
          {
            // Multiple reminders
            time: Number, // minutes before exam
            sent: { type: Boolean, default: false },
          },
        ],
      },
      updates: {
        enabled: { type: Boolean, default: true },
        lastSent: Date,
      },
    },
    results: {
      publishDate: Date,
      published: { type: Boolean, default: false },
      analytics: {
        totalParticipants: { type: Number, default: 0 },
        completionRate: { type: Number, default: 0 },
        averageScore: { type: Number, default: 0 },
        passRate: { type: Number, default: 0 },
      },
    },
    status: {
      type: String,
      enum: [
        "draft",
        "scheduled",
        "active",
        "completed",
        "cancelled",
        "postponed",
      ],
      default: "draft",
    },
    tags: [String],
    notes: String, // Internal notes for administrators
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
ExamScheduleSchema.index({ examId: 1, subjectId: 1 });
ExamScheduleSchema.index({ "scheduling.date": 1, status: 1 });
ExamScheduleSchema.index({ level: 1, examType: 1 });
ExamScheduleSchema.index({ creatorId: 1, status: 1 });
ExamScheduleSchema.index({ "registration.deadline": 1 });
ExamScheduleSchema.index({ tags: 1 });

// Virtual fields
ExamScheduleSchema.virtual("isRegistrationOpen").get(function () {
  if (!this.registration.isRequired) return false;
  const now = new Date();
  const deadline = this.registration.deadline || this.scheduling.date;
  return this.status === "scheduled" && now < deadline;
});

ExamScheduleSchema.virtual("availableSlots").get(function () {
  if (!this.registration.maxParticipants) return null;
  return (
    this.registration.maxParticipants - this.registration.currentParticipants
  );
});

ExamScheduleSchema.virtual("examDateTime").get(function () {
  const date = new Date(this.scheduling.date);
  const [hours, minutes] = this.scheduling.time.split(":");
  date.setHours(Number.parseInt(hours), Number.parseInt(minutes), 0, 0);
  return date;
});

ExamScheduleSchema.virtual("examEndTime").get(function () {
  const startTime = this.examDateTime;
  return new Date(startTime.getTime() + this.scheduling.duration * 60000);
});

ExamScheduleSchema.virtual("isCurrentlyActive").get(function () {
  const now = new Date();
  const startTime = this.examDateTime;
  const endTime = this.examEndTime;
  return this.status === "active" && now >= startTime && now <= endTime;
});

ExamScheduleSchema.virtual("canStart").get(function () {
  const now = new Date();
  const startTime = new Date(
    this.examDateTime.getTime() - this.scheduling.buffer.before * 60000
  );
  return this.status === "scheduled" && now >= startTime;
});

// Methods
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
  return !existingRegistration || existingRegistration.status === "cancelled";
};

ExamScheduleSchema.methods.registerUser = function (
  userId,
  paymentRequired = false
) {
  if (!this.canUserRegister(userId)) {
    throw new Error("User cannot register for this exam");
  }

  const existingIndex = this.participants.findIndex((p) =>
    p.userId.equals(userId)
  );

  if (existingIndex >= 0) {
    // Reactivate cancelled registration
    this.participants[existingIndex].status = "registered";
    this.participants[existingIndex].registeredAt = new Date();
    this.participants[existingIndex].paymentStatus = paymentRequired
      ? "pending"
      : "paid";
  } else {
    // New registration
    this.participants.push({
      userId,
      status: "registered",
      paymentStatus: paymentRequired ? "pending" : "paid",
    });
    this.registration.currentParticipants += 1;
  }

  return this.save();
};

ExamScheduleSchema.methods.unregisterUser = function (userId) {
  const participantIndex = this.participants.findIndex((p) =>
    p.userId.equals(userId)
  );

  if (participantIndex === -1) {
    throw new Error("User is not registered for this exam");
  }

  if (this.participants[participantIndex].status === "attended") {
    throw new Error("Cannot unregister user who has already attended");
  }

  this.participants[participantIndex].status = "cancelled";
  this.registration.currentParticipants = Math.max(
    0,
    this.registration.currentParticipants - 1
  );

  return this.save();
};

ExamScheduleSchema.methods.updateParticipantStatus = function (userId, status) {
  const participant = this.participants.find((p) => p.userId.equals(userId));

  if (!participant) {
    throw new Error("User is not registered for this exam");
  }

  participant.status = status;
  return this.save();
};

ExamScheduleSchema.methods.startExam = function () {
  if (!this.canStart) {
    throw new Error("Exam cannot be started at this time");
  }

  this.status = "active";
  return this.save();
};

ExamScheduleSchema.methods.completeExam = function () {
  this.status = "completed";

  // Calculate basic analytics
  const attendedCount = this.participants.filter(
    (p) => p.status === "attended"
  ).length;
  this.results.analytics.totalParticipants = attendedCount;
  this.results.analytics.completionRate =
    (attendedCount / this.registration.currentParticipants) * 100;

  return this.save();
};

// Static methods
ExamScheduleSchema.statics.findUpcoming = function (limit = 10) {
  const now = new Date();
  return this.find({
    "scheduling.date": { $gte: now },
    status: { $in: ["scheduled", "draft"] },
    isActive: true,
  })
    .populate("examId", "title description")
    .populate("subjectId", "name code")
    .sort({ "scheduling.date": 1 })
    .limit(limit);
};

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

module.exports = {
  ExamSchedule: mongoose.model("ExamSchedule", ExamScheduleSchema),
};