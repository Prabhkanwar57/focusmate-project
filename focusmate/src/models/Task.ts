import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  userId: { type: String, required: true },
  moodLevel: { type: String }, // ✅ NEW
  date: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.models.Task || mongoose.model('Task', TaskSchema);
