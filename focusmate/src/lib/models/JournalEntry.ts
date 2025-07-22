import mongoose from 'mongoose';

const JournalEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  content: { type: String, required: true },
  date: { type: Date, default: Date.now },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' }, // ✅ NEW
  moodLevel: { type: String },                                   // ✅ NEW
});

export default mongoose.models.JournalEntry || mongoose.model('JournalEntry', JournalEntrySchema);
