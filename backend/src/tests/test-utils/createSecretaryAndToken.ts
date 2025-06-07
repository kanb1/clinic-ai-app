import { UserModel } from "../../models/user.model";
import { SessionModel } from "../../models/session.model";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

export const createSecretaryAndToken = async () => {
  const clinicId = new mongoose.Types.ObjectId();

  const secretary = await UserModel.create({
    name: "Test Sekretær",
    email: `secretary-${Date.now()}@test.com`,
    phone: `6000${Date.now()}`,
    password_hash: "Strong123!",
    role: "secretary",
    clinic_id: clinicId,
  });

  const jti = uuidv4();
  await SessionModel.create({ jti });

  const token = jwt.sign(
    {
      _id: secretary._id,
      role: "secretary",
      clinicId: clinicId.toString(), // string for token
      jti,
    },
    process.env.JWT_SECRET || "dev-secret",
    { expiresIn: "1d" }
  );

  return { secretary, token, clinicId };
};
