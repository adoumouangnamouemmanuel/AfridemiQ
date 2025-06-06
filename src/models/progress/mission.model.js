const mongoose = require("mongoose");
const { Schema } = mongoose;

const MissionSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ["daily", "weekly", "monthly", "custom"],
      required: true,
      index: true,
    },
    progress: { type: Number, default: 0, min: 0 },
    target: { type: Number, required: true, min: 1 },
    reward: { type: String, required: true },
    icon: { type: String, required: true },
    completed: { type: Boolean, default: false, index: true },
    expiresAt: { type: Date, required: true, index: true },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      index: true,
    },
    series: String,
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    points: { type: Number, default: 10 },
    category: {
      type: String,
      enum: ["study", "practice", "achievement", "social"],
      default: "study",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Compound indexes for efficient queries
MissionSchema.index({ type: 1, completed: 1 });
MissionSchema.index({ expiresAt: 1, isActive: 1 });
MissionSchema.index({ subjectId: 1, series: 1 });

// Virtual for completion percentage
MissionSchema.virtual("completionPercentage").get(function () {
  return Math.min(Math.round((this.progress / this.target) * 100), 100);
});

// Virtual for time remaining
MissionSchema.virtual("timeRemaining").get(function () {
  const now = new Date();
  const remaining = this.expiresAt - now;
  return Math.max(0, remaining);
});

// Virtual for is expired
MissionSchema.virtual("isExpired").get(function () {
  return new Date() > this.expiresAt;
});

module.exports = {
  Mission: mongoose.model("Mission", MissionSchema),
};
