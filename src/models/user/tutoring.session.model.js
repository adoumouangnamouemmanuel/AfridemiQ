const mongoose = require("mongoose");
const { Schema } = mongoose;

const TutoringSessionSchema = new Schema(
  {
    tutorId: {
      type: Schema.Types.ObjectId,
      ref: "PeerTutorProfile",
      required: [true, "Identifiant du tuteur requis"],
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Identifiant de l'étudiant requis"],
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: [true, "Identifiant de la matière requis"],
    },
    series: {
      type: [{ type: String, trim: true }],
      validate: {
        validator: (v) => v.every((s) => s.length >= 1),
        message: "Les séries ne peuvent pas être vides",
      },
    },
    topicId: {
      type: Schema.Types.ObjectId,
      ref: "Topic",
    },
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
        values: ["scheduled", "completed", "cancelled"],
        message: "Statut invalide",
      },
      required: [true, "Statut requis"],
    },
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
    premiumOnly: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes for efficient querying
TutoringSessionSchema.index({ tutorId: 1, scheduledAt: -1 });
TutoringSessionSchema.index({ studentId: 1, scheduledAt: -1 });
TutoringSessionSchema.index({ subjectId: 1 });
TutoringSessionSchema.index({ status: 1 });

// Pre-save hook to validate references
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

module.exports = {
  TutoringSession: mongoose.model("TutoringSession", TutoringSessionSchema),
};