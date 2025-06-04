const mongoose = require("mongoose");
const { Schema } = mongoose;

const CountrySchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    flagUrl: { type: String, required: true },
    supportedExams: [{ type: Schema.Types.ObjectId, ref: "Exam" }],
    languages: [String],
  },
  { timestamps: true }
);

module.exports = {
  Country: mongoose.model("Country", CountrySchema),
};
