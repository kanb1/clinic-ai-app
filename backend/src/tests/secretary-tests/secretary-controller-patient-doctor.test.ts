import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../index";
import { createTestUser } from "../test-utils/testUtils";
import { UserModel } from "../../models/user.model";

let mongoServer: MongoMemoryServer;
let clinicId: mongoose.Types.ObjectId;
let secretaryToken: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  clinicId = new mongoose.Types.ObjectId();
  const { token } = await createTestUser("secretary", clinicId);
  secretaryToken = token;

  // Add users in same and different clinics
  await UserModel.create([
    {
      name: "Anna Patient",
      email: "anna@example.com",
      password_hash: "hashed",
      role: "patient",
      clinic_id: clinicId,
      cpr_number: "010101-1234",
    },
    {
      name: "Test Doctor",
      email: "testdoc@example.com",
      password_hash: "hashed",
      role: "doctor",
      clinic_id: clinicId,
    },
    {
      name: "Other Clinic Patient",
      email: "other@example.com",
      password_hash: "hashed",
      role: "patient",
      clinic_id: new mongoose.Types.ObjectId(),
      cpr_number: "020202-5678",
    },
  ]);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Secretary Patient & Doctor Endpoints", () => {
  it("GET /patients should return only patients from secretary's clinic", async () => {
    const res = await request(app)
      .get("/api/secretary/patients")
      .set("Authorization", `Bearer ${secretaryToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe("Anna Patient");
  });

  it("GET /patients?search=anna should return matching patients", async () => {
    const res = await request(app)
      .get("/api/secretary/patients?search=anna")
      .set("Authorization", `Bearer ${secretaryToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe("Anna Patient");
  });

  it("GET /doctors should return only doctors from secretary's clinic", async () => {
    const res = await request(app)
      .get("/api/secretary/doctors")
      .set("Authorization", `Bearer ${secretaryToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe("Test Doctor");
  });
});
