import { UserModel } from "../../models/user.model";
import { SessionModel } from "../../models/session.model";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

export const createDoctorWithToken = async () => {
  const clinicId = new mongoose.Types.ObjectId();

  const doctor = await UserModel.create({
    name: "Dr. Test",
    email: `dr-${Date.now()}@test.com`,
    phone: `1000${Date.now()}`,
    password_hash: "Strong123!",
    role: "doctor",
    clinic_id: clinicId,
  });

  const jti = uuidv4();
  await SessionModel.create({ jti });

  const token = jwt.sign(
    {
      _id: doctor._id,
      role: "doctor",
      clinicId: clinicId.toString(),
      jti,
    },
    process.env.JWT_SECRET || "dev-secret",
    { expiresIn: "1h" }
  );

  return { doctor, token, clinicId };
};
