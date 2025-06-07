const { Schema, model, Types } = require("mongoose");
const { COUNTRY_REGIONS, EDUCATION_SYSTEMS } = require("../../constants");

// =============== CONSTANTS =============
/**
 * Imported constants for country regions and education systems.
 * @see module:constants
 */

// ==================== SCHEMA ==================
/**
 * Mongoose schema for countries, storing details like name, code, and education system.
 * @module CountrySchema
 */
const CountrySchema = new Schema(
  {
    // Country details
    name: {
      type: String,
      required: [true, "Le nom du pays est requis"],
      unique: true,
      trim: true,
      maxlength: [100, "Le nom du pays ne peut pas dépasser 100 caractères"],
      index: true,
    },
    code: {
      type: String,
      required: [true, "Le code du pays est requis"],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [2, "Le code du pays doit avoir au moins 2 caractères"],
      maxlength: [3, "Le code du pays ne peut pas dépasser 3 caractères"],
      index: true,
    },
    flag: {
      type: String,
      required: [true, "Le drapeau est requis"],
      trim: true,
    },
    // Supported exams
    supportedExams: [
      {
        type: Types.ObjectId,
        ref: "Exam",
        required: [true, "L'ID de l'examen est requis"],
      },
    ],
    // Language details
    languages: {
      type: [String],
      required: [true, "Au moins une langue doit être spécifiée"],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: "Au moins une langue doit être spécifiée",
      },
    },
    currency: {
      type: String,
      trim: true,
      maxlength: [10, "La devise ne peut pas dépasser 10 caractères"],
    },
    timezone: {
      type: String,
      trim: true,
      maxlength: [50, "Le fuseau horaire ne peut pas dépasser 50 caractères"],
    },
    // Regional and educational details
    region: {
      type: String,
      enum: COUNTRY_REGIONS,
      required: [true, "La région est requise"],
      index: true,
    },
    capital: {
      type: String,
      trim: true,
      maxlength: [100, "La capitale ne peut pas dépasser 100 caractères"],
    },
    population: {
      type: Number,
      min: [0, "La population ne peut pas être négative"],
    },
    educationSystem: {
      type: String,
      enum: EDUCATION_SYSTEMS,
      required: [true, "Le système éducatif est requis"],
      index: true,
    },
    // Exam board details
    examBoards: [
      {
        name: {
          type: String,
          required: [true, "Le nom du conseil d'examen est requis"],
          trim: true,
        },
        description: {
          type: String,
          trim: true,
        },
        website: {
          type: String,
          trim: true,
        },
      },
    ],
    // Status and statistics
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    statistics: {
      totalUsers: {
        type: Number,
        default: 0,
        min: [0, "Le nombre total d'utilisateurs ne peut pas être négatif"],
      },
      totalExams: {
        type: Number,
        default: 0,
        min: [0, "Le nombre total d'examens ne peut pas être négatif"],
      },
      totalSubjects: {
        type: Number,
        default: 0,
        min: [0, "Le nombre total de sujets ne peut pas être négatif"],
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// =============== INDEXES =================
CountrySchema.index({ region: 1, educationSystem: 1 });
CountrySchema.index({ supportedExams: 1 }, { sparse: true });
CountrySchema.index({
  name: "text",
  capital: "text",
  languages: "text",
});

// =============== VIRTUALS =============
/**
 * Virtual field for the number of supported exams.
 * @returns {number} Length of supportedExams array.
 */
CountrySchema.virtual("examCount").get(function () {
  return this.supportedExams?.length ?? 0;
});

/**
 * Virtual field for the number of languages.
 * @returns {number} Length of languages array.
 */
CountrySchema.virtual("languageCount").get(function () {
  return this.languages?.length ?? 0;
});

/**
 * Virtual field for a comma-separated list of languages.
 * @returns {string} Joined languages string or empty string.
 */
CountrySchema.virtual("formattedLanguages").get(function () {
  return this.languages?.join(", ") ?? "";
});

/**
 * Virtual field for the number of exam boards.
 * @returns {number} Length of examBoards array.
 */
CountrySchema.virtual("examBoardCount").get(function () {
  return this.examBoards?.length ?? 0;
});

// =============== MIDDLEWARE =============
/**
 * Pre-save middleware to ensure unique languages and update statistics.
 * @param {Function} next - Callback to proceed with save.
 */
CountrySchema.pre("save", function (next) {
  // Ensure languages array has unique values
  if (this.languages) {
    this.languages = [...new Set(this.languages)];
  }

  // Update statistics
  if (this.supportedExams) {
    this.statistics.totalExams = this.supportedExams.length;
  }

  next();
});

// =============== STATIC METHODS =============
/**
 * Find active countries by region.
 * @param {string} region - The region to filter by.
 * @returns {Promise} Query for matching countries.
 */
CountrySchema.statics.findByRegion = function (region) {
  return this.find({ region, isActive: true });
};

/**
 * Find active countries by education system.
 * @param {string} educationSystem - The education system to filter by.
 * @returns {Promise} Query for matching countries.
 */
CountrySchema.statics.findByEducationSystem = function (educationSystem) {
  return this.find({ educationSystem, isActive: true });
};

/**
 * Find active countries by language.
 * @param {string} language - The language to filter by.
 * @returns {Promise} Query for matching countries.
 */
CountrySchema.statics.findByLanguage = function (language) {
  return this.find({ languages: { $in: [language] }, isActive: true });
};

/**
 * Aggregate statistics by region for active countries.
 * @returns {Promise} Aggregation result with region stats.
 */
CountrySchema.statics.getRegionStats = function () {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: "$region",
        count: { $sum: 1 },
        totalUsers: { $sum: "$statistics.totalUsers" },
        totalExams: { $sum: "$statistics.totalExams" },
        countries: { $push: "$name" },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

/**
 * Aggregate statistics by education system for active countries.
 * @returns {Promise} Aggregation result with education system stats.
 */
CountrySchema.statics.getEducationSystemStats = function () {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: "$educationSystem",
        count: { $sum: 1 },
        totalUsers: { $sum: "$statistics.totalUsers" },
        countries: { $push: "$name" },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

// =============== INSTANCE METHODS =============
/**
 * Add an exam to the country's supported exams.
 * @param {Types.ObjectId} examId - The ID of the exam to add.
 * @returns {Promise} Updated country document.
 */
CountrySchema.methods.addExam = function (examId) {
  if (!this.supportedExams.includes(examId)) {
    this.supportedExams.push(examId);
    this.statistics.totalExams = this.supportedExams.length;
  }
  return this.save();
};

/**
 * Remove an exam from the country's supported exams.
 * @param {Types.ObjectId} examId - The ID of the exam to remove.
 * @returns {Promise} Updated country document.
 */
CountrySchema.methods.removeExam = function (examId) {
  this.supportedExams = this.supportedExams.filter(
    (id) => id.toString() !== examId.toString()
  );
  this.statistics.totalExams = this.supportedExams.length;
  return this.save();
};

/**
 * Update country statistics.
 * @param {number} [userCount] - New user count.
 * @param {number} [examCount] - New exam count.
 * @param {number} [subjectCount] - New subject count.
 * @returns {Promise} Updated country document.
 */
CountrySchema.methods.updateStatistics = function (
  userCount,
  examCount,
  subjectCount
) {
  this.statistics.totalUsers = userCount ?? this.statistics.totalUsers;
  this.statistics.totalExams = examCount ?? this.statistics.totalExams;
  this.statistics.totalSubjects = subjectCount ?? this.statistics.totalSubjects;
  return this.save();
};

/**
 * Country model for interacting with the Country collection.
 * @type {mongoose.Model}
 */
module.exports = {
  Country: model("Country", CountrySchema),
};
