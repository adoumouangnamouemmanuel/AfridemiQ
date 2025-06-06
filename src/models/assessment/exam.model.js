const mongoose = require("mongoose");
const slugify = require("slugify");
const { Schema } = mongoose;

const ExamSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Le nom de l'examen est requis"],
      trim: true,
      maxlength: [200, "Le nom ne peut pas dépasser 200 caractères"],
      index: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      required: [true, "La description est requise"],
      trim: true,
      maxlength: [1000, "La description ne peut pas dépasser 1000 caractères"],
    },
    longDescription: {
      type: String,
      trim: true,
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
    examType: {
      type: String,
      enum: ["certification", "concours", "test", "autre"],
      default: "test",
      index: true,
    },
    difficulty: {
      type: String,
      enum: ["facile", "moyen", "difficile", "expert"],
      default: "moyen",
      index: true,
    },
    country: {
      type: String,
      required: [true, "Le pays est requis"],
      trim: true,
      index: true,
    },
    levels: {
      type: [String],
      required: [true, "Au moins un niveau doit être spécifié"],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: "Au moins un niveau doit être spécifié",
      },
    },
    series: [
      {
        id: {
          type: String,
          required: [true, "L'ID de la série est requis"],
        },
        name: {
          type: String,
          required: [true, "Le nom de la série est requis"],
          trim: true,
        },
        description: {
          type: String,
          trim: true,
          maxlength: [
            500,
            "La description ne peut pas dépasser 500 caractères",
          ],
        },
        coefficient: {
          type: Number,
          default: 1,
          min: 1,
          max: 10,
        },
        duration: {
          type: Number,
          required: [true, "La durée est requise"],
          min: 15,
          max: 360,
        },
        totalMarks: {
          type: Number,
          required: [true, "Le total des notes est requis"],
          min: 10,
          max: 200,
        },
        passingMarks: {
          type: Number,
          required: [true, "La note de passage est requise"],
          min: 5,
          max: 100,
        },
        subjects: [
          {
            type: Schema.Types.ObjectId,
            ref: "Subject",
          },
        ],
      },
    ],
    curriculumId: {
      type: Schema.Types.ObjectId,
      ref: "Curriculum",
      required: [true, "Le curriculum est requis"],
      index: true,
    },
    examFormat: {
      type: String,
      enum: ["papier", "ordinateur", "hybride"],
      required: [true, "Le format d'examen est requis"],
      default: "papier",
      index: true,
    },
    accessibilityOptions: {
      type: [String],
      default: [],
      enum: [
        "braille",
        "gros_caracteres",
        "temps_supplementaire",
        "aide_technique",
        "salle_separee",
      ],
    },
    importantDates: [
      {
        type: {
          type: String,
          required: [true, "Le type de date est requis"],
          enum: ["inscription", "examen", "resultats", "rattrapage"],
        },
        date: {
          type: Date,
          required: [true, "La date est requise"],
        },
        description: {
          type: String,
          trim: true,
        },
      },
    ],
    registrationRequirements: {
      minimumAge: {
        type: Number,
        min: [10, "L'âge minimum doit être au moins 10 ans"],
        max: [100, "L'âge minimum ne peut pas dépasser 100 ans"],
      },
      requiredDocuments: {
        type: [String],
        default: [],
      },
      fees: {
        amount: {
          type: Number,
          min: [0, "Le montant ne peut pas être négatif"],
        },
        currency: {
          type: String,
          trim: true,
          maxlength: [10, "La devise ne peut pas dépasser 10 caractères"],
        },
      },
    },
    examCenters: [
      {
        id: {
          type: String,
          required: [true, "L'ID du centre est requis"],
        },
        name: {
          type: String,
          required: [true, "Le nom du centre est requis"],
          trim: true,
        },
        location: {
          address: {
            type: String,
            required: [true, "L'adresse est requise"],
            trim: true,
          },
          city: {
            type: String,
            required: [true, "La ville est requise"],
            trim: true,
          },
          country: {
            type: String,
            required: [true, "Le pays est requis"],
            trim: true,
          },
          postalCode: {
            type: String,
            trim: true,
          },
        },
        capacity: {
          type: Number,
          min: [1, "La capacité doit être au moins 1"],
        },
        contact: {
          phone: String,
          email: String,
        },
      },
    ],
    statistics: [
      {
        year: {
          type: Number,
          required: [true, "L'année est requise"],
          min: [2000, "L'année doit être au moins 2000"],
          max: [
            new Date().getFullYear() + 5,
            "L'année ne peut pas être trop dans le futur",
          ],
        },
        session: {
          type: String,
          required: [true, "La session est requise"],
          enum: ["janvier", "juin", "septembre", "decembre"],
        },
        totalCandidates: {
          type: Number,
          min: [0, "Le nombre de candidats ne peut pas être négatif"],
        },
        totalPassed: {
          type: Number,
          min: [0, "Le nombre de candidats ne peut pas être négatif"],
        },
        passRate: {
          type: Number,
          min: [0, "Le taux de réussite ne peut pas être négatif"],
          max: [100, "Le taux de réussite ne peut pas dépasser 100%"],
        },
        averageScore: {
          type: Number,
          min: [0, "Le score moyen ne peut pas être négatif"],
        },
        series: {
          type: String,
          trim: true,
        },
        subjectStatistics: [
          {
            subject: {
              type: Schema.Types.ObjectId,
              ref: "Subject",
            },
            averageScore: {
              type: Number,
              min: [0, "Le score moyen ne peut pas être négatif"],
            },
            highestScore: {
              type: Number,
              min: [0, "Le score le plus élevé ne peut pas être négatif"],
            },
            lowestScore: {
              type: Number,
              min: [0, "Le score le plus bas ne peut pas être négatif"],
            },
          },
        ],
      },
    ],
    examBoard: {
      name: {
        type: String,
        trim: true,
        maxlength: [
          100,
          "Le nom du conseil d'examen ne peut pas dépasser 100 caractères",
        ],
      },
      website: {
        type: String,
        trim: true,
      },
      contact: {
        phone: String,
        email: String,
        address: String,
      },
    },
    language: {
      type: String,
      trim: true,
    },
    primaryLanguage: {
      type: String,
      required: [true, "La langue principale est requise"],
      trim: true,
    },
    alternativeLanguages: {
      type: [String],
      default: [],
    },
    keywords: {
      type: [String],
      default: [],
      index: true,
    },
    popularity: {
      type: Number,
      default: 0,
      min: 0,
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
        min: 0,
      },
    },
    metadata: {
      views: {
        type: Number,
        default: 0,
        min: 0,
      },
      likes: {
        type: Number,
        default: 0,
        min: 0,
      },
      shares: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
ExamSchema.index({ country: 1, levels: 1 });
ExamSchema.index({ examFormat: 1 });
ExamSchema.index({ curriculumId: 1 });
ExamSchema.index({ primaryLanguage: 1 });
ExamSchema.index({ "statistics.year": -1 });
ExamSchema.index({ difficulty: 1 });
ExamSchema.index({ examType: 1 });

// Text index for search
ExamSchema.index({
  name: "text",
  description: "text",
  country: "text",
  tags: "text",
  keywords: "text",
});

// Virtual fields
ExamSchema.virtual("seriesCount").get(function () {
  return this.series ? this.series.length : 0;
});

ExamSchema.virtual("centersCount").get(function () {
  return this.examCenters ? this.examCenters.length : 0;
});

ExamSchema.virtual("formattedLevels").get(function () {
  return this.levels ? this.levels.join(", ") : "";
});

ExamSchema.virtual("latestStatistics").get(function () {
  if (!this.statistics || this.statistics.length === 0) return null;
  return this.statistics.sort((a, b) => b.year - a.year)[0];
});

ExamSchema.virtual("upcomingDates").get(function () {
  if (!this.importantDates) return [];
  const now = new Date();
  return this.importantDates
    .filter((dateInfo) => dateInfo.date > now)
    .sort((a, b) => a.date - b.date);
});

// Pre-save middleware
ExamSchema.pre("save", function (next) {
  // Generate slug before saving
  this.slug = slugify(this.name, { lower: true, replacement: "-" });

  // Ensure levels array has unique values
  if (this.levels) {
    this.levels = [...new Set(this.levels)];
  }

  // Ensure tags array has unique values
  if (this.tags) {
    this.tags = [...new Set(this.tags.map((tag) => tag.toLowerCase()))];
  }

  // Ensure alternative languages array has unique values
  if (this.alternativeLanguages) {
    this.alternativeLanguages = [...new Set(this.alternativeLanguages)];
  }

  // Sort statistics by year (most recent first)
  if (this.statistics && this.statistics.length > 0) {
    this.statistics.sort((a, b) => b.year - a.year);
  }

  // Sort important dates chronologically
  if (this.importantDates && this.importantDates.length > 0) {
    this.importantDates.sort((a, b) => a.date - b.date);
  }

  next();
});

// Static methods
ExamSchema.statics.findByCountry = function (country) {
  return this.find({
    country: { $regex: country, $options: "i" },
    isActive: true,
  });
};

ExamSchema.statics.findByLevel = function (level) {
  return this.find({ levels: { $in: [level] }, isActive: true });
};

ExamSchema.statics.findByFormat = function (format) {
  return this.find({ examFormat: format, isActive: true });
};

ExamSchema.statics.findUpcoming = function (days = 30) {
  const futureDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return this.find({
    isActive: true,
    "importantDates.date": { $gte: new Date(), $lte: futureDate },
  });
};

ExamSchema.statics.getStatsByCountry = function () {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: "$country",
        totalExams: { $sum: 1 },
        examFormats: { $addToSet: "$examFormat" },
        totalSeries: { $sum: { $size: "$series" } },
        totalCenters: { $sum: { $size: "$examCenters" } },
      },
    },
    { $sort: { totalExams: -1 } },
  ]);
};

// Instance methods
ExamSchema.methods.addSeries = function (seriesData) {
  this.series.push(seriesData);
  return this.save();
};

ExamSchema.methods.removeSeries = function (seriesId) {
  this.series = this.series.filter((series) => series.id !== seriesId);
  return this.save();
};

ExamSchema.methods.addCenter = function (centerData) {
  this.examCenters.push(centerData);
  return this.save();
};

ExamSchema.methods.removeCenter = function (centerId) {
  this.examCenters = this.examCenters.filter(
    (center) => center.id !== centerId
  );
  return this.save();
};

ExamSchema.methods.addStatistics = function (statsData) {
  // Remove existing stats for the same year and series if any
  this.statistics = this.statistics.filter(
    (stat) =>
      !(stat.year === statsData.year && stat.series === statsData.series)
  );
  this.statistics.push(statsData);
  return this.save();
};

const Exam = mongoose.model("Exam", ExamSchema);

module.exports = { Exam };