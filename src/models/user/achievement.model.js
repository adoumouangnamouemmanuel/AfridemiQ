const mongoose = require('mongoose');
const { Schema } = mongoose;

// Achievement Schema
const AchievementSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    color: { type: String, required: true },
    earnedDate: Date,
    progress: { type: Number, default: 0 },
    target: { type: Number, required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject' },
    series: String,
}, { timestamps: true });
  
module.exports = {
    Achievement: mongoose.model('Achievement', AchievementSchema),
}