import mongoose from "mongoose";

export interface IUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  password_hash: string;
  role: "doctor" | "secretary" | "admin" | "patient";
  clinic_id: mongoose.Types.ObjectId;
}
