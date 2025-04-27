import mongoose, { Schema, Document } from "mongoose";

// The availability of the doctors

export interface IAvailabilitySlot extends Document {
  doctor_id: mongoose.Types.ObjectId;
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
    date: { type: Date, required: true },
    start_time: { type: String, required: true },
    end_time: { type: String, required: true },
    is_booked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const AvailabilitySlotModel = mongoose.model<IAvailabilitySlot>(
  "AvailabilitySlot",
  AvailabilitySlotSchema
);
