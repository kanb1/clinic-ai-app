// doctor-appointments.test.ts
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../index";
import { UserModel } from "../../models/user.model";
import { AppointmentModel } from "../../models/appointment.model";
import { createTestUser } from "../test-utils/testUtils";
import { JournalModel } from "../../models/journal.model";
import { JournalEntryModel } from "../../models/journalentry.model";
import { PrescriptionModel } from "../../models/prescription.model";
import { TestResultModel } from "../../models/testresult.model";

let mongoServer: MongoMemoryServer;
let clinicId: mongoose.Types.ObjectId;
let doctorToken: string;
let doctorId: mongoose.Types.ObjectId;
let patientId: mongoose.Types.ObjectId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  clinicId = new mongoose.Types.ObjectId();

  // create a doctor and patient in same clinic
  const doctor = await createTestUser("doctor", clinicId);
  doctorToken = doctor.token;
  doctorId = doctor.userId;

  const patient = await UserModel.create({
    name: "Test Patient",
    email: "patient@test.com",
    password_hash: "hashed123",
    role: "patient",
    clinic_id: clinicId,
    cpr_number: "111111-2222",
  });

  patientId = patient._id as mongoose.Types.ObjectId;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await AppointmentModel.deleteMany({});
});

// ******************************** APPOINTMENTS

describe("Doctor Appointments Endpoints", () => {
  it("GET /appointments/today should return today's appointments", async () => {
    await AppointmentModel.create({
      doctor_id: doctorId,
      patient_id: patientId,
      clinic_id: clinicId,
      date: new Date(), // today
      time: "10:00",
      status: "bekræftet",
    });

    const res = await request(app)
      .get("/api/doctors/appointments/today")
      .set("Authorization", `Bearer ${doctorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.appointments.length).toBe(1);
  });

  it("GET /appointments/today should return today's appointments", async () => {
    // Opretter doctor og patient i samme klinik
    const { token, userId: doctorId } = await createTestUser(
      "doctor",
      clinicId
    );
    const { userId: patientId } = await createTestUser("patient", clinicId);

    const today = new Date();
    today.setHours(12, 0, 0, 0);

    await AppointmentModel.create({
      doctor_id: doctorId,
      patient_id: patientId,
      clinic_id: clinicId,
      date: today,
      time: "12:00",
      status: "bekræftet",
    });

    const res = await request(app)
      .get("/api/doctors/appointments/today")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.appointments.length).toBe(1);
    expect(res.body.appointments[0]).toHaveProperty("patient_id.name");
  });

  it("GET /appointments/today-details should return formatted appointments", async () => {
    await AppointmentModel.create({
      doctor_id: doctorId,
      patient_id: patientId,
      clinic_id: clinicId,
      date: new Date(), // today
      time: "13:00",
      secretary_note: "Hovedpine",
      status: "bekræftet",
    });

    const res = await request(app)
      .get("/api/doctors/appointments/today-details")
      .set("Authorization", `Bearer ${doctorToken}`);

    expect(res.status).toBe(200);
    expect(res.body[0].patientName).toBe("Test Patient");
    expect(res.body[0].symptoms).toBe("Hovedpine");
  });

  it("PATCH /appointments/:id/cancel should cancel appointment", async () => {
    const appointment = await AppointmentModel.create({
      doctor_id: doctorId,
      patient_id: patientId,
      clinic_id: clinicId,
      date: new Date(),
      time: "14:00",
      status: "bekræftet",
    });

    const res = await request(app)
      .patch(`/api/doctors/appointments/${appointment._id}/cancel`)
      .set("Authorization", `Bearer ${doctorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Appointment cancelled");

    const updated = await AppointmentModel.findById(appointment._id);
    expect(updated?.status).toBe("aflyst");
  });

  it("PATCH /appointments/:id/cancel should return 400 if already cancelled", async () => {
    const cancelledAppt = await AppointmentModel.create({
      doctor_id: doctorId,
      patient_id: patientId,
      clinic_id: clinicId,
      date: new Date(),
      time: "15:00",
      status: "aflyst",
    });

    const res = await request(app)
      .patch(`/api/doctors/appointments/${cancelledAppt._id}/cancel`)
      .set("Authorization", `Bearer ${doctorToken}`);

    expect(res.status);
  });
});

// ******************************** PATIENTS FOR DOCTOR
describe("Doctor Patient Endpoints", () => {
  it("GET /patients should return patients from same clinic", async () => {
    const { token } = await createTestUser("doctor", clinicId);

    // I'm deleting the existing patient made in the beforeEach for the previous tests (appointments)
    await UserModel.deleteMany({ role: "patient" });

    // Opret én patient i samme klinik og én i anden klinik
    await UserModel.create([
      {
        name: "Correct Patient",
        email: "correct@test.com",
        password_hash: "hashed",
        role: "patient",
        clinic_id: clinicId,
        cpr_number: "121212-1212",
      },
      {
        name: "Other Clinic Patient",
        email: "wrong@test.com",
        password_hash: "hashed",
        role: "patient",
        clinic_id: new mongoose.Types.ObjectId(),
        cpr_number: "131313-1313",
      },
    ]);

    const res = await request(app)
      .get("/api/doctors/patients")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe("Correct Patient");
  });

  it("GET /patients/:id should return specific patient info", async () => {
    const { token } = await createTestUser("doctor", clinicId);

    const patient = await UserModel.create({
      name: "Target Patient",
      email: "target@test.com",
      password_hash: "hashed",
      role: "patient",
      clinic_id: clinicId,
      cpr_number: "141414-1414",
    });

    const res = await request(app)
      .get(`/api/doctors/patients/${patient._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Target Patient");
    expect(res.body).not.toHaveProperty("password_hash");
  });

  it("GET /patients/:id should return 404 for patient in another clinic", async () => {
    const { token } = await createTestUser("doctor", clinicId);

    const otherClinicPatient = await UserModel.create({
      name: "Wrong Clinic Patient",
      email: "wrongclinic@test.com",
      password_hash: "hashed",
      role: "patient",
      clinic_id: new mongoose.Types.ObjectId(),
      cpr_number: "151515-1515",
    });

    const res = await request(app)
      .get(`/api/doctors/patients/${otherClinicPatient._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Patient not found");
  });
});

// ******************************** PATIENTDETAILS
describe("Doctor Patient Details Endpoints", () => {
  it("GET /patients/:id should return correct patient details", async () => {
    const { token } = await createTestUser("doctor", clinicId);

    const patient = await UserModel.create({
      name: "Patient Detail",
      email: "detail@example.com",
      password_hash: "hashed123",
      role: "patient",
      clinic_id: clinicId,
      cpr_number: "333333-3333",
    });

    const res = await request(app)
      .get(`/api/doctors/patients/${patient._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Patient Detail");
    expect(res.body).not.toHaveProperty("password_hash");
  });

  it("GET /patients/:id should return 404 if patient not found", async () => {
    const { token } = await createTestUser("doctor", clinicId);

    const otherPatient = await UserModel.create({
      name: "Other Clinic",
      email: "other@example.com",
      password_hash: "hashed123",
      role: "patient",
      clinic_id: new mongoose.Types.ObjectId(),
      cpr_number: "444444-4444",
    });

    const res = await request(app)
      .get(`/api/doctors/patients/${otherPatient._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Patient not found");
  });
});

// ******************************** JOURNAL ENDPOINTS
describe("Doctor Journal Endpoints", () => {
  it("GET /journals should return overview of journals for patients in same clinic", async () => {
    const { token } = await createTestUser("doctor", clinicId);

    const patient = await UserModel.create({
      name: "Journal Patient",
      email: "journal@example.com",
      password_hash: "hashed123",
      role: "patient",
      clinic_id: clinicId,
      cpr_number: "555555-5555",
    });

    const journal = await JournalModel.create({
      patient_id: patient._id,
      entries: [],
    });

    const res = await request(app)
      .get("/api/doctors/journals")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].patientName).toBe("Journal Patient");
    expect(res.body[0]).toHaveProperty("entryCount");
  });

  it("GET /journals/:id should return formatted journal entry details", async () => {
    const { token, userId: doctorId } = await createTestUser(
      "doctor",
      clinicId
    );

    const patient = await UserModel.create({
      name: "Entry Patient",
      email: "entry@example.com",
      password_hash: "hashed123",
      role: "patient",
      clinic_id: clinicId,
      cpr_number: "666666-6666",
    });

    const appointment = await AppointmentModel.create({
      doctor_id: doctorId,
      patient_id: patient._id,
      clinic_id: clinicId,
      date: new Date(),
      time: "09:00",
      status: "udført",
    });

    const entry = await JournalEntryModel.create({
      appointment_id: appointment._id,
      notes: "Patient klager over hovedpine",
      created_by_ai: false,
    });

    const journal = await JournalModel.create({
      patient_id: patient._id,
      entries: [entry._id],
    });

    const res = await request(app)
      .get(`/api/doctors/journals/${journal._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.entries.length).toBe(1);
    expect(res.body.entries[0].notes).toBe("Patient klager over hovedpine");
    expect(res.body.entries[0]).toHaveProperty("appointmentDate");
  });
});

// ******************************** PRESCRIPTIONS AND RECEPTS
describe("Doctor Prescription & TestResult Endpoints", () => {
  // ************ SKAL SLETTES INDEN AFLEVERING ************ Dette er en seeding i controlleren men bør alligevel testes for code veorage... kan slettes igen
  it("POST /test/create-testresults should create test result", async () => {
    const { token } = await createTestUser("doctor", clinicId);
    const { userId: patientId } = await createTestUser("patient", clinicId);

    const res = await request(app)
      .post("/api/doctors/test/create-testresults")
      .set("Authorization", `Bearer ${token}`)
      .send({
        patient_id: patientId,
        test_name: "Kolesterol",
        result: "5.2",
        date: new Date(),
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Testresultat oprettet");
    expect(res.body.newResult.test_name).toBe("Kolesterol");
  });

  it("POST /prescriptions should create a new prescription", async () => {
    const { token } = await createTestUser("doctor", clinicId);

    const patient = await createTestUser("patient", clinicId);

    const res = await request(app)
      .post("/api/doctors/prescriptions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        patient_id: patient.userId,
        medication_name: "Paracetamol",
        dosage: "500mg",
        instructions: "1 tablet 3 gange dagligt",
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Recept oprettet");
    expect(res.body.prescription.medication_name).toBe("Paracetamol");
  });

  it("GET /prescriptions/:patientId should return prescriptions for patient", async () => {
    const { token } = await createTestUser("doctor", clinicId);
    const { userId: patientId } = await createTestUser("patient", clinicId);

    await PrescriptionModel.create({
      patient_id: patientId,
      medication_name: "Ibuprofen",
      dosage: "400mg",
      instructions: "Efter behov",
      issued_date: new Date(),
    });

    const res = await request(app)
      .get(`/api/doctors/prescriptions/${patientId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body[0].medication_name).toBe("Ibuprofen");
  });

  it("GET /testresults/:patientId should return test results for patient", async () => {
    const { token } = await createTestUser("doctor", clinicId);
    const { userId: patientId } = await createTestUser("patient", clinicId);

    await TestResultModel.create({
      patient_id: patientId,
      test_name: "HbA1c",
      result: "5.6%",
      date: new Date(),
    });

    const res = await request(app)
      .get(`/api/doctors/testresults/${patientId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].test_name).toBe("HbA1c");
  });
});

// ************* EKSTRA TEST FOR EDGE CASES
describe("Doctor Error Handling and Edge Cases", () => {
  it("POST /prescriptions should return 400 if missing fields", async () => {
    const { token } = await createTestUser("doctor", clinicId);

    const res = await request(app)
      .post("/api/doctors/prescriptions")
      .set("Authorization", `Bearer ${token}`)
      .send({ patient_id: "123" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Alle felter skal udfyldes/i);
  });

  it("PATCH /appointments/:id/cancel should return 404 if appointment not found", async () => {
    const { token } = await createTestUser("doctor", clinicId);
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .patch(`/api/doctors/appointments/${fakeId}/cancel`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Appointment not found");
  });

  it("PATCH /appointments/:id/cancel should return 400 if already cancelled", async () => {
    const { token, userId: doctorId } = await createTestUser(
      "doctor",
      clinicId
    );
    const { userId: patientId } = await createTestUser("patient", clinicId);

    const appointment = await AppointmentModel.create({
      doctor_id: doctorId,
      patient_id: patientId,
      clinic_id: clinicId,
      date: new Date(),
      time: "12:00",
      status: "aflyst",
    });

    const res = await request(app)
      .patch(`/api/doctors/appointments/${appointment._id}/cancel`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Appointment already cancelled");
  });

  it("GET /journals/:id should return 404 if journal not found", async () => {
    const { token } = await createTestUser("doctor", clinicId);

    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/doctors/journals/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Journal not found");
  });

  //   doctor journal edge cases:
  it("GET /journals/:id should return 404 if journal not found", async () => {
    const { token } = await createTestUser("doctor", clinicId);

    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/doctors/journals/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Journal not found");
  });

  it("POST /test/create-journal-entry should return 400 for missing journalId", async () => {
    const { token } = await createTestUser("doctor", clinicId);

    const res = await request(app)
      .post("/api/doctors/test/create-journal-entry")
      .set("Authorization", `Bearer ${token}`)
      .send({
        appointmentId: new mongoose.Types.ObjectId(),
        notes: "Missing journal",
        created_by_ai: true,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/journalId.*appointmentId/i);
  });

  it("POST /test/create-journal-entry should return 400 for missing journalId", async () => {
    const { token } = await createTestUser("doctor", clinicId);

    const res = await request(app)
      .post("/api/doctors/test/create-journal-entry")
      .set("Authorization", `Bearer ${token}`)
      .send({
        appointmentId: "fake-id", // eller udelad
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(
      /journalId & appointmentId are neccessary/i
    );
  });
});
