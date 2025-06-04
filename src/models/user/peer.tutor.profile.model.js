const mongoose = require("mongoose");
const { Schema } = mongoose;

const PeerTutorProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    subjects: [{ type: Schema.Types.ObjectId, ref: "Subject" }],
    series: [String],
    topics: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
    availability: [
      {
        day: String,
        startTime: String,
        endTime: String,
      },
    ],
    bio: { type: String, required: true },
    rating: { type: Number, default: 0 },
    reviews: [FeedbackSchema],
    isAvailable: { type: Boolean, default: true },
    premiumOnly: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = {
  PeerTutorProfile: mongoose.model("PeerTutorProfile", PeerTutorProfileSchema),
};
