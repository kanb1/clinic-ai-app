import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { UserModel } from "../../models/user.model";

// Opretter en bruger og returnerer en token
export async function createTestUser(
  // opretter bruger med given rolle
  role: "admin" | "secretary" | "doctor" | "patient",
  //   sætter den til at tilhøre en bestemt klinik
  clinicId: mongoose.Types.ObjectId
  //   returnerer en jwttoken og brugerens id
): Promise<{ token: string; userId: mongoose.Types.ObjectId }> {
  const user = new UserModel({
    name: `Test ${role}`,
    email: `${role}-${Date.now()}@test.com`, // unik email til hver test, ved at sætte date.now
    password_hash: "hashed123", //placeholder, bruges ik når man logger ind i test
    role, //sendes i aprameteren
    clinic_id: clinicId, //klinikid bruger tilhører
    cpr_number: role === "patient" ? `${Date.now()}` : undefined, // random CPR til patienterne
  });

  await user.save();

  //   genererer så jwttoken based on brugerens id, role osv
  const token = jwt.sign(
    { _id: user._id, role: user.role, clinicId },
    process.env.JWT_SECRET!,
    { expiresIn: "1d" }
  );

  //returnerer token og id castes som objectID, så ts ik brokker sig, ift id er objectID
  return { token, userId: user._id as mongoose.Types.ObjectId };
}

// opretter både læge og sekretær i en given klinik
// begge tilhører samme clinicId
export async function createTestStaffMembers(
  clinicId: mongoose.Types.ObjectId
) {
  await UserModel.create([
    {
      name: "Dr. A",
      email: `doc-${Date.now()}@test.com`,
      password_hash: "hashed123",
      role: "doctor",
      status: "ledig",
      clinic_id: clinicId,
    },
    {
      name: "Sec B",
      email: `sec-${Date.now()}@test.com`,
      password_hash: "hashed123",
      role: "secretary",
      status: "optaget",
      clinic_id: clinicId,
    },
  ]);
}
