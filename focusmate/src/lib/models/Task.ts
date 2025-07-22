import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  moodAtStart: { type: String },        // ✅ NEW
  moodAtCompletion: { type: String },   // ✅ NEW
}, { timestamps: true });

export default mongoose.models.Task || mongoose.model('Task', TaskSchema);
