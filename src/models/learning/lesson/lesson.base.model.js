const mongoose = require("mongoose");
const { Schema } = mongoose;

// Shared constants
const INTERACTIVITY_LEVELS = ["low", "medium", "high"];

// Shared Feedback Subschema
const FeedbackSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Identifiant d'utilisateur requis"],
  },
  rating: {
    type: Number,
    min: [0, "La note doit être au moins 0"],
    max: [10, "La note ne peut dépasser 10"],
    required: [true, "Note requise"],
  },
  comments: {
    type: String,
    trim: true,
    maxlength: [500, "Commentaires trop longs (max 500 caractères)"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Lesson Base Schema
const LessonBaseSchema = new Schema(
  {
    topicId: {
      type: Schema.Types.ObjectId,
      ref: "Topic",
      required: [true, "Identifiant du sujet requis"],
    },
    title: {
      type: String,
      trim: true,
      required: [true, "Titre requis"],
      minlength: [3, "Titre trop court (min 3 caractères)"],
      maxlength: [100, "Titre trop long (max 100 caractères)"],
    },
    series: {
      type: [{ type: String, trim: true }],
      validate: {
        validator: (v) => v.every((s) => s.length >= 1),
        message: "Les séries ne peuvent pas être vides",
      },
    },
    overview: {
      type: String,
      trim: true,
      maxlength: [1000, "Résumé trop long (max 1000 caractères)"],
    },
    objectives: {
      type: [{ type: String, trim: true }],
      validate: {
        validator: (v) => v.every((o) => o.length >= 1),
        message: "Les objectifs ne peuvent pas être vides",
      },
    },
    keyPoints: {
      type: [{ type: String, trim: true }],
      validate: {
        validator: (v) => v.every((k) => k.length >= 1),
        message: "Les points clés ne peuvent pas être vides",
      },
    },
    duration: {
      type: Number,
      required: [true, "Durée requise"],
      min: [5, "La durée doit être d'au moins 5 minutes"],
    },
    resourceIds: [{ type: Schema.Types.ObjectId, ref: "Resource" }],
    exerciseIds: [{ type: Schema.Types.ObjectId, ref: "Exercise" }],
    interactivityLevel: {
      type: String,
      enum: {
        values: INTERACTIVITY_LEVELS,
        message: "Niveau d'interactivité invalide",
      },
      required: [true, "Niveau d'interactivité requis"],
    },
    offlineAvailable: {
      type: Boolean,
      default: false,
    },
    premiumOnly: {
      type: Boolean,
      default: false,
    },
    feedback: [FeedbackSchema],
    metadata: {
      createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Créateur requis"],
      },
      updatedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    },
  },
  {
    timestamps: true,
    discriminatorKey: "subjectType",
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
LessonBaseSchema.index({ topicId: 1 });
LessonBaseSchema.index({ resourceIds: 1 });
LessonBaseSchema.index({ exerciseIds: 1 });

// Pre-save hook for validation
LessonBaseSchema.pre("save", async function (next) {
  try {
    // Validate topic
    const topic = await mongoose.model("Topic").findById(this.topicId);
    if (!topic) return next(new Error("Identifiant du sujet invalide"));

    // Validate resources
    if (this.resourceIds.length > 0) {
      const validResources = await mongoose
        .model("Resource")
        .countDocuments({ _id: { $in: this.resourceIds } });
      if (validResources !== this.resourceIds.length)
        return next(new Error("Identifiants de ressources invalides"));
    }

    // Validate exercises
    if (this.exerciseIds.length > 0) {
      const validExercises = await mongoose
        .model("Exercise")
        .countDocuments({ _id: { $in: this.exerciseIds } });
      if (validExercises !== this.exerciseIds.length)
        return next(new Error("Identifiants d'exercices invalides"));
    }

    // Validate users
    const user = await mongoose.model("User").findById(this.metadata.createdBy);
    if (!user) return next(new Error("Identifiant du créateur invalide"));
    if (this.metadata.updatedBy) {
      const updatedUser = await mongoose
        .model("User")
        .findById(this.metadata.updatedBy);
      if (!updatedUser)
        return next(new Error("Identifiant du modificateur invalide"));
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Virtual for completion status
LessonBaseSchema.virtual("completionStatus").get(function () {
  // Example logic based on progress tracking
  if (!this.progressTracking) return "not_started";
  const completion = this.progressTracking.completionRate;
  if (completion >= 100) return "completed";
  if (completion > 0) return "in_progress";
  return "not_started";
});

module.exports = {
  Lesson: mongoose.model("Lesson", LessonBaseSchema),
};