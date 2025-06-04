const mongoose = require("mongoose");
const { Schema } = mongoose;

const TutoringSessionSchema = new Schema(
  {
    tutorId: {
      type: Schema.Types.ObjectId,
      ref: "PeerTutorProfile",
      required: true,
    },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    series: String,
    topicId: { type: Schema.Types.ObjectId, ref: "Topic" },
    scheduledAt: { type: Date, required: true },
    duration: { type: Number, required: true },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      required: true,
    },
    feedback: String,
    sessionRecording: {
      url: String,
      duration: Number,
    },
    premiumOnly: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = {
  TutoringSession: mongoose.model("TutoringSession", TutoringSessionSchema),
};
