const mongoose = require('mongoose');
const { Schema } = mongoose;

const ExamSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    translations: {
      name: { fr: String, en: String },
      description: { fr: String, en: String },
    },
    icon: { type: String, required: true },
    color: { type: String, required: true },
    duration: { type: String, required: true },
    country: { type: String, required: true },
    levels: [String],
    series: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        subjects: [{ type: Schema.Types.ObjectId, ref: "Subject" }],
        description: String,
      },
    ],
    curriculumId: {
      type: Schema.Types.ObjectId,
      ref: "Curriculum",
      required: true,
    },
    examFormat: {
      type: String,
      enum: ["paper", "computer", "hybrid"],
      required: true,
      default: "paper",
    },
    accessibilityOptions: [String],
    importantDates: [{ type: String, date: Date }],
    registrationRequirements: {
      minimumAge: Number,
      requiredDocuments: [String],
      fees: { amount: Number, currency: String },
    },
    examCenters: [
      {
        id: String,
        name: String,
        location: String,
        capacity: Number,
      },
    ],
    pastPapers: [
      {
        year: Number,
        url: String,
        solutions: String,
        series: String,
      },
    ],
    statistics: [
      {
        passRate: Number,
        averageScore: Number,
        totalCandidates: Number,
        series: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = {
    Exam: mongoose.model('Exam', ExamSchema),
}