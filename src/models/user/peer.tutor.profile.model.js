const mongoose = require("mongoose");
const { Schema } = mongoose;

// Shared Feedback Subschema
const FeedbackSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, min: 0, max: 10, required: true },
  comments: String,
  createdAt: { type: Date, default: Date.now },
});

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
