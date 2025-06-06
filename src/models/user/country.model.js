const mongoose = require("mongoose");
const { Schema } = mongoose;

const CountrySchema = new Schema(
  {
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
    supportedExams: [
      {
        type: Schema.Types.ObjectId,
        ref: "Exam",
        default: [],
      },
    ],
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
    region: {
      type: String,
      enum: [
        "North Africa",
        "West Africa",
        "East Africa",
        "Central Africa",
        "Southern Africa",
      ],
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
      enum: ["French", "British", "American", "Portuguese", "Arabic", "Mixed"],
      required: [true, "Le système éducatif est requis"],
      index: true,
    },
    examBoards: [
      {
        name: {
          type: String,
          required: true,
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
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    statistics: {
      totalUsers: {
        type: Number,
        default: 0,
      },
      totalExams: {
        type: Number,
        default: 0,
      },
      totalSubjects: {
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

// Indexes
CountrySchema.index({ name: 1 });
CountrySchema.index({ code: 1 });
CountrySchema.index({ region: 1, educationSystem: 1 });
CountrySchema.index({ isActive: 1 });

// Text index for search
CountrySchema.index({
  name: "text",
  capital: "text",
  languages: "text",
});

// Virtual fields
CountrySchema.virtual("examCount").get(function () {
  return this.supportedExams ? this.supportedExams.length : 0;
});

CountrySchema.virtual("languageCount").get(function () {
  return this.languages ? this.languages.length : 0;
});

CountrySchema.virtual("formattedLanguages").get(function () {
  return this.languages ? this.languages.join(", ") : "";
});

CountrySchema.virtual("examBoardCount").get(function () {
  return this.examBoards ? this.examBoards.length : 0;
});

// Pre-save middleware
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

// Static methods
CountrySchema.statics.findByRegion = function (region) {
  return this.find({ region, isActive: true });
};

CountrySchema.statics.findByEducationSystem = function (educationSystem) {
  return this.find({ educationSystem, isActive: true });
};

CountrySchema.statics.findByLanguage = function (language) {
  return this.find({ languages: { $in: [language] }, isActive: true });
};

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

// Instance methods
CountrySchema.methods.addExam = function (examId) {
  if (!this.supportedExams.includes(examId)) {
    this.supportedExams.push(examId);
    this.statistics.totalExams = this.supportedExams.length;
  }
  return this.save();
};

CountrySchema.methods.removeExam = function (examId) {
  this.supportedExams = this.supportedExams.filter(
    (id) => id.toString() !== examId.toString()
  );
  this.statistics.totalExams = this.supportedExams.length;
  return this.save();
};

CountrySchema.methods.updateStatistics = function (
  userCount,
  examCount,
  subjectCount
) {
  this.statistics.totalUsers = userCount || this.statistics.totalUsers;
  this.statistics.totalExams = examCount || this.statistics.totalExams;
  this.statistics.totalSubjects = subjectCount || this.statistics.totalSubjects;
  return this.save();
};

const Country = mongoose.model("Country", CountrySchema);

module.exports = { Country };