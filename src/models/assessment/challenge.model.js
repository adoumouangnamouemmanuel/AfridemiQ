const mongoose = require("mongoose");
const { Schema } = mongoose;

const ChallengeSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    creatorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    topicId: { type: Schema.Types.ObjectId, ref: "Topic", required: true },
    series: String,
    questionIds: [{ type: Schema.Types.ObjectId, ref: "Question" }],
    timeLimit: { type: Number, required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    createdAt: { type: Date, default: Date.now },
    endsAt: Date,
    premiumOnly: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = {
  Challenge: mongoose.model("Challenge", ChallengeSchema),
};
