const { Schema, model, Types } = require("mongoose");
const {
  CURRICULUM_EDUCATION_LEVELS,
  CURRICULUM_STATUSES,
  ACADEMIC_TERMS,
} = require("../../constants");

// =============== CONSTANTS =============
/**
 * Imported constants for curriculum education levels and statuses.
 * @see module:constants/index
 */

// =============== SUBSCHEMAS =============
/**
 * Subschema for holiday periods within academic terms.
 * @module HolidaySubSchema
 */
const HolidaySchema = new Schema({
  name: {
    type: String,
    required: [true, "Le nom de la période de vacances est requis"],
    trim: true,
    maxlength: [100, "Le nom ne peut pas dépasser 100 caractères"],
  },
  startDate: {
    type: Date,
    required: [true, "La date de début des vacances est requise"],
  },
  endDate: {
    type: Date,
    required: [true, "La date de fin des vacances est requise"],
  },
});

/**
 * Subschema for academic terms within the academic year.
 * @module TermSubSchema
 */
const TermSchema = new Schema({
  term: {
    type: Number,
    required: [true, "Le numéro du trimestre est requis"],
    enum: {
      values: ACADEMIC_TERMS,
      message: "Le trimestre doit être entre 1 et 4",
    },
  },
  startDate: {
    type: Date,
    required: [true, "La date de début du trimestre est requise"],
  },
  endDate: {
    type: Date,
    required: [true, "La date de fin du trimestre est requise"],
  },
  holidays: {
    type: [HolidaySchema],
    default: [],
    validate: {
      validator: function (arr) {
        return arr.length <= 10;
      },
      message: "Trop de périodes de vacances par trimestre (maximum 10)",
    },
  },
});

/**
 * Subschema for academic year configuration.
 * @module AcademicYearSubSchema
 */
const AcademicYearSchema = new Schema({
  startDate: {
    type: Date,
    required: [true, "La date de début de l'année académique est requise"],
  },
  endDate: {
    type: Date,
    required: [true, "La date de fin de l'année académique est requise"],
  },
  terms: {
    type: [TermSchema],
    default: [],
    validate: {
      validator: function (arr) {
        return arr.length <= 4;
      },
      message: "Maximum 4 trimestres par année académique",
    },
  },
});

/**
 * Subschema for curriculum metadata and tracking.
 * @module CurriculumMetadataSubSchema
 */
const CurriculumMetadataSchema = new Schema({
  version: {
    type: Number,
    default: 1,
    min: [1, "La version doit être au moins 1"],
  },
  lastModified: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: {
      values: CURRICULUM_STATUSES,
      message: "{VALUE} n'est pas un statut valide",
    },
    default: "draft",
  },
  approvedBy: {
    type: Types.ObjectId,
    ref: "User",
  },
  approvedAt: {
    type: Date,
  },
  reviewNotes: {
    type: String,
    maxlength: [500, "Les notes de révision ne peuvent pas dépasser 500 caractères"],
  },
});

// ==================== SCHEMA ==================
/**
 * Mongoose schema for curriculum, organizing educational content by country and level.
 * @module CurriculumSchema
 */
const CurriculumSchema = new Schema(
  {
    // Curriculum identification
    country: {
      type: String,
      required: [true, "Le pays est requis"],
      trim: true,
      index: true,
      maxlength: [100, "Le nom du pays ne peut pas dépasser 100 caractères"],
    },
    educationLevel: {
      type: String,
      required: [true, "Le niveau d'éducation est requis"],
      enum: {
        values: CURRICULUM_EDUCATION_LEVELS,
        message: "{VALUE} n'est pas un niveau d'éducation valide",
      },
      index: true,
    },
    series: {
      type: [String],
      default: ["D"],
      index: true,
      validate: {
        validator: function (arr) {
          return arr.every((s) => s && s.trim().length > 0);
        },
        message: "Toutes les séries doivent avoir au moins 1 caractère",
      },
    },
    // Curriculum content
    subjects: {
      type: [{ type: Types.ObjectId, ref: "Subject" }],
      required: [true, "Au moins une matière est requise"],
      validate: {
        validator: function (arr) {
          return arr && arr.length > 0;
        },
        message: "Au moins une matière doit être associée",
      },
    },
    // Academic year configuration
    academicYear: {
      type: AcademicYearSchema,
      required: [true, "L'année académique est requise"],
    },
    // Curriculum settings
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    // Curriculum metadata
    metadata: {
      type: CurriculumMetadataSchema,
      default: () => ({}),
    },
    // Creation and management
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "Le créateur est requis"],
      index: true,
    },
    updatedBy: {
      type: Types.ObjectId,
      ref: "User",
    },
    // Analytics
    analytics: {
      enrollmentCount: {
        type: Number,
        default: 0,
        min: [0, "Le nombre d'inscriptions ne peut pas être négatif"],
      },
      activeUsers: {
        type: Number,
        default: 0,
        min: [0, "Le nombre d'utilisateurs actifs ne peut pas être négatif"],
      },
      completionRate: {
        type: Number,
        default: 0,
        min: [0, "Le taux de complétion ne peut pas être négatif"],
        max: [100, "Le taux de complétion ne peut pas dépasser 100"],
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
CurriculumSchema.index({ country: 1, educationLevel: 1, "academicYear.startDate": 1 });
CurriculumSchema.index({ series: 1, isActive: 1 });
CurriculumSchema.index({ "metadata.status": 1 });
CurriculumSchema.index({ createdBy: 1, updatedBy: 1 });
CurriculumSchema.index({ "academicYear.terms.startDate": 1 }, { sparse: true });
CurriculumSchema.index({ "analytics.enrollmentCount": -1 }, { sparse: true });

// =============== VIRTUALS =============
/**
 * Virtual field for total number of subjects.
 * @returns {number} Number of subjects in the curriculum.
 */
CurriculumSchema.virtual("subjectsCount").get(function () {
  return (this.subjects ?? []).length;
});

/**
 * Virtual field for academic year duration in days.
 * @returns {number} Academic year duration in days.
 */
CurriculumSchema.virtual("academicYearDuration").get(function () {
  if (!this.academicYear?.startDate || !this.academicYear?.endDate) return 0;
  const diffTime = Math.abs(this.academicYear.endDate - this.academicYear.startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

/**
 * Virtual field for total number of terms.
 * @returns {number} Number of terms in the academic year.
 */
CurriculumSchema.virtual("totalTerms").get(function () {
  return (this.academicYear?.terms ?? []).length;
});

/**
 * Virtual field for total number of holidays across all terms.
 * @returns {number} Total number of holiday periods.
 */
CurriculumSchema.virtual("totalHolidays").get(function () {
  return (this.academicYear?.terms ?? []).reduce((total, term) => {
    return total + (term.holidays ?? []).length;
  }, 0);
});

/**
 * Virtual field to check if curriculum is currently active.
 * @returns {boolean} True if curriculum is active and not archived.
 */
CurriculumSchema.virtual("isCurrentlyActive").get(function () {
  return this.isActive && this.metadata?.status === "active";
});

/**
 * Virtual field for curriculum completion status.
 * @returns {string} Completion status based on metadata.
 */
CurriculumSchema.virtual("completionStatus").get(function () {
  const status = this.metadata?.status ?? "draft";
  const isApproved = !!this.metadata?.approvedAt;
  
  if (status === "active" && isApproved) return "completed";
  if (status === "active") return "pending_approval";
  return status;
});

// =============== MIDDLEWARE =============
/**
 * Pre-save middleware to validate academic year and term dates.
 * @param {Function} next - Callback to proceed with save.
 */
CurriculumSchema.pre("save", async function (next) {
  try {
    // Validate subjects
    if (this.subjects?.length > 0) {
      // Add check for circular references
      const uniqueSubjects = [
        ...new Set(this.subjects.map((id) => id.toString())),
      ];
      if (uniqueSubjects.length !== this.subjects.length) {
        return next(new Error("Duplicate subjects are not allowed"));
      }

      const validSubjects = await model("Subject").find({
        _id: { $in: uniqueSubjects },
        isActive: true,
      });
      if (validSubjects.length !== uniqueSubjects.length) {
        return next(
          new Error("Certains subjectIds ne sont pas valides ou inactifs")
        );
      }
    }
    
    // Validate academic year dates
    if (this.academicYear?.startDate >= this.academicYear?.endDate) {
      return next(new Error("La date de début doit être antérieure à la date de fin"));
    }

    // Validate term dates
    if (this.academicYear?.terms?.length > 0) {
      for (const term of this.academicYear.terms) {
        if (term.startDate >= term.endDate) {
          return next(new Error(`Les dates du trimestre ${term.term} sont invalides`));
        }
        if (
          term.startDate < this.academicYear.startDate ||
          term.endDate > this.academicYear.endDate
        ) {
          return next(
            new Error(`Le trimestre ${term.term} dépasse les limites de l'année académique`)
          );
        }

        // Validate holiday dates within terms
        for (const holiday of term.holidays ?? []) {
          if (holiday.startDate >= holiday.endDate) {
            return next(
              new Error(`Les dates de vacances "${holiday.name}" sont invalides`)
            );
          }
          if (holiday.startDate < term.startDate || holiday.endDate > term.endDate) {
            return next(
              new Error(`Les vacances "${holiday.name}" dépassent les limites du trimestre`)
            );
          }
        }
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Pre-save middleware to validate subject references.
 * @param {Function} next - Callback to proceed with save.
 */
CurriculumSchema.pre("save", async function (next) {
  try {
    // Validate subjects
    if (this.subjects?.length > 0) {
      const validSubjects = await model("Subject").find({
        _id: { $in: this.subjects },
        isActive: true,
      });
      if (validSubjects.length !== this.subjects.length) {
        return next(new Error("Certains subjectIds ne sont pas valides ou inactifs"));
      }
    }

    // Update metadata
    if (this.isModified() && !this.isNew) {
      this.metadata.version += 1;
      this.metadata.lastModified = new Date();
    }

    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Pre-save middleware to handle status changes.
 * @param {Function} next - Callback to proceed with save.
 */
CurriculumSchema.pre("save", function (next) {
  if (this.isModified("metadata.status") && this.metadata.status === "active") {
    if (!this.metadata.approvedAt) {
      this.metadata.approvedAt = new Date();
    }
  }
  next();
});

// =============== METHODS =============
/**
 * Add a new term to the academic year.
 * @param {Object} termData - Term data object.
 * @returns {Promise<Document>} Updated curriculum document.
 */
CurriculumSchema.methods.addTerm = function (termData) {
  const existingTerm = this.academicYear.terms.find(t => t.term === termData.term);
  if (existingTerm) {
    throw new Error(`Le trimestre ${termData.term} existe déjà`);
  }

  this.academicYear.terms.push(termData);
  this.academicYear.terms.sort((a, b) => a.term - b.term);

  return this.save();
};

/**
 * Add a holiday to a specific term.
 * @param {number} termNumber - Term number to add holiday to.
 * @param {Object} holidayData - Holiday data object.
 * @returns {Promise<Document>} Updated curriculum document.
 */
CurriculumSchema.methods.addHoliday = function (termNumber, holidayData) {
  const term = this.academicYear.terms.find(t => t.term === termNumber);
  if (!term) {
    throw new Error(`Trimestre ${termNumber} non trouvé`);
  }

  term.holidays.push(holidayData);
  return this.save();
};

/**
 * Archive the curriculum.
 * @param {string} reason - Reason for archiving.
 * @returns {Promise<Document>} Updated curriculum document.
 */
CurriculumSchema.methods.archive = function (reason = "") {
  this.isActive = false;
  this.metadata.status = "archived";
  this.metadata.reviewNotes = reason;

  return this.save();
};

/**
 * Get curriculum statistics.
 * @returns {Object} Curriculum statistics object.
 */
CurriculumSchema.methods.getStatistics = function () {
  return {
    subjectsCount: this.subjectsCount,
    academicYearDuration: this.academicYearDuration,
    totalTerms: this.totalTerms,
    totalHolidays: this.totalHolidays,
    enrollmentCount: this.analytics?.enrollmentCount || 0,
    activeUsers: this.analytics?.activeUsers || 0,
    completionRate: this.analytics?.completionRate || 0,
    completionStatus: this.completionStatus,
  };
};

/**
 * Update curriculum analytics.
 * @param {Object} analyticsData - Analytics data to update.
 * @returns {Promise<Document>} Updated curriculum document.
 */
CurriculumSchema.methods.updateAnalytics = function (analyticsData) {
  Object.assign(this.analytics, analyticsData);
  return this.save();
};

/**
 * Curriculum model for interacting with the Curriculum collection.
 * @type {mongoose.Model}
 */
module.exports = {
  Curriculum: model("Curriculum", CurriculumSchema),
};