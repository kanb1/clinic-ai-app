import mongoose from "mongoose";
import { UserModel } from "../../models/user.model";
import { SessionModel } from "../../models/session.model";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

export const createAdminWithClinicAndToken = async () => {
  const clinicId = new mongoose.Types.ObjectId();

  const admin = await UserModel.create({
    name: "Admin Test",
    email: `admin-${Date.now()}@test.com`,
    password_hash: "Strong123!",
    role: "admin",
    clinic_id: clinicId,
  });

  const jti = uuidv4();
  await SessionModel.create({ jti });

  const token = jwt.sign(
    {
      _id: admin._id,
      role: admin.role,
      clinicId,
      jti,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "1d" }
  );

  return { admin, token, clinicId };
};
