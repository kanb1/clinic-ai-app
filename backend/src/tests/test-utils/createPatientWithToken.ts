import { UserModel } from "../../models/user.model";
import { SessionModel } from "../../models/session.model";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";

export const createPatientWithToken = async () => {
  const clinicId = new mongoose.Types.ObjectId();

  const patient = await UserModel.create({
    name: "Test Patient",
    email: `patient-${Date.now()}@test.com`,
    phone: `5000${Date.now()}`,
    password_hash: "Strong123!",
    role: "patient",
    clinic_id: clinicId,
  });

  const jti = uuidv4();
  await SessionModel.create({ jti });

  const token = jwt.sign(
    {
      _id: patient._id,
      role: "patient",
      clinicId,
      jti,
    },
    process.env.JWT_SECRET || "dev-secret",
    { expiresIn: "1d" }
  );

  return { patient, token };
};
