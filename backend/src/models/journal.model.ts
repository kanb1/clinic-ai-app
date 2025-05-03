import mongoose, { Schema, Document } from 'mongoose';

export interface IJournal extends Document {
  patient_id: mongoose.Types.ObjectId;
  entries: mongoose.Types.ObjectId[]; // References to journal entries
}

const JournalSchema: Schema = new Schema(
  {
    patient_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    entries: [{ type: mongoose.Schema.Types.ObjectId, ref: 'JournalEntry' }],
  },
  { timestamps: true }
);

export const JournalModel = mongoose.model<IJournal>('Journal', JournalSchema);
