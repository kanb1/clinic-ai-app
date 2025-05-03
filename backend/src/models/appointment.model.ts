import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  patient_id: mongoose.Types.ObjectId;
  doctor_id: mongoose.Types.ObjectId;
  clinic_id: mongoose.Types.ObjectId;
  date: Date;
  time: string;
  status: 'bekræftet' | 'aflyst' | 'udført' | 'venter';
  secretary_note?: string;
}

const AppointmentSchema: Schema = new Schema(
  {
    patient_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    clinic_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinic',
      required: true,
    },
    date: { type: Date, required: true },
    time: { type: String, required: true }, // "14:30"
    status: {
      type: String,
      enum: ['bekræftet', 'aflyst', 'udført', 'venter'],
      default: 'venter',
      required: true,
    },
    secretary_note: { type: String },
  },
  { timestamps: true }
);

export const AppointmentModel = mongoose.model<IAppointment>(
  'Appointment',
  AppointmentSchema
);
