import mongoose, { Schema, Document } from "mongoose";

export interface IClinic extends Document {
  name: string;
  address: string;
  created_by: mongoose.Types.ObjectId; //refererer til en user (admin eller doctor)
}

const ClinicSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    // created_by: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "User",
    //   required: true,
    // },
  },
  { timestamps: true }
);

export const ClinicModel = mongoose.model<IClinic>("Clinic", ClinicSchema);
