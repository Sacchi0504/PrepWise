import mongoose, { Document, Schema } from 'mongoose';

export interface IPracticeSession extends Document {
  userId: mongoose.Types.ObjectId;
  kitId: mongoose.Types.ObjectId;
  flashcardId: string;
  confidence: number;
  practicedAt: Date;
  duration: number; // in seconds
}

const PracticeSessionSchema = new Schema<IPracticeSession>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  kitId: { type: Schema.Types.ObjectId, ref: 'Kit', required: true },
  flashcardId: { type: String, required: true },
  confidence: { type: Number, required: true, min: 1, max: 5 },
  practicedAt: { type: Date, default: Date.now },
  duration: { type: Number, required: true }
});

export const PracticeSession = mongoose.model<IPracticeSession>('PracticeSession', PracticeSessionSchema);
