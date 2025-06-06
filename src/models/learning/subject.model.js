const mongoose = require("mongoose");
const { Schema } = mongoose;

// Subject Schema with enhanced features
const SubjectSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Le nom de la matière est requis"],
      trim: true,
      maxlength: [100, "Le nom ne peut pas dépasser 100 caractères"],
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    icon: {
      type: String,
      required: [true, "L'icône est requise"],
      trim: true,
    },
    color: {
      type: String,
      required: [true, "La couleur est requise"],
      validate: {
        validator: (v) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v),
        message: (props) =>
          `${props.value} n'est pas un code couleur hexadécimal valide!`,
      },
    },
    description: {
      type: String,
      required: [true, "La description est requise"],
      trim: true,
      maxlength: [500, "La description ne peut pas dépasser 500 caractères"],
    },
    longDescription: {
      type: String,
      maxlength: [
        2000,
        "La description longue ne peut pas dépasser 2000 caractères",
      ],
    },
    examIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Exam",
        default: [],
      },
    ],
    series: {
      type: [String],
      default: [],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: "Au moins une série doit être spécifiée",
      },
      index: true,
    },
    category: {
      type: String,
      enum: [
        "sciences",
        "litterature",
        "langues",
        "mathematiques",
        "sciences-sociales",
        "arts",
        "technologie",
      ],
      required: true,
      index: true,
    },
    subcategory: {
      type: String,
      maxlength: [50, "La sous-catégorie ne peut pas dépasser 50 caractères"],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ["facile", "moyen", "difficile"],
      default: "moyen",
      index: true,
    },
    estimatedHours: {
      type: Number,
      min: [1, "Le nombre d'heures doit être au moins 1"],
      max: [1000, "Le nombre d'heures ne peut pas dépasser 1000"],
    },
    tags: {
      type: [String],
      index: true,
    },
    keywords: [String], // For search optimization
    popularity: {
      type: Number,
      default: 0,
      index: true,
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    statistics: {
      totalStudents: {
        type: Number,
        default: 0,
      },
      totalExams: {
        type: Number,
        default: 0,
      },
      averageScore: {
        type: Number,
        default: 0,
      },
      completionRate: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for performance
SubjectSchema.index({ name: 1, series: 1 }, { unique: true });
SubjectSchema.index({ category: 1, difficulty: 1 });
SubjectSchema.index({ popularity: -1 });
SubjectSchema.index({ "rating.average": -1 });
SubjectSchema.index({ series: 1, category: 1 });
// SubjectSchema.index({ tags: 1 });
SubjectSchema.index({ keywords: 1 });

// Text index for search
SubjectSchema.index({
  name: "text",
  description: "text",
  longDescription: "text",
  tags: "text",
  keywords: "text",
});

// Virtual fields
SubjectSchema.virtual("examCount").get(function () {
  return this.examIds ? this.examIds.length : 0;
});

SubjectSchema.virtual("formattedSeries").get(function () {
  return this.series ? this.series.join(", ") : "";
});

SubjectSchema.virtual("isPopular").get(function () {
  return this.popularity > 100;
});

SubjectSchema.virtual("difficultyLevel").get(function () {
  const levels = { facile: 1, moyen: 2, difficile: 3 };
  return levels[this.difficulty] || 2;
});

SubjectSchema.virtual("completionPercentage").get(function () {
  return Math.round(this.statistics.completionRate * 100);
});

// Pre-save middleware
SubjectSchema.pre("save", function (next) {
  // Generate slug from name
  if (this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  // Ensure series array has unique values
  if (this.series) {
    this.series = [...new Set(this.series)];
  }

  // Ensure tags array has unique values
  if (this.tags) {
    this.tags = [...new Set(this.tags.map((tag) => tag.toLowerCase()))];
  }

  // Update statistics
  if (this.examIds) {
    this.statistics.totalExams = this.examIds.length;
  }

  next();
});

// Instance methods
SubjectSchema.methods.incrementPopularity = function (amount = 1) {
  this.popularity += amount;
  return this.save();
};

SubjectSchema.methods.updateRating = function (newRating) {
  const currentTotal = this.rating.average * this.rating.count;
  this.rating.count += 1;
  this.rating.average = (currentTotal + newRating) / this.rating.count;
  return this.save();
};

const Subject = mongoose.model("Subject", SubjectSchema);

module.exports = { Subject };