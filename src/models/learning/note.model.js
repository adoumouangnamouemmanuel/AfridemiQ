const mongoose = require("mongoose");
const { Schema } = mongoose;

const NoteSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    topicId: { type: Schema.Types.ObjectId, ref: "Topic", required: true },
    series: [{ type: String, trim: true, minlength: 1 }],
    content: { type: String, required: true, maxlength: 5000 },
  },
  { timestamps: true }
);

// Compound index for performance
NoteSchema.index({ userId: 1, topicId: 1 });

// Pre-save middleware to validate references
NoteSchema.pre("save", async function (next) {
  try {
    const [user, topic] = await Promise.all([
      mongoose.model("User").findById(this.userId),
      mongoose.model("Topic").findById(this.topicId),
    ]);
    if (!user) return next(new Error("Invalid user ID"));
    if (!topic) return next(new Error("Invalid topic ID"));
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = {
  Note: mongoose.model("Note", NoteSchema),
};
