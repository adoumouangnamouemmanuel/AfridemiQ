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
SubjectSchema.index({ isActive: 1 });
SubjectSchema.index({ popularity: -1 });
SubjectSchema.index({ "rating.average": -1 });
SubjectSchema.index({ createdAt: -1 });
SubjectSchema.index({ series: 1, category: 1 });
SubjectSchema.index({ tags: 1 });
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

// Static methods for advanced queries
SubjectSchema.statics.findBySeries = function (series) {
  return this.find({ series: { $in: [series] }, isActive: true });
};

SubjectSchema.statics.findByCategory = function (category) {
  return this.find({ category, isActive: true });
};

SubjectSchema.statics.findByDifficulty = function (difficulty) {
  return this.find({ difficulty, isActive: true });
};

SubjectSchema.statics.searchByText = function (searchTerm) {
  return this.find(
    {
      $text: { $search: searchTerm },
      isActive: true,
    },
    { score: { $meta: "textScore" } }
  ).sort({ score: { $meta: "textScore" } });
};

SubjectSchema.statics.findPopular = function (limit = 10) {
  return this.find({ isActive: true }).sort({ popularity: -1 }).limit(limit);
};

SubjectSchema.statics.findTopRated = function (limit = 10) {
  return this.find({ isActive: true, "rating.count": { $gte: 5 } })
    .sort({ "rating.average": -1 })
    .limit(limit);
};

SubjectSchema.statics.findRecentlyAdded = function (days = 30, limit = 10) {
  const dateThreshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return this.find({
    isActive: true,
    createdAt: { $gte: dateThreshold },
  })
    .sort({ createdAt: -1 })
    .limit(limit);
};

SubjectSchema.statics.getAdvancedStats = function () {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        totalSubjects: { $sum: 1 },
        avgRating: { $avg: "$rating.average" },
        avgPopularity: { $avg: "$popularity" },
        totalExams: { $sum: "$statistics.totalExams" },
        avgEstimatedHours: { $avg: "$estimatedHours" },
        categoriesCount: { $addToSet: "$category" },
        seriesCount: { $addToSet: "$series" },
      },
    },
    {
      $project: {
        _id: 0,
        totalSubjects: 1,
        avgRating: { $round: ["$avgRating", 2] },
        avgPopularity: { $round: ["$avgPopularity", 2] },
        totalExams: 1,
        avgEstimatedHours: { $round: ["$avgEstimatedHours", 2] },
        totalCategories: { $size: "$categoriesCount" },
        totalSeries: {
          $size: {
            $reduce: {
              input: "$seriesCount",
              initialValue: [],
              in: { $setUnion: ["$$value", "$$this"] },
            },
          },
        },
      },
    },
  ]);
};

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

module.exports = {
  Subject: mongoose.model("Subject", SubjectSchema),
};
