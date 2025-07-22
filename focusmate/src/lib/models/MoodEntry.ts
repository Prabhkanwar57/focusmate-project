import mongoose from 'mongoose';

const MoodEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  moodLevel: { type: String, required: true },
  note: { type: String },
  tags: [String],
  date: { type: Date, default: Date.now },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },         // ✅ NEW
  journalId: { type: mongoose.Schema.Types.ObjectId, ref: 'JournalEntry' } // ✅ NEW
});

export default mongoose.models.MoodEntry || mongoose.model('MoodEntry', MoodEntrySchema);
