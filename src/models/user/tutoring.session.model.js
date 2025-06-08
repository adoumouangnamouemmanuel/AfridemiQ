const { Schema, model, mongoose } = require("mongoose");
const { SESSION_STATUSES } = require("../../constants");

// =============== CONSTANTS =============
/**
 * Imported constants for tutoring session statuses.
 * @see module:constants/index
 */

// ==================== SCHEMA ==================
/**
 * Mongoose schema for tutoring sessions, managing session details and validation.
 * @module TutoringSessionSchema
 */
const TutoringSessionSchema = new Schema(
  {
    // Session details
    tutorId: {
      type: mongoose.Types.ObjectId,
      ref: "PeerTutorProfile",
      required: [true, "Identifiant du tuteur requis"],
    },
    studentId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Identifiant de l'étudiant requis"],
    },
    subjectId: {
      type: mongoose.Types.ObjectId,
      ref: "Subject",
      required: [true, "Identifiant de la matière requis"],
    },
    series: {
      type: [{ type: String, trim: true }],
      default: [],
      validate: {
        validator: (v) => v.every((s) => s.length >= 1),
        message: "Les séries ne peuvent pas être vides",
      },
    },
    topicId: {
      type: mongoose.Types.ObjectId,
      ref: "Topic",
    },
    // Scheduling details
    scheduledAt: {
      type: Date,
      required: [true, "Date de planification requise"],
      validate: {
        validator: (v) => v > new Date(),
        message: "La date de planification doit être future",
      },
    },
    duration: {
      type: Number,
      required: [true, "Durée requise"],
      min: [15, "La durée doit être d'au moins 15 minutes"],
    },
    status: {
      type: String,
      enum: {
        values: SESSION_STATUSES,
        message: "Statut invalide",
      },
      required: [true, "Statut requis"],
    },
    // Session feedback and recording
    feedback: {
      type: String,
      trim: true,
      maxlength: [500, "Commentaires trop longs (max 500 caractères)"],
    },
    sessionRecording: {
      url: {
        type: String,
        trim: true,
        match: [
          /^https?:\/\/[^\s$.?#].[^\s]*$/,
          "URL d'enregistrement invalide",
        ],
      },
      duration: {
        type: Number,
        min: [0, "La durée de l'enregistrement ne peut pas être négative"],
      },
    },
    // Status flags
    premiumOnly: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// =============== INDEXES =================
TutoringSessionSchema.index({ tutorId: 1, scheduledAt: -1 });
TutoringSessionSchema.index({ studentId: 1, scheduledAt: -1 });
TutoringSessionSchema.index({ subjectId: 1 });
TutoringSessionSchema.index({ status: 1 });

// =============== MIDDLEWARE =============
/**
 * Pre-save middleware to validate references and tutor expertise.
 * @param {Function} next - Callback to proceed with save.
 */
TutoringSessionSchema.pre("save", async function (next) {
  try {
    // Validate tutor (PeerTutorProfile)
    const tutor = await mongoose
      .model("PeerTutorProfile")
      .findById(this.tutorId);
    if (!tutor) return next(new Error("Identifiant du tuteur invalide"));

    // Validate student (User)
    const student = await mongoose.model("User").findById(this.studentId);
    if (!student) return next(new Error("Identifiant de l'étudiant invalide"));

    // Validate subject
    const subject = await mongoose.model("Subject").findById(this.subjectId);
    if (!subject) return next(new Error("Identifiant de la matière invalide"));

    // Validate topic if provided
    if (this.topicId) {
      const topic = await mongoose.model("Topic").findById(this.topicId);
      if (!topic) return next(new Error("Identifiant du sujet invalide"));
    }

    // Ensure tutor is available and subject is in their expertise
    if (!tutor.subjects.includes(this.subjectId)) {
      return next(new Error("La matière n'est pas dans l'expertise du tuteur"));
    }

    // Validate premiumOnly
    if (this.premiumOnly && !tutor.premiumOnly) {
      return next(new Error("Session premium réservée aux tuteurs premium"));
    }

    next();
  } catch (error) {
    next(error);
  }
});

/**
 * TutoringSession model for interacting with the TutoringSession collection.
 * @type {mongoose.Model}
 */
module.exports = {
  TutoringSession: model("TutoringSession", TutoringSessionSchema),
};