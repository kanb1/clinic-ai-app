import request from "supertest";
import mongoose from "mongoose";
import app from "../../index";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createTestUser } from "../test-utils/testUtils";
import { UserModel } from "../../models/user.model";

let mongoServer: MongoMemoryServer;
let token: string;
let userId: mongoose.Types.ObjectId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const clinicId = new mongoose.Types.ObjectId();
  const result = await createTestUser("patient", clinicId);

  token = result.token;
  userId = result.userId;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("PUT /api/patients/profile", () => {
  it("should update email and phone successfully", async () => {
    const res = await request(app)
      .put("/api/patients/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ email: "nyemail@test.com", phone: "12345678" });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/opdateret/i);
    expect(res.body.user.email).toBe("nyemail@test.com");
    expect(res.body.user.phone).toBe("12345678");

    const updated = await UserModel.findById(userId);
    expect(updated?.email).toBe("nyemail@test.com");
    expect(updated?.phone).toBe("12345678");
  });

  it("should return 400 if no data is sent", async () => {
    const res = await request(app)
      .put("/api/patients/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/angive e-mail og\/eller telefonnummer/i);
  });

  it("should return 404 if user does not exist", async () => {
    await UserModel.findByIdAndDelete(userId); // Slet brugeren

    const res = await request(app)
      .put("/api/patients/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ email: "ghost@test.com" });

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/Bruger ikke fundet/i);
  });
});
