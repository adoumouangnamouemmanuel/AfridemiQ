const mongoose = require("mongoose");
const { Schema } = mongoose;

const CurriculumSchema = new Schema(
  {
    country: {
      type: String,
      required: [true, "Le pays est requis"],
      trim: true,
      index: true,
    },
    educationLevel: {
      type: String,
      required: [true, "Le niveau d'éducation est requis"],
      enum: ["primaire", "secondaire", "superieur"],
      index: true,
    },
    series: {
      type: [String],
      default: [],
      index: true,
    },
    subjects: [
      {
        type: Schema.Types.ObjectId,
        ref: "Subject",
        required: true,
      },
    ],
    academicYear: {
      startDate: {
        type: Date,
        required: [true, "La date de début de l'année académique est requise"],
      },
      endDate: {
        type: Date,
        required: [true, "La date de fin de l'année académique est requise"],
      },
      terms: [
        {
          term: {
            type: Number,
            required: true,
            min: 1,
            max: 4,
          },
          startDate: {
            type: Date,
            required: true,
          },
          endDate: {
            type: Date,
            required: true,
          },
          holidays: [
            {
              name: {
                type: String,
                required: true,
                trim: true,
              },
              startDate: {
                type: Date,
                required: true,
              },
              endDate: {
                type: Date,
                required: true,
              },
            },
          ],
        },
      ],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Le créateur est requis"],
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
CurriculumSchema.index({
  country: 1,
  educationLevel: 1,
  "academicYear.startDate": 1,
});

// Virtual fields
CurriculumSchema.virtual("subjectsCount").get(function () {
  return this.subjects ? this.subjects.length : 0;
});

CurriculumSchema.virtual("academicYearDuration").get(function () {
  if (!this.academicYear.startDate || !this.academicYear.endDate) return 0;
  const diffTime = Math.abs(
    this.academicYear.endDate - this.academicYear.startDate
  );
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // days
});

// Pre-save middleware
CurriculumSchema.pre("save", async function (next) {
  // Validate academic year dates
  if (this.academicYear.startDate >= this.academicYear.endDate) {
    return next(
      new Error("La date de début doit être antérieure à la date de fin")
    );
  }

  // Validate term dates
  if (this.academicYear.terms) {
    for (const term of this.academicYear.terms) {
      if (term.startDate >= term.endDate) {
        return next(
          new Error(`Les dates du trimestre ${term.term} sont invalides`)
        );
      }
      if (
        term.startDate < this.academicYear.startDate ||
        term.endDate > this.academicYear.endDate
      ) {
        return next(
          new Error(
            `Le trimestre ${term.term} dépasse les limites de l'année académique`
          )
        );
      }
    }
  }

  // Validate subjects
  if (this.subjects && this.subjects.length > 0) {
    const validSubjects = await mongoose.model("Subject").find({
      _id: { $in: this.subjects },
      isActive: true,
    });
    if (validSubjects.length !== this.subjects.length) {
      return next(
        new Error("Certains subjectIds ne sont pas valides ou inactifs")
      );
    }
  }

  next();
});

const Curriculum = mongoose.model("Curriculum", CurriculumSchema);

module.exports = { Curriculum };