import mongoose, { Schema, Document } from "mongoose";

// The availability of the doctors

export interface IAvailabilitySlot extends Document {
  doctor_id: mongoose.Types.ObjectId;
  date: Date;
  time_slots: string[]; // ["08:00", "08:30", "09:00"]
}

const AvailabilitySlotSchema: Schema = new Schema(
  {
    doctor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: Date, required: true },
    time_slots: [{ type: String }],
  },
  { timestamps: true }
);

export const AvailabilitySlotModel = mongoose.model<IAvailabilitySlot>(
  "AvailabilitySlot",
  AvailabilitySlotSchema
);
