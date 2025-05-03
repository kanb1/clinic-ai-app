import mongoose, { Schema, Document } from 'mongoose';

export interface IJournalEntry extends Document {
  appointment_id: mongoose.Types.ObjectId;
  notes: string;
  created_by_ai: boolean;
}

const JournalEntrySchema: Schema = new Schema(
  {
    appointment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
    },
    notes: { type: String, required: true },
    created_by_ai: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const JournalEntryModel = mongoose.model<IJournalEntry>(
  'JournalEntry',
  JournalEntrySchema
);
