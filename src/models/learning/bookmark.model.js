const mongoose = require("mongoose");
const { Schema } = mongoose;

const BookmarkSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    contentType: {
      type: String,
      enum: ["question", "resource", "course", "topic", "quiz"],
      required: true,
    },
    contentId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "contentType",
    },
  },
  { timestamps: true }
);

// Dynamic ref mapping
BookmarkSchema.path("contentType").validate(function (value) {
  return ["question", "resource", "course", "topic", "quiz"].includes(value);
});

BookmarkSchema.path("contentId").ref(function () {
  const contentTypeMap = {
    question: "Question",
    resource: "Resource",
    course: "CourseContent",
    topic: "Topic",
    quiz: "Quiz",
  };
  return contentTypeMap[this.contentType];
});

// Unique compound index to prevent duplicate bookmarks
BookmarkSchema.index(
  { userId: 1, contentType: 1, contentId: 1 },
  { unique: true }
);

// Pre-save middleware to validate references
BookmarkSchema.pre("save", async function (next) {
  try {
    const modelName = {
      question: "Question",
      resource: "Resource",
      course: "CourseContent",
      topic: "Topic",
      quiz: "Quiz",
    }[this.contentType];
    const [user, content] = await Promise.all([
      mongoose.model("User").findById(this.userId),
      mongoose.model(modelName).findById(this.contentId),
    ]);
    if (!user) return next(new Error("Invalid user ID"));
    if (!content) return next(new Error(`Invalid ${this.contentType} ID`));
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = {
  Bookmark: mongoose.model("Bookmark", BookmarkSchema),
};