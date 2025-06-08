const { Schema, model, Types } = require("mongoose");
const slugify = require("slugify");
const {
  EXAM_TYPES,
  EXAM_DIFFICULTIES,
  EXAM_FORMATS,
  ACCESSIBILITY_OPTIONS,
  IMPORTANT_DATE_TYPES,
  EXAM_SESSIONS,
} = require("../../constants");

// =============== CONSTANTS =============
/**
 * Imported constants for exam types, difficulties, formats, accessibility options, date types, and sessions.
 * @see module:constants/index
 */

// =============== SUBSCHEMAS =============
/**
 * Subschema for exam series.
 * @module SeriesSubSchema
 */
const SeriesSchema = new Schema({
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
    maxlength: [500, "La description ne peut pas dépasser 500 caractères"],
  },
  coefficient: {
    type: Number,
    default: 1,
    min: [1, "Le coefficient doit être au moins 1"],
    max: [10, "Le coefficient ne peut pas dépasser 10"],
  },
  duration: {
    type: Number,
    required: [true, "La durée est requise"],
    min: [15, "La durée doit être d'au moins 15 minutes"],
    max: [360, "La durée ne peut pas dépasser 360 minutes"],
  },
  totalMarks: {
    type: Number,
    required: [true, "Le total des notes est requis"],
    min: [10, "Le total des notes doit être d'au moins 10"],
    max: [200, "Le total des notes ne peut pas dépasser 200"],
  },
  passingMarks: {
    type: Number,
    required: [true, "La note de passage est requise"],
    min: [5, "La note de passage doit être d'au moins 5"],
    max: [100, "La note de passage ne peut pas dépasser 100"],
  },
  subjects: {
    type: [{ type: Types.ObjectId, ref: "Subject" }],
    default: [],
  },
});

/**
 * Subschema for important exam dates.
 * @module ImportantDateSubSchema
 */
const ImportantDateSchema = new Schema({
  type: {
    type: String,
    required: [true, "Le type de date est requis"],
    enum: IMPORTANT_DATE_TYPES,
  },
  date: {
    type: Date,
    required: [true, "La date est requise"],
  },
  description: {
    type: String,
    trim: true,
  },
});

/**
 * Subschema for exam centers.
 * @module ExamCenterSubSchema
 */
const ExamCenterSchema = new Schema({
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
    min: [1, "La capacité doit être d'au moins 1"],
  },
  contact: {
    phone: { type: String },
    email: { type: String },
  },
});

/**
 * Subschema for subject statistics within exam statistics.
 * @module SubjectStatisticSubSchema
 */
const SubjectStatisticSchema = new Schema({
  subject: {
    type: Types.ObjectId,
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
});

/**
 * Subschema for exam statistics.
 * @module StatisticSubSchema
 */
const StatisticSchema = new Schema({
  year: {
    type: Number,
    required: [true, "L'année est requise"],
    min: [2000, "L'année doit être d'au moins 2000"],
    max: [
      new Date().getFullYear() + 5,
      "L'année ne peut pas être trop dans le futur",
    ],
  },
  session: {
    type: String,
    required: [true, "La session est requise"],
    enum: EXAM_SESSIONS,
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
    max: [100, "Le taux de réussite ne peut pas dépasser 100"],
  },
  averageScore: {
    type: Number,
    min: [0, "Le score moyen ne peut pas être négatif"],
  },
  series: {
    type: String,
    trim: true,
  },
  subjectStatistics: {
    type: [SubjectStatisticSchema],
    default: [],
  },
});

// ==================== SCHEMA ==================
/**
 * Mongoose schema for exams, managing formal assessments and their metadata.
 * @module ExamSchema
 */
const ExamSchema = new Schema(
  {
    // Exam details
    name: {
      type: String,
      required: [true, "Le nom de l'examen est requis"],
      trim: true,
      maxlength: [200, "Le nom ne peut pas dépasser 200 caractères"],
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
    // Categorization
    examType: {
      type: String,
      enum: EXAM_TYPES,
      default: EXAM_TYPES[2], // test
    },
    difficulty: {
      type: String,
      enum: EXAM_DIFFICULTIES,
      default: EXAM_DIFFICULTIES[1], // moyen
    },
    country: {
      type: String,
      required: [true, "Le pays est requis"],
      trim: true,
    },
    levels: {
      type: [String],
      required: [true, "Au moins un niveau doit être spécifié"],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: "Au moins un niveau doit être spécifié",
      },
      default: [],
    },
    series: {
      type: [SeriesSchema],
      default: [],
    },
    curriculumId: {
      type: Types.ObjectId,
      ref: "Curriculum",
      required: [true, "Le curriculum est requis"],
    },
    examFormat: {
      type: String,
      enum: EXAM_FORMATS,
      required: [true, "Le format d'examen est requis"],
      default: EXAM_FORMATS[0], // papier
    },
    accessibilityOptions: {
      type: [String],
      enum: ACCESSIBILITY_OPTIONS,
      default: [],
    },
    // Scheduling
    importantDates: {
      type: [ImportantDateSchema],
      default: [],
    },
    // Registration
    registrationRequirements: {
      minimumAge: {
        type: Number,
        min: [10, "L'âge minimum doit être d'au moins 10 ans"],
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
    // Exam centers
    examCenters: {
      type: [ExamCenterSchema],
      default: [],
    },
    // Statistics
    statistics: {
      type: [StatisticSchema],
      default: [],
    },
    // Exam board
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
        phone: { type: String },
        email: { type: String },
        address: { type: String },
      },
    },
    // Language options
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
    // Metadata
    keywords: {
      type: [String],
      default: [],
    },
    popularity: {
      type: Number,
      default: 0,
      min: [0, "La popularité ne peut pas être négative"],
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: [0, "La note moyenne ne peut pas être négative"],
        max: [5, "La note moyenne ne peut pas dépasser 5"],
      },
      count: {
        type: Number,
        default: 0,
        min: [0, "Le nombre de notes ne peut pas être négatif"],
      },
    },
    metadata: {
      views: {
        type: Number,
        default: 0,
        min: [0, "Le nombre de vues ne peut pas être négatif"],
      },
      likes: {
        type: Number,
        default: 0,
        min: [0, "Le nombre de likes ne peut pas être négatif"],
      },
      shares: {
        type: Number,
        default: 0,
        min: [0, "Le nombre de partages ne peut pas être négatif"],
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// =============== INDEXES =================
ExamSchema.index({ slug: 1 }, { unique: true });
ExamSchema.index({ country: 1, levels: 1 });
ExamSchema.index({ examFormat: 1 });
ExamSchema.index({ curriculumId: 1 });
ExamSchema.index({ difficulty: 1 });
ExamSchema.index({ examType: 1 });
ExamSchema.index({ primaryLanguage: 1 });
ExamSchema.index({ "statistics.year": -1 });
ExamSchema.index({ keywords: 1 });
ExamSchema.index({ tags: 1 });
ExamSchema.index({ isActive: 1 });

// Text index for search
ExamSchema.index({
  name: "text",
  description: "text",
  country: "text",
  tags: "text",
  keywords: "text",
});

// =============== VIRTUALS =============
/**
 * Virtual field for the number of series in the exam.
 * @returns {number} Length of series array.
 */
ExamSchema.virtual("seriesCount").get(function () {
  return (this.series ?? []).length;
});

/**
 * Virtual field for the number of exam centers.
 * @returns {number} Length of examCenters array.
 */
ExamSchema.virtual("centersCount").get(function () {
  return (this.examCenters ?? []).length;
});

/**
 * Virtual field for formatted levels string.
 * @returns {string} Comma-separated levels.
 */
ExamSchema.virtual("formattedLevels").get(function () {
  return (this.levels ?? []).join(", ");
});

/**
 * Virtual field for the most recent statistics.
 * @returns {Object|null} Latest statistics object or null if none exist.
 */
ExamSchema.virtual("latestStatistics").get(function () {
  if (!(this.statistics ?? []).length) return null;
  return this.statistics.sort((a, b) => b.year - a.year)[0];
});

/**
 * Virtual field for upcoming important dates.
 * @returns {Object[]} Array of upcoming dates sorted chronologically.
 */
ExamSchema.virtual("upcomingDates").get(function () {
  const now = new Date();
  return (this.importantDates ?? [])
    .filter((dateInfo) => dateInfo.date > now)
    .sort((a, b) => a.date - b.date);
});

// =============== MIDDLEWARE =============
/**
 * Pre-save middleware to generate slug and ensure unique arrays.
 * @param {Function} next - Callback to proceed with save.
 */
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
  if (this.statistics?.length) {
    this.statistics.sort((a, b) => b.year - a.year);
  }

  // Sort important dates chronologically
  if (this.importantDates?.length) {
    this.importantDates.sort((a, b) => a.date - b.date);
  }

  next();
});

// =============== METHODS =============
/**
 * Adds a series to the exam.
 * @param {Object} seriesData - Series data to add.
 * @returns {Promise<Document>} Updated exam document.
 */
ExamSchema.methods.addSeries = function (seriesData) {
  this.series.push(seriesData);
  return this.save();
};

/**
 * Removes a series from the exam.
 * @param {string} seriesId - ID of the series to remove.
 * @returns {Promise<Document>} Updated exam document.
 */
ExamSchema.methods.removeSeries = function (seriesId) {
  this.series = this.series.filter((series) => series.id !== seriesId);
  return this.save();
};

/**
 * Adds an exam center to the exam.
 * @param {Object} centerData - Exam center data to add.
 * @returns {Promise<Document>} Updated exam document.
 */
ExamSchema.methods.addCenter = function (centerData) {
  this.examCenters.push(centerData);
  return this.save();
};

/**
 * Removes an exam center from the exam.
 * @param {string} centerId - ID of the exam center to remove.
 * @returns {Promise<Document>} Updated exam document.
 */
ExamSchema.methods.removeCenter = function (centerId) {
  this.examCenters = this.examCenters.filter(
    (center) => center.id !== centerId
  );
  return this.save();
};

/**
 * Adds statistics to the exam, replacing existing stats for the same year and series.
 * @param {Object} statsData - Statistics data to add.
 * @returns {Promise<Document>} Updated exam document.
 */
ExamSchema.methods.addStatistics = function (statsData) {
  // Remove existing stats for the same year and series if any
  this.statistics = this.statistics.filter(
    (stat) =>
      !(stat.year === statsData.year && stat.series === statsData.series)
  );
  this.statistics.push(statsData);
  return this.save();
};

// =============== STATICS =============
/**
 * Finds exams by country.
 * @param {string} country - Country name (case-insensitive).
 * @returns {Promise<Document[]>} Array of matching exam documents.
 */
ExamSchema.statics.findByCountry = function (country) {
  return this.find({
    country: { $regex: country, $options: "i" },
    isActive: true,
  });
};

/**
 * Finds exams by level.
 * @param {string} level - Education level.
 * @returns {Promise<Document[]>} Array of matching exam documents.
 */
ExamSchema.statics.findByLevel = function (level) {
  return this.find({ levels: { $in: [level] }, isActive: true });
};

/**
 * Finds exams by format.
 * @param {string} format - Exam format.
 * @returns {Promise<Document[]>} Array of matching exam documents.
 */
ExamSchema.statics.findByFormat = function (format) {
  return this.find({ examFormat: format, isActive: true });
};

/**
 * Finds exams with upcoming important dates.
 * @param {number} [days=30] - Number of days to look ahead.
 * @returns {Promise<Document[]>} Array of matching exam documents.
 */
ExamSchema.statics.findUpcoming = function (days = 30) {
  const futureDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return this.find({
    isActive: true,
    "importantDates.date": { $gte: new Date(), $lte: futureDate },
  });
};

/**
 * Aggregates exam statistics by country.
 * @returns {Promise<Object[]>} Array of aggregated statistics by country.
 */
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

/**
 * Exam model for interacting with the Exam collection.
 * @type {mongoose.Model}
 */
module.exports = {
  Exam: model("Exam", ExamSchema),
};
