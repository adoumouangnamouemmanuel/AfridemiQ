const mongoose = require("mongoose");
const { Schema } = mongoose;

const SubjectSchema = new Schema(
  {
    name: { type: String, required: true },
    icon: { type: String, required: true },
    color: { type: String, required: true },
    description: { type: String, required: true },
    examIds: [{ type: Schema.Types.ObjectId, ref: "Exam" }],
    series: [String],
  },
  { timestamps: true, indexes: [{ key: { name: 1, series: 1 } }] }
);

Module.exports = {
  Subject: mongoose.model("Subject", SubjectSchema),
};
