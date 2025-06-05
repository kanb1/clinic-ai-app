import mongoose from "mongoose";
import { SessionModel } from "../../models/session.model";
import { UserModel } from "../../models/user.model";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";

export const createUserAndToken = async (
  role: "doctor" | "secretary" | "patient" | "admin"
) => {
  const timestamp = Date.now();
  const user = await UserModel.create({
    name: "Test Bruger",
    email: `${timestamp}@test.com`,
    phone: `123456${timestamp}`, // unik nr
    password_hash: "Strong123!",
    role,
    clinic_id: new mongoose.Types.ObjectId(),
    status: "ledig",
  });

  const jti = uuidv4();
  await SessionModel.create({ jti });

  const token = jwt.sign(
    { _id: user._id, role: user.role, clinicId: user.clinic_id, jti },
    process.env.JWT_SECRET!,
    { expiresIn: "1d" }
  );

  return { user, token };
};
