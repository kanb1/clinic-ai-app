import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  role: "patient" | "doctor" | "secretary" | "admin";
  clinic_id: mongoose.Types.ObjectId;
  email: string;
  password_hash: string;
  phone: string;
  address: string;
  birth_date: Date;
  cpr_number: string;
  status: "ledig" | "optaget" | "ferie" | "syg" | "andet";
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ["patient", "doctor", "secretary", "admin"],
      required: true,
    },
    clinic_id: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic" },
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true, select: false }, //extra security: skal aktivt select hvis det skal bruges
    phone: { type: String },
    address: { type: String },
    birth_date: { type: Date },
    cpr_number: { type: String },
    status: {
      type: String,
      enum: ["ledig", "optaget", "ferie", "syg", "andet"],
      default: "ledig",
    },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUser>("User", UserSchema);
