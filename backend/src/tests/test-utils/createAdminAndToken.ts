import { UserModel } from "../../models/user.model";
import { SessionModel } from "../../models/session.model";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

// opretter dummy-admin og returnerer brugerobjekt med jwt token
// utils-funktion -> middleware auth tjekker token mod session -> tilføjet session her
export const createAdminAndToken = async () => {
  const admin = await UserModel.create({
    name: "Test Admin",
    email: `admin-${Date.now()}@test.com`,
    password_hash: "Strong123!",
    role: "admin",
    clinic_id: null, //denne admin har ik en klinik
  });

  const jti = uuidv4();

  await SessionModel.create({ jti });

  const token = jwt.sign(
    {
      _id: admin._id,
      role: admin.role,
      clinicId: null,
      jti,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "1d" }
  );

  return { admin, token };
};
