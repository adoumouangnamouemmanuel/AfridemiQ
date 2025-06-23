const { Schema, model, Types } = require("mongoose");
const { AVAILABILITY_DAYS } = require("../../constants");

// =============== CONSTANTS =============
/**
 * Imported constants for availability days.
 * @see module:constants
 */

// =============== SUBSCHEMAS =============
/**
 * Subschema for feedback entries on a tutor's profile.
 * @module FeedbackSubSchema
 */
const FeedbackSchema = new Schema({
  // User reference
  userId: {
    type: Types.ObjectId,
    ref: "User",
    required: [true, "Identifiant d'utilisateur requis"],
  },
  // Rating value
  rating: {
    type: Number,
    min: [0, "La note doit être au moins 0"],
    max: [10, "La note ne peut dépasser 10"],
    required: [true, "Note requise"],
  },
  // Optional comments
  comments: {
    type: String,
    trim: true,
    maxlength: [500, "Commentaires trop longs (max 500 caractères)"],
  },
  // Creation timestamp
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ==================== SCHEMA ==================
/**
 * Mongoose schema for peer tutor profiles, managing tutor qualifications and availability.
 * @module PeerTutorProfileSchema
 */
const PeerTutorProfileSchema = new Schema(
  {
    // Tutor profile details
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "Identifiant d'utilisateur requis"],
      unique: true,
    },
    subjects: {
      type: [{ type: Types.ObjectId, ref: "Subject" }],
      default: [],
      validate: {
        validator: (v) => v.length > 0,
        message: "Au moins une matière est requise",
      },
    },
    series: {
      type: [{ type: String, trim: true }],
      default: [],
      validate: {
        validator: (v) => v.every((s) => s.length >= 1),
        message: "Les séries ne peuvent pas être vides",
      },
    },
    topics: {
      type: [{ type: Types.ObjectId, ref: "Topic" }],
      default: [],
      validate: {
        validator: (v) => v.length > 0,
        message: "Au moins un sujet est requis",
      },
    },
    // Availability slots
    availability: [
      {
        day: {
          type: String,
          enum: {
            values: AVAILABILITY_DAYS,
            message: "Jour invalide",
          },
          required: [true, "Jour requis"],
        },
        startTime: {
          type: String,
          match: [
            /^([01]\d|2[0-3]):[0-5]\d$/,
            "Format d'heure de début invalide (HH:MM)",
          ],
          required: [true, "Heure de début requise"],
        },
        endTime: {
          type: String,
          match: [
            /^([01]\d|2[0-3]):[0-5]\d$/,
            "Format d'heure de fin invalide (HH:MM)",
          ],
          required: [true, "Heure de fin requise"],
        },
      },
    ],
    // Tutor biography
    bio: {
      type: String,
      trim: true,
      required: [true, "Biographie requise"],
      minlength: [10, "Biographie trop courte (min 10 caractères)"],
      maxlength: [500, "Biographie trop longue (max 500 caractères)"],
    },
    // Rating and reviews
    rating: {
      type: Number,
      default: 0,
      min: [0, "La note ne doit être au moins 0"],
      max: [10, "La note ne peut dépasser 10"],
    },
    reviews: {
      type: [FeedbackSchema],
      default: [],
    },
    // Status flags
    isAvailable: {
      type: Boolean,
      default: true,
    },
    premiumOnly: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// =============== INDEXES =================
PeerTutorProfileSchema.index({ subjects: 1 });
PeerTutorProfileSchema.index({ topics: 1 });

// =============== MIDDLEWARE ==========
/**
 * Pre-save middleware to validate references and compute rating.
 * @param {Function} next - Callback to proceed with save.
 */
PeerTutorProfileSchema.pre("save", async function (next) {
  try {
    // Validate user exists
    const user = await this.model("User").findById(this.userId);
    if (!user) return next(new Error("Identifiant d'utilisateur invalide"));

    // Validate subjects
    if (this.subjects.length > 0) {
      const subjects = await this.model("Subject").find({
        _id: { $in: this.subjects },
      });
      if (subjects.length !== this.subjects.length)
        return next(new Error("Une ou plusieurs matières invalides"));
    }

    // Validate topics
    if (this.topics.length > 0) {
      const topics = await this.model("Topic").find({
        _id: { $in: this.topics },
      });
      if (topics.length !== this.topics.length)
        return next(new Error("Un ou plusieurs sujets invalides"));
    }

    // Compute rating from reviews
    if (this.reviews.length > 0) {
      const totalRating = this.reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      this.rating = Math.round((totalRating / this.reviews.length) * 10) / 10;
    } else {
      this.rating = 0;
    }

    // Validate availability times
    for (const slot of this.availability) {
      const [startHour, startMin] = slot.startTime.split(":").map(Number);
      const [endHour, endMin] = slot.endTime.split(":").map(Number);
      const start = startHour * 60 + startMin;
      const end = endHour * 60 + endMin;
      if (end <= start)
        return next(
          new Error("L'heure de fin doit être postérieure à l'heure de début")
        );
    }

    next();
  } catch (error) {
    next(error);
  }
});

// =============== VIRTUALS =============
/**
 * Virtual field for the number of reviews.
 * @returns {number} Length of reviews array.
 */
PeerTutorProfileSchema.virtual("reviewCount").get(function () {
  return this.reviews?.length ?? 0;
});

/**
 * PeerTutorProfile model for interacting with the PeerTutorProfile collection.
 * @type {mongoose.Model}
 */
module.exports = {
  PeerTutorProfile: model("PeerTutorProfile", PeerTutorProfileSchema),
};