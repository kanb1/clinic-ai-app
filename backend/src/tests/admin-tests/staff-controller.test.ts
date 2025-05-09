import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../index";
import { UserModel } from "../../models/user.model";
import {
  createTestUser,
  createTestStaffMembers,
} from "../test-utils/testUtils";

let mongoServer: MongoMemoryServer;
let clinicId: mongoose.Types.ObjectId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  clinicId = new mongoose.Types.ObjectId();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await UserModel.deleteMany({});
});

describe("GET /api/staff", () => {
  it("should return all staff (doctor and secretary) in same clinic", async () => {
    // opretter min admin med jwt token
    const { token } = await createTestUser("admin", clinicId);

    await createTestStaffMembers(clinicId);
    // tester om den kun viser ansatte fra samme klinik
    await createTestUser("doctor", new mongoose.Types.ObjectId());

    const res = await request(app)
      .get("/api/admin/staff")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2); // kun de to fra samme klinik
    expect(res.body[0]).toHaveProperty("name");
    expect(res.body[0]).not.toHaveProperty("password_hash");
  });
});
