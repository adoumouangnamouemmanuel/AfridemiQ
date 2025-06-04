const mongoose = require("mongoose");
const { Schema } = mongoose;
// Shared constants
const SUBJECT_TYPES = [
  "french",
  "english",
  "math",
  "physics",
  "chemistry",
  "biology",
  "history",
  "geography",
  "philosophy",
];
const DIFFICULTY_LEVELS = ["beginner", "intermediate", "advanced"];
const INTERACTIVITY_LEVELS = ["low", "medium", "high"];
const QUESTION_TYPES = ["multiple_choice", "short_answer", "essay"];
const RESOURCE_TYPES = [
  "document",
  "video",
  "audio",
  "interactive",
  "past_exam",
];
const MEDIA_TYPES = ["image", "audio", "video"];
const WRITING_FORMATS = ["essay", "letter", "commentary", "summary"];
const INTERACTIVE_ELEMENT_TYPES = ["geogebra", "desmos", "video", "quiz"];
const USER_ROLES = ["student", "teacher", "admin"];

// Shared Feedback Subschema
const FeedbackSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, min: 0, max: 10, required: true },
  comments: String,
  createdAt: { type: Date, default: Date.now },
});