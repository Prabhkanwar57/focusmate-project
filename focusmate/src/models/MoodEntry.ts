import mongoose from 'mongoose';

const MoodSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  moodLevel: { type: String, required: true },         // e.g., happy/sad
  note: String,
  tags: [String],
  date: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.models.MoodEntry || mongoose.model('MoodEntry', MoodSchema);
