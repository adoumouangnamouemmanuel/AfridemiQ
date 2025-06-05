const mongoose = require("mongoose");
const { Schema } = mongoose;

const CurriculumSchema = new Schema(
  {
    country: { type: String, required: true },
    educationLevel: { type: String, required: true },
    series: [String],
    subjects: [
      {
        subjectId: { type: Schema.Types.ObjectId, ref: "Subject" },
        name: String,
        description: String,
        topics: [
          {
            topicId: { type: Schema.Types.ObjectId, ref: "Topic" },
            name: String,
            description: String,
            learningObjectives: [String],
            assessmentCriteria: [String],
            resourceIds: [{ type: Schema.Types.ObjectId, ref: "Resource" }],
          },
        ],
        assessments: [
          {
            type: { type: String, enum: ["formative", "summative"] },
            weightage: Number,
            criteria: [String],
          },
        ],
      },
    ],
    academicYear: {
      startDate: Date,
      endDate: Date,
      terms: [
        {
          term: Number,
          startDate: Date,
          endDate: Date,
          holidays: [
            {
              name: String,
              startDate: Date,
              endDate: Date,
            },
          ],
        },
      ],
    },
  },
  { timestamps: true }
);

module.exports = {
  Curriculum: mongoose.model("Curriculum", CurriculumSchema),
};
