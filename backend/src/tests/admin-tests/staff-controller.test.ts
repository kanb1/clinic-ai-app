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

// *************************************************************************** DOCTOR

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

  it("should return 400 if doctor creation is missing fields", async () => {
    const { token } = await createTestUser("admin", clinicId);

    const res = await request(app)
      .post("/api/admin/staff/doctors")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "No Email or Password",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Please enter all the required fields");
  });

  it("should return 400 if doctor email already exists", async () => {
    const { token } = await createTestUser("admin", clinicId);

    // Create doctor with same email first
    await UserModel.create({
      name: "Existing",
      email: "exist@example.com",
      password_hash: "pass",
      role: "doctor",
      clinic_id: clinicId,
    });

    const res = await request(app)
      .post("/api/admin/staff/doctors")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "New Doc",
        email: "exist@example.com",
        password: "pass",
        clinic_id: clinicId,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Email is already in use");
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

  it("should return 404 if doctor does not exist", async () => {
    const { token } = await createTestUser("admin", clinicId);
    const nonExistentId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .put(`/api/admin/staff/doctors/${nonExistentId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Ghost Doctor" });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Doctor not found");
  });

  it("should return 404 if doctor to delete is not found", async () => {
    const { token } = await createTestUser("admin", clinicId);
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .delete(`/api/admin/staff/doctors/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Doctor not found");
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

// *************************************************************************** SECRETARY
describe("POST /api/admin/staff/secretary", () => {
  it("should create a new secretary", async () => {
    const { token } = await createTestUser("admin", clinicId);

    const res = await request(app)
      .post("/api/admin/staff/secretary")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "New Secretary",
        email: "newsec@example.com",
        password: "mypassword",
        clinic_id: clinicId,
      });

    expect(res.status).toBe(201);
    expect(res.body.role).toBe("secretary");
    expect(res.body.name).toBe("New Secretary");
  });

  it("should return 400 if secretary creation is missing fields", async () => {
    const { token } = await createTestUser("admin", clinicId);

    const res = await request(app)
      .post("/api/admin/staff/secretary")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Missing Email",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Please enter all the required fields");
  });

  it("should return 400 if secretary email already exists", async () => {
    const { token } = await createTestUser("admin", clinicId);

    await UserModel.create({
      name: "Existing Secretary",
      email: "dupe@example.com",
      password_hash: "123",
      role: "secretary",
      clinic_id: clinicId,
    });

    const res = await request(app)
      .post("/api/admin/staff/secretary")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "New One",
        email: "dupe@example.com",
        password: "pass",
        clinic_id: clinicId,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Email already in use");
  });
});

describe("PUT /api/admin/staff/secretaries/:id", () => {
  it("should update a secretary", async () => {
    const { token } = await createTestUser("admin", clinicId);

    const secretary = await UserModel.create({
      name: "Old Sec",
      email: "oldsec@example.com",
      password_hash: "pass",
      role: "secretary",
      clinic_id: clinicId,
    });

    const res = await request(app)
      .put(`/api/admin/staff/secretaries/${secretary._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Updated Sec", phone: "88889999" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Secretary updated successfully");
    expect(res.body.secretary.name).toBe("Updated Sec");
    expect(res.body.secretary.phone).toBe("88889999");
  });
});

describe("DELETE /api/admin/staff/secretaries/:id", () => {
  it("should delete a secretary", async () => {
    const { token } = await createTestUser("admin", clinicId);

    const secretary = await UserModel.create({
      name: "Secretary Delete",
      email: "delsec@example.com",
      password_hash: "pass",
      role: "secretary",
      clinic_id: clinicId,
    });

    const res = await request(app)
      .delete(`/api/admin/staff/secretaries/${secretary._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Secretary deleted successfully");

    const stillExists = await UserModel.findById(secretary._id);
    expect(stillExists).toBeNull();
  });
});

// *************************************************************************** PATIENT
describe("GET /api/admin (getPatients)", () => {
  it("should return all patients from the same clinic", async () => {
    const { token } = await createTestUser("admin", clinicId);

    await UserModel.create([
      {
        name: "Patient A",
        email: "p1@example.com",
        password_hash: "hashed",
        role: "patient",
        clinic_id: clinicId,
        cpr_number: "111111-1111",
      },
      {
        name: "Patient B",
        email: "p2@example.com",
        password_hash: "hashed",
        role: "patient",
        clinic_id: new mongoose.Types.ObjectId(), // another clinic
        cpr_number: "222222-2222",
      },
    ]);

    const res = await request(app)
      .get("/api/admin")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe("Patient A");
  });
});

describe("GET /api/admin/lookup/:cpr (lookupPatientByCpr)", () => {
  it("should return existing patient if found", async () => {
    const { token } = await createTestUser("admin", clinicId);

    await UserModel.create({
      name: "Existing Patient",
      email: "ep@example.com",
      password_hash: "hashed",
      role: "patient",
      clinic_id: clinicId,
      cpr_number: "333333-3333",
    });

    const res = await request(app)
      .get("/api/admin/lookup/333333-3333")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.patient.name).toBe("Existing Patient");
    expect(res.body.patientWasFoundBefore).toBe(true);
  });

  it("should create dummy patient if not found", async () => {
    const { token } = await createTestUser("admin", clinicId);

    const res = await request(app)
      .get("/api/admin/lookup/444444-4444")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(201);
    expect(res.body.patient.name).toBe("Ukendt Patient");
    expect(res.body.patientWasFoundBefore).toBe(false);
  });
});

describe("PUT /api/admin/:id (updatePatient)", () => {
  it("should update patient details", async () => {
    const { token } = await createTestUser("admin", clinicId);

    const patient = await UserModel.create({
      name: "To Update",
      email: "update@example.com",
      password_hash: "hashed",
      role: "patient",
      clinic_id: clinicId,
      cpr_number: "123456-7890",
    });

    const res = await request(app)
      .put(`/api/admin/${patient._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Updated Name", address: "New Address" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Patient info got successfully updated");
    expect(res.body.patient.name).toBe("Updated Name");
    expect(res.body.patient.address).toBe("New Address");
  });
});

describe("DELETE /api/admin/:id (deletePatient)", () => {
  it("should delete patient from same clinic", async () => {
    const { token } = await createTestUser("admin", clinicId);

    const patient = await UserModel.create({
      name: "Patient Delete",
      email: "del@example.com",
      password_hash: "hashed",
      role: "patient",
      clinic_id: clinicId,
      cpr_number: "555555-5555",
    });

    const res = await request(app)
      .delete(`/api/admin/${patient._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Patient deleted successfully");

    const stillExists = await UserModel.findById(patient._id);
    expect(stillExists).toBeNull();
  });

  it("should not delete patient from another clinic", async () => {
    const { token } = await createTestUser("admin", clinicId);

    const otherClinicPatient = await UserModel.create({
      name: "Wrong Clinic",
      email: "wrong@example.com",
      password_hash: "hashed",
      role: "patient",
      clinic_id: new mongoose.Types.ObjectId(),
      cpr_number: "666666-6666",
    });

    const res = await request(app)
      .delete(`/api/admin/${otherClinicPatient._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Patient not found");
  });
});
