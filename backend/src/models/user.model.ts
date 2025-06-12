import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

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
    clinic_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      required: function (this: IUser) {
        return this.role !== "admin";
      },
    },
    email: { type: String, required: true, unique: true },
    //extra security: skal aktivt select hvis det skal bruges
    password_hash: { type: String, required: true, select: false },
    phone: { type: String, unique: true },
    address: { type: String },
    birth_date: { type: Date },
    cpr_number: {
      type: String,
      unique: true,
      sparse: true,
      validate: {
        //specialregel tilføjet for patienter
        validator: function (this: IUser, value: string | undefined) {
          if (this.role === "patient") {
            return value != null && value !== "";
          }
          return true; // andre roller må godt mangle det
        },
        message: "CPR-nummer er påkrævet for patienter",
      },
    },
    status: {
      type: String,
      enum: ["ledig", "optaget", "ferie", "syg", "andet"],
      default: "ledig",
    },
  },
  { timestamps: true }
);

// **********PRE-SAVE MIDDLEWARE
UserSchema.pre("save", async function (this: IUser, next) {
  // Kun hvis password_hash er blevet ændret
  //next: hopper videre til næste middleware/save
  if (!this.isModified("password_hash")) return next();

  try {
    const salt = await bcrypt.genSalt(10);

    this.password_hash = await bcrypt.hash(this.password_hash, salt);
    // save
    next();
  } catch (error) {
    // hvis fejl, så sender vi fejlen videre til express- error handler
    next(error as Error);
  }
});

export const UserModel = mongoose.model<IUser>("User", UserSchema);
