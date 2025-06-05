import { UserModel } from "../../models/user.model";
import { SessionModel } from "../../models/session.model";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

// Brug denne utils-funktion ift at min middleware authetnicateJWT tjekker tokenet mod sessions i sessionmodel - og jeg indsætter ik sessionen i db i min test
export const createAdminAndToken = async () => {
  const admin = await UserModel.create({
    name: "Test Admin",
    email: `admin-${Date.now()}@test.com`,
    password_hash: "Strong123!",
    role: "admin",
    clinic_id: null,
  });

  const jti = uuidv4();

  // indsæt sessionen
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
