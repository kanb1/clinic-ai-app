import mongoose, { Schema, Document } from 'mongoose';

export interface IPrescription extends Document {
  patient_id: mongoose.Types.ObjectId;
  medication_name: string;
  dosage: string;
  instructions: string;
  issued_date: Date;
}

const PrescriptionSchema: Schema = new Schema(
  {
    patient_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    medication_name: { type: String, required: true },
    dosage: { type: String, required: true },
    instructions: { type: String, required: true },
    issued_date: { type: Date, required: true },
  },
  { timestamps: true }
);

export const PrescriptionModel = mongoose.model<IPrescription>(
  'Prescription',
  PrescriptionSchema
);
