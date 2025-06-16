import mongoose, { Schema, Document } from "mongoose";

// The availability of the doctors

export interface IAvailabilitySlot extends Document {
  doctor_id: mongoose.Types.ObjectId;
  clinic_id: mongoose.Types.ObjectId;
  date: Date;
  start_time: string;
  end_time: string;
  is_booked: boolean;
}

const AvailabilitySlotSchema: Schema = new Schema(
  {
    doctor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clinic_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
    },
    date: { type: Date, required: true },
    start_time: { type: String, required: true },
    end_time: { type: String, required: true },
    is_booked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// FORBEDRING: BESKYTTELSE MOD DUBLETTER:
//  Der må aldrig være to slots med samme læge, samme dato og samme starttid
// MongoDB returnere en E11000 duplicate key error
AvailabilitySlotSchema.index(
  { doctor_id: 1, date: 1, start_time: 1 },
  { unique: true }
);

export const AvailabilitySlotModel = mongoose.model<IAvailabilitySlot>(
  "AvailabilitySlot",
  AvailabilitySlotSchema
);
