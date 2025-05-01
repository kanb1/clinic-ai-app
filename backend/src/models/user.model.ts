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
      required: true,
    },
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

// **********PRE-SAVE MIDDLEWARE
// pre-save --> Kør denne funktion inden .save()
// this: IUser betyder this refererer til et dokument som følger IUser interfacet. TS ting.. så ts ved this.password_hash det en string
UserSchema.pre("save", async function (this: IUser, next) {
  // Kun hvis password_hash er blevet ændret, så hasher vi noget
  // return next: hopper videre til næste middleware/save
  if (!this.isModified("password_hash")) return next();

  try {
    // genererer et salt med 10 runder, tilfældig værdi der tilføjes
    const salt = await bcrypt.genSalt(10);
    // hasher det rå password og overskriver feltet password_hash med den hash
    // så når dokumentet gemmes bagefter er pass allerede krypteret
    this.password_hash = await bcrypt.hash(this.password_hash, salt);
    // jeg er færdig gå videre med at gemme dokumentet
    next();
  } catch (error) {
    // hvis fejl, så sender vi fejlen videre til express- error handler
    next(error as Error);
  }
});

export const UserModel = mongoose.model<IUser>("User", UserSchema);
