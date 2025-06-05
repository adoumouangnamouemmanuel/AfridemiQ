const mongoose = require("mongoose");
const { Schema } = mongoose;

const ExamScheduleSchema = new Schema(
  {
    examId: { type: Schema.Types.ObjectId, ref: "Exam", required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    series: [String],
    level: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    duration: { type: Number, required: true },
    location: String,
    onlineLink: String,
    notes: String,
  },
  { timestamps: true }
);

module.exports = {
  ExamSchedule: mongoose.model("ExamSchedule", ExamScheduleSchema),
};
