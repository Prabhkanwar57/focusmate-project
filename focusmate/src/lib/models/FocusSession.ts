import mongoose, { Schema, Document } from 'mongoose';

export interface IFocusSession extends Document {
  userId: string;
  duration: number;
  startTime: Date;
  endTime?: Date;
  createdAt?: Date;  // Not required here because it's auto-managed
  updatedAt?: Date;
}

const FocusSessionSchema = new Schema<IFocusSession>(
  {
    userId: { type: String, required: true },
    duration: { type: Number, default: 0 },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
  },
  { timestamps: true } // ✅ This enables createdAt & updatedAt
);

export default mongoose.models.FocusSession ||
  mongoose.model<IFocusSession>('FocusSession', FocusSessionSchema);
