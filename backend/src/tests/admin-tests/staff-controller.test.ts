import request from "supertest";
import mongoose from "mongoose";
import app from "../../index";
import { MongoMemoryServer } from "mongodb-memory-server";
import { UserModel } from "../../models/user.model";
import { SessionModel } from "../../models/session.model";
import { createAdminWithClinicAndToken } from "../test-utils/createAdminWithClinicAndToken";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await UserModel.deleteMany({});
  await SessionModel.deleteMany({});
});

describe("Admin Staff Controller", () => {
  it("should get all doctors in clinic", async () => {
    const { admin, token, clinicId } = await createAdminWithClinicAndToken();

    await UserModel.create({
      name: "Dr. Test",
      email: `dr-${Date.now()}@test.com`,
      phone: `1000${Date.now()}`,
      password_hash: "Strong123!",
      role: "doctor",
      clinic_id: clinicId,
    });

    const res = await request(app)
      .get("/api/admin/staff/doctors-list")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("should get all secretaries in clinic", async () => {
    const { token, clinicId } = await createAdminWithClinicAndToken();

    await UserModel.create({
      name: "Secretary Test",
      email: `sec-${Date.now()}@test.com`,
      phone: `2000${Date.now()}`,
      password_hash: "Strong123!",
      role: "secretary",
      clinic_id: clinicId,
    });

    const res = await request(app)
      .get("/api/admin/staff/secretaries-list")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body[0].role).toBe("secretary");
  });

  it("should get all staff in clinic", async () => {
    const { token, clinicId } = await createAdminWithClinicAndToken();

    await UserModel.create({
      name: "Doctor X",
      email: `dx-${Date.now()}@test.com`,
      phone: `3000${Date.now()}`,
      password_hash: "Strong123!",
      role: "doctor",
      clinic_id: clinicId,
    });

    await UserModel.create({
      name: "Secretary Y",
      email: `sy-${Date.now()}@test.com`,
      phone: `4000${Date.now()}`,
      password_hash: "Strong123!",
      role: "secretary",
      clinic_id: clinicId,
    });

    const res = await request(app)
      .get("/api/admin/staff")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
  });

  it("should add a new doctor", async () => {
    const { token } = await createAdminWithClinicAndToken();

    const res = await request(app)
      .post("/api/admin/staff/doctors")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Dr. New",
        email: `newdoc-${Date.now()}@test.com`,
        phone: `5000${Date.now()}`,
        password: "StrongPass123!",
      });

    expect(res.status).toBe(201);
    expect(res.body.role).toBe("doctor");
  });

  it("should add a new secretary", async () => {
    const { token } = await createAdminWithClinicAndToken();

    const res = await request(app)
      .post("/api/admin/staff/secretary")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Sec. New",
        email: `newsec-${Date.now()}@test.com`,
        phone: `6000${Date.now()}`,
        password: "StrongPass123!",
      });

    expect(res.status).toBe(201);
    expect(res.body.role).toBe("secretary");
  });

  it("should update a doctor", async () => {
    const { token, clinicId } = await createAdminWithClinicAndToken();

    const doctor = await UserModel.create({
      name: "Dr. Updatable",
      email: `upd-${Date.now()}@test.com`,
      phone: `7000${Date.now()}`,
      password_hash: "Strong123!",
      role: "doctor",
      clinic_id: clinicId,
    });

    const res = await request(app)
      .put(`/api/admin/staff/doctors/${doctor._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Dr. Updated",
        email: doctor.email, // beholder original værdi
        phone: doctor.phone,
      });

    expect(res.status).toBe(200);
    expect(res.body.doctor.name).toBe("Dr. Updated");
  });

  it("should delete a doctor", async () => {
    const { token, clinicId } = await createAdminWithClinicAndToken();

    const doctor = await UserModel.create({
      name: "Dr. Delete",
      email: `del-${Date.now()}@test.com`,
      phone: `8000${Date.now()}`,
      password_hash: "Strong123!",
      role: "doctor",
      clinic_id: clinicId,
    });

    const res = await request(app)
      .delete(`/api/admin/staff/doctors/${doctor._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted successfully/i);
  });

  it("should update a secretary", async () => {
    const { token, clinicId } = await createAdminWithClinicAndToken();

    const secretary = await UserModel.create({
      name: "Sec. Updatable",
      email: `secupd-${Date.now()}@test.com`,
      phone: `9000${Date.now()}`,
      password_hash: "Strong123!",
      role: "secretary",
      clinic_id: clinicId,
    });

    const res = await request(app)
      .put(`/api/admin/staff/secretaries/${secretary._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Sec. Updated",
        email: secretary.email,
        phone: secretary.phone,
      });

    expect(res.status).toBe(200);
    expect(res.body.secretary.name).toBe("Sec. Updated");
  });

  it("should delete a secretary", async () => {
    const { token, clinicId } = await createAdminWithClinicAndToken();

    const secretary = await UserModel.create({
      name: "Sec. Delete",
      email: `secdel-${Date.now()}@test.com`,
      phone: `9100${Date.now()}`,
      password_hash: "Strong123!",
      role: "secretary",
      clinic_id: clinicId,
    });

    const res = await request(app)
      .delete(`/api/admin/staff/secretaries/${secretary._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted successfully/i);
  });

  it("should send system message to all", async () => {
    const { token } = await createAdminWithClinicAndToken();

    const res = await request(app)
      .post("/api/admin/system-messages")
      .set("Authorization", `Bearer ${token}`)
      .send({
        content: "Systembesked her",
        receiver_scope: "all",
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Systembesked sendt");
  });

  it("should return 400 if content is missing", async () => {
    const { token } = await createAdminWithClinicAndToken();

    const res = await request(app)
      .post("/api/admin/system-messages")
      .set("Authorization", `Bearer ${token}`)
      .send({
        receiver_scope: "all",
      });

    expect(res.status).toBe(400);
  });

  it("should find existing patient by CPR", async () => {
    const { token, clinicId } = await createAdminWithClinicAndToken();

    const patient = await UserModel.create({
      name: "Test Patient",
      email: `test-${Date.now()}@example.com`,
      password_hash: "Secure123!",
      cpr_number: "1234567890",
      clinic_id: clinicId,
      role: "patient",
    });

    const res = await request(app)
      .get("/api/admin/lookup/1234567890")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.patient.email).toBe(patient.email);
  });

  it("should create dummy patient if not found", async () => {
    const { token } = await createAdminWithClinicAndToken();

    const res = await request(app)
      .get("/api/admin/lookup/9998887776")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(201);
    expect(res.body.patient.name).toBe("Ukendt Patient");
  });

  it("should get all patients in clinic", async () => {
    const { token, clinicId } = await createAdminWithClinicAndToken();

    await UserModel.create({
      name: "Patient A",
      email: `a-${Date.now()}@test.com`,
      password_hash: "Secret123!",
      role: "patient",
      cpr_number: "0000111122",
      clinic_id: clinicId,
    });

    const res = await request(app)
      .get("/api/admin/patients-list")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("should return patients in clinic", async () => {
    const { token, clinicId } = await createAdminWithClinicAndToken();

    await UserModel.create({
      name: "Patient Test",
      email: `patient-${Date.now()}@test.com`,
      password_hash: "Strong123!",
      role: "patient",
      clinic_id: clinicId,
    });

    const res = await request(app)
      .get("/api/admin/patients-list")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body[0].role).toBe("patient");
  });

  it("should create dummy patient if not found by CPR", async () => {
    const { token } = await createAdminWithClinicAndToken();

    const res = await request(app)
      .get("/api/admin/lookup/9999999999")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(201);
    expect(res.body.patientWasFoundBefore).toBe(false);
    expect(res.body.patient.name).toBe("Ukendt Patient");
  });

  it("should send system message to all", async () => {
    const { token } = await createAdminWithClinicAndToken();

    const res = await request(app)
      .post("/api/admin/system-messages")
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "Test besked", receiver_scope: "all" });

    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/Systembesked sendt/i);
  });

  it("should fail sending system message without content", async () => {
    const { token } = await createAdminWithClinicAndToken();

    const res = await request(app)
      .post("/api/admin/system-messages")
      .set("Authorization", `Bearer ${token}`)
      .send({ receiver_scope: "all" });

    expect(res.status).toBe(400);
  });

  it("should fail sending individual message without receiver_id", async () => {
    const { token } = await createAdminWithClinicAndToken();

    const res = await request(app)
      .post("/api/admin/system-messages")
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "Hej", receiver_scope: "individual" });

    expect(res.status).toBe(400);
  });

  it("should fail sending with invalid ObjectId", async () => {
    const { token } = await createAdminWithClinicAndToken();

    const res = await request(app)
      .post("/api/admin/system-messages")
      .set("Authorization", `Bearer ${token}`)
      .send({
        content: "Hej",
        receiver_scope: "individual",
        receiver_id: "NOT_VALID_OBJECT_ID",
      });

    expect(res.status).toBe(400);
  });

  it("should update patient info", async () => {
    const { token, clinicId } = await createAdminWithClinicAndToken();

    const patient = await UserModel.create({
      name: "Old Name",
      email: "old@test.com",
      password_hash: "Strong123!",
      cpr_number: "1212121212",
      role: "patient",
      clinic_id: clinicId,
    });

    const res = await request(app)
      .put(`/api/admin/${patient._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "New Name", email: "old@test.com" });

    expect(res.status).toBe(200);
    expect(res.body.patient.name).toBe("New Name");
  });

  it("should delete a patient", async () => {
    const { token, clinicId } = await createAdminWithClinicAndToken();

    const patient = await UserModel.create({
      name: "Delete Me",
      email: "deleteme@test.com",
      password_hash: "Strong123!",
      cpr_number: "9999999999",
      role: "patient",
      clinic_id: clinicId,
    });

    const res = await request(app)
      .delete(`/api/admin/${patient._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted successfully/i);
  });

  it("should return 404 when trying to update non-existing doctor", async () => {
    const { token } = await createAdminWithClinicAndToken();

    const res = await request(app)
      .put(`/api/admin/staff/doctors/${new mongoose.Types.ObjectId()}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Ghost Doctor" });

    expect(res.status).toBe(404);
  });

  it("should return 400 if doctor already exists with email", async () => {
    const { token, clinicId } = await createAdminWithClinicAndToken();

    const existing = await UserModel.create({
      name: "Dr. Existing",
      email: "duplicate@test.com",
      password_hash: "Strong123!",
      role: "doctor",
      clinic_id: clinicId,
    });

    const res = await request(app)
      .post("/api/admin/staff/doctors")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Another One",
        email: "duplicate@test.com",
        password: "StrongPass123!",
      });

    expect(res.status).toBe(400);
  });

  it("should return 400 if doctor email already exists", async () => {
    const { token, clinicId } = await createAdminWithClinicAndToken();

    await UserModel.create({
      name: "Dr. Existing",
      email: "duplicate@test.com",
      password_hash: "Strong123!",
      role: "doctor",
      clinic_id: clinicId,
    });

    const res = await request(app)
      .post("/api/admin/staff/doctors")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Duplicate",
        email: "duplicate@test.com",
        password: "StrongPass123!",
      });

    expect(res.status).toBe(400);
  });

  it("should return 404 when trying to update non-existing doctor", async () => {
    const { token } = await createAdminWithClinicAndToken();

    const res = await request(app)
      .put(`/api/admin/staff/doctors/${new mongoose.Types.ObjectId()}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Ghost Doctor" });

    expect(res.status).toBe(404);
  });

  it("should return 404 when trying to delete non-existing secretary", async () => {
    const { token } = await createAdminWithClinicAndToken();

    const res = await request(app)
      .delete(`/api/admin/staff/secretaries/${new mongoose.Types.ObjectId()}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it("should return 404 when updating patient that doesn’t exist", async () => {
    const { token } = await createAdminWithClinicAndToken();

    const res = await request(app)
      .put(`/api/admin/${new mongoose.Types.ObjectId()}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Missing Patient" });

    expect(res.status).toBe(404);
  });

  it("should return 400 if secretary email already exists", async () => {
    const { token, clinicId } = await createAdminWithClinicAndToken();

    await UserModel.create({
      name: "Existing Secretary",
      email: "sec-duplicate@test.com",
      password_hash: "Strong123!",
      role: "secretary",
      clinic_id: clinicId,
    });

    const res = await request(app)
      .post("/api/admin/staff/secretary")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Duplicate Secretary",
        email: "sec-duplicate@test.com",
        password: "StrongPass123!",
      });

    expect(res.status).toBe(400);
  });

  it("should return 404 when updating non-existing secretary", async () => {
    const { token } = await createAdminWithClinicAndToken();

    const res = await request(app)
      .put(`/api/admin/staff/secretaries/${new mongoose.Types.ObjectId()}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Ghost Secretary" });

    expect(res.status).toBe(404);
  });

  it("should return 404 when trying to delete non-existing secretary", async () => {
    const { token } = await createAdminWithClinicAndToken();

    const res = await request(app)
      .delete(`/api/admin/staff/secretaries/${new mongoose.Types.ObjectId()}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});
