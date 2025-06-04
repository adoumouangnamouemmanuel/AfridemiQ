const mongoose = require("mongoose");
const { Schema } = mongoose;

const MissionSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ["daily", "weekly", "custom"], required: true },
    progress: { type: Number, default: 0 },
    target: { type: Number, required: true },
    reward: { type: String, required: true },
    icon: { type: String, required: true },
    completed: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject" },
    series: String,
  },
  { timestamps: true }
);

module.exports = {
  Mission: mongoose.model("Mission", MissionSchema),
};
