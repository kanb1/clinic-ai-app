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

describe("POST /api/admin/staff/doctors", () => {
  it("should create new doctor", async () => {
    const { token } = await createTestUser("admin", clinicId);

    const res = await request(app)
      .post("/api/admin/staff/doctors")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Test NewDoctor",
        email: "newdoc@example.com",
        password: "passexample",
        clinic_id: clinicId,
      });

    expect(res.status).toBe(201);
    expect(res.body.role).toBe("doctor");
    expect(res.body.name).toBe("Test NewDoctor");
  });
});

describe("PUT /api/admin/staff/doctors/:id", () => {
  it("should update an existing doctor", async () => {
    const { token } = await createTestUser("admin", clinicId);

    const doctor = await UserModel.create({
      name: "Old Doc",
      email: "old@example.com",
      password_hash: "123",
      role: "doctor",
      clinic_id: clinicId,
    });

    const res = await request(app)
      .put(`/api/admin/staff/doctors/${doctor._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Updated Doc", phone: "12345678" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Doctor updated");
    expect(res.body.doctor.name).toBe("Updated Doc");
    expect(res.body.doctor.phone).toBe("12345678");
  });
});

describe("DELETE /api/admin/staff/doctors/:id", () => {
  it("should delete a doctor", async () => {
    const { token } = await createTestUser("admin", clinicId);

    const doctor = await UserModel.create({
      name: "Doctor Delete",
      email: "delete@example.com",
      password_hash: "pass",
      role: "doctor",
      clinic_id: clinicId,
    });

    const res = await request(app)
      .delete(`/api/admin/staff/doctors/${doctor._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Doctor deleted successfully");

    const stillExists = await UserModel.findById(doctor._id);
    expect(stillExists).toBeNull();
  });
});
