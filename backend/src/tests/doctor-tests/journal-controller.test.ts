import request from "supertest";
import app from "../../index";
import mongoose from "mongoose";
import { JournalModel } from "../../models/journal.model";
import { JournalEntryModel } from "../../models/journalentry.model";
import { AppointmentModel } from "../../models/appointment.model";
import { createDoctorAndPatient } from "../test-utils/createDoctorAndPatient";
import { MongoMemoryServer } from "mongodb-memory-server";

// globalt
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
  await JournalModel.deleteMany({});
  await JournalEntryModel.deleteMany({});
  await AppointmentModel.deleteMany({});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("Journal Controller", () => {
  it("should create a journal if none exists", async () => {
    const { doctorToken, patientId } = await createDoctorAndPatient();

    const res = await request(app)
      .get(`/api/doctors/journals/patient/${patientId}`)
      .set("Authorization", `Bearer ${doctorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.patientId).toBe(patientId.toString());
    expect(res.body.entryCount).toBe(0);
  }, 10000);

  it("should return existing journal if already exists", async () => {
    const { doctorToken, patientId } = await createDoctorAndPatient();

    const journal = await JournalModel.create({ patient_id: patientId });

    const res = await request(app)
      .get(`/api/doctors/journals/patient/${patientId}`)
      .set("Authorization", `Bearer ${doctorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.journalId).toBe(
      (journal._id as mongoose.Types.ObjectId).toString()
    );
  }, 10000);

  it("should return 500 if DB error occurs (getOrCreateJournal)", async () => {
    const { doctorToken, patientId } = await createDoctorAndPatient();

    jest.spyOn(JournalModel, "findOne").mockImplementationOnce(() => {
      throw new Error("Database error");
    });

    const res = await request(app)
      .get(`/api/doctors/journals/patient/${patientId}`)
      .set("Authorization", `Bearer ${doctorToken}`);

    expect(res.status).toBe(500);
    expect(res.body.message).toMatch(/Serverfejl/i);
  }, 10000);

  it("should create journal entry for appointment", async () => {
    const { doctorToken, patientId } = await createDoctorAndPatient();

    const journal = await JournalModel.create({ patient_id: patientId });

    const appointment = await AppointmentModel.create({
      patient_id: patientId,
      doctor_id: new mongoose.Types.ObjectId(),
      clinic_id: new mongoose.Types.ObjectId(),
      date: new Date(),
      time: "10:00",
      status: "bekræftet",
    });

    const res = await request(app)
      .post("/api/doctors/journalentry")
      .set("Authorization", `Bearer ${doctorToken}`)
      .send({
        journalId: journal._id,
        appointmentId: appointment._id,
        notes: "Patient havde feber",
      });

    expect(res.status).toBe(201);
    expect(res.body.entry.notes).toBe("Patient havde feber");
  }, 10000);

  it("should return 500 if journal entry creation fails", async () => {
    const { doctorToken } = await createDoctorAndPatient();

    jest.spyOn(JournalEntryModel, "create").mockImplementationOnce(() => {
      throw new Error("Journal fail");
    });

    const res = await request(app)
      .post("/api/doctors/journalentry")
      .set("Authorization", `Bearer ${doctorToken}`)
      .send({
        journalId: new mongoose.Types.ObjectId(),
        appointmentId: new mongoose.Types.ObjectId(),
        notes: "Crash",
      });

    expect(res.status).toBe(500);
    expect(res.body.message).toMatch(/Serverfejl/);
  }, 10000);

  it("should get appointments with journal entries", async () => {
    const { doctorToken, patientId, doctorId, clinicId } =
      await createDoctorAndPatient();

    const appointment = await AppointmentModel.create({
      patient_id: patientId,
      doctor_id: doctorId,
      clinic_id: clinicId,
      date: new Date(),
      time: "11:00",
      status: "bekræftet",
      secretary_note: "Note fra sekretær",
    });

    const entry = await JournalEntryModel.create({
      appointment_id: appointment._id,
      notes: "Alt ok",
      created_by_ai: false,
    });

    await JournalModel.create({
      patient_id: patientId,
      entries: [entry._id],
    });

    const res = await request(app)
      .get(`/api/doctors/appointments-with-journal/${patientId}`)
      .set("Authorization", `Bearer ${doctorToken}`);

    expect(res.status).toBe(200);
    expect(res.body[0].journalEntry.notes).toBe("Alt ok");
    expect(res.body[0].status).toBe("bekræftet");
  }, 10000);

  it("should return 500 if appointments/journal fetch fails", async () => {
    const { doctorToken, patientId } = await createDoctorAndPatient();

    jest.spyOn(AppointmentModel, "find").mockImplementationOnce(() => {
      throw new Error("DB crash");
    });

    const res = await request(app)
      .get(`/api/doctors/appointments-with-journal/${patientId}`)
      .set("Authorization", `Bearer ${doctorToken}`);

    expect(res.status).toBe(500);
    expect(res.body.message).toMatch(/Serverfejl/);
  }, 10000);
});

afterAll(async () => {
  await mongoose.disconnect();
});
