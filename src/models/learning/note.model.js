const mongoose = require("mongoose");
const { Schema } = mongoose;

const NoteSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  topicId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
  series: String,
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
}, { timestamps: true });

module.exports = {
  Note: mongoose.model("Note", NoteSchema)
};
