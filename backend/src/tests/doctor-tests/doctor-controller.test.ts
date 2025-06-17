import request from "supertest";
import mongoose from "mongoose";
import app from "../../index";
// midlertidig mongodb i hukommelsen -> bruger ik egen db
import { MongoMemoryServer } from "mongodb-memory-server";
import { AppointmentModel } from "../../models/appointment.model";
import { UserModel } from "../../models/user.model";
import { JournalModel } from "../../models/journal.model";
import { PrescriptionModel } from "../../models/prescription.model";
import { TestResultModel } from "../../models/testresult.model";
import jwt from "jsonwebtoken";
import { createDoctorWithToken } from "../test-utils/createDoctorWithToken";
import { ChatSessionModel } from "../../models/chatsession.model";
import { JournalEntryModel } from "../../models/journalentry.model";

let mongoServer: MongoMemoryServer;

// *********Test Setup før og efter*********
// *********Test Setup før og efter*********
// *********Test Setup før og efter*********

// før alle test:
beforeAll(async () => {
  // start in-memory mongodb-server
  mongoServer = await MongoMemoryServer.create();
  // forbind mongoose til test-db
  await mongoose.connect(mongoServer.getUri());
});

// efter alle test:
afterAll(async () => {
  // afbryd forbindelse
  await mongoose.disconnect();
  // stop test-server
  await mongoServer.stop();
});

// rydder db før hver test
// tests skal ik påvirke hinanden
beforeEach(async () => {
  await UserModel.deleteMany({});
  await AppointmentModel.deleteMany({});
  await JournalModel.deleteMany({});
  await PrescriptionModel.deleteMany({});
  await TestResultModel.deleteMany({});
});

// *********Test Setup før og efter*********
// *********Test Setup før og efter*********
// *********Test Setup før og efter*********

// describe -> starter testsuite
// it -> definerer en test
describe("Doctor  Controller", () => {
  describe("Doctor Appointments", () => {
    it("should get today's appointments", async () => {
      const { token, clinicId, doctor } = await createDoctorWithToken();
      const patient = await UserModel.create({
        name: "Patient A",
        email: `a-${Date.now()}@test.com`,
        phone: "12345678",
        password_hash: "1234",
        role: "patient",
        clinic_id: clinicId,
      });

      await AppointmentModel.create({
        clinic_id: clinicId,
        doctor_id: doctor._id,
        patient_id: patient._id,
        date: new Date(),
        time: "10:00",
        status: "bekræftet",
      });

      const res = await request(app)
        .get("/api/doctors/appointments/today")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.appointments.length).toBeGreaterThan(0);
    });

    // Hent dagens aftaler med pagination -> sideinddeling med page og limit
    it("should get paginated appointment details", async () => {
      const { token, clinicId, doctor } = await createDoctorWithToken();
      const patient = await UserModel.create({
        name: "Patient Paginated",
        email: `page-${Date.now()}@test.com`,
        phone: "12345678",
        password_hash: "1234",
        role: "patient",
        clinic_id: clinicId,
      });

      await AppointmentModel.create({
        clinic_id: clinicId,
        doctor_id: doctor._id,
        patient_id: patient._id,
        date: new Date(),
        time: "10:00",
        status: "bekræftet",
      });

      // beder om side 1 med maks 5 resultater
      const res = await request(app)
        .get("/api/doctors/appointments/today-details?page=1&limit=5")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      // viser korrekt sidetal
      expect(res.body.page).toBe(1);
    });

    it("should cancel an appointment", async () => {
      const { token, clinicId, doctor } = await createDoctorWithToken();
      const patient = await UserModel.create({
        name: "Cancel Patient",
        email: `cancel-${Date.now()}@test.com`,
        phone: "12345678",
        password_hash: "1234",
        role: "patient",
        clinic_id: clinicId,
      });

      const appointment = await AppointmentModel.create({
        clinic_id: clinicId,
        doctor_id: doctor._id,
        patient_id: patient._id,
        date: new Date(),
        time: "11:00",
        status: "bekræftet",
      });

      const res = await request(app)
        .patch(`/api/doctors/appointments/${appointment._id}/cancel`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.appointment.status).toBe("aflyst");
    });

    it("should return doctor's calendar appointments", async () => {
      const { token, clinicId, doctor } = await createDoctorWithToken();
      const patient = await UserModel.create({
        name: "Calendar Patient",
        email: `calendar-${Date.now()}@test.com`,
        phone: "12345678",
        password_hash: "1234",
        role: "patient",
        clinic_id: clinicId,
      });

      await AppointmentModel.create({
        doctor_id: doctor._id,
        patient_id: patient._id,
        clinic_id: clinicId,
        date: new Date(),
        time: "12:00",
        status: "bekræftet",
      });

      const res = await request(app)
        .get("/api/doctors/appointments")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it("should return 400 if appointment is already cancelled", async () => {
      const { token, clinicId, doctor } = await createDoctorWithToken();
      const patient = await UserModel.create({
        name: "Already Cancelled",
        email: `cancelled-${Date.now()}@test.com`,
        phone: "12345678",
        password_hash: "1234",
        role: "patient",
        clinic_id: clinicId,
      });

      const appointment = await AppointmentModel.create({
        clinic_id: clinicId,
        doctor_id: doctor._id,
        patient_id: patient._id,
        date: new Date(),
        time: "14:00",
        status: "aflyst",
      });

      const res = await request(app)
        .patch(`/api/doctors/appointments/${appointment._id}/cancel`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Appointment already cancelled");
    });

    it("should return 404 if appointment is not found", async () => {
      const { token } = await createDoctorWithToken();
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .patch(`/api/doctors/appointments/${fakeId}/cancel`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Appointment not found");
    });

    it("should return 404 if appointment does not exist", async () => {
      const { token } = await createDoctorWithToken();
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .patch(`/api/doctors/appointments/${fakeId}/cancel`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Appointment not found");
    });
  });

  describe("Doctor Patients", () => {
    it("should return patients for doctor", async () => {
      const { token, clinicId } = await createDoctorWithToken();
      await UserModel.create({
        name: "Patient X",
        email: `x-${Date.now()}@test.com`,
        phone: "12345678",
        password_hash: "1234",
        role: "patient",
        clinic_id: clinicId,
      });

      const res = await request(app)
        .get("/api/doctors/patients")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
    it("should return patient details", async () => {
      const { token, clinicId } = await createDoctorWithToken();
      const patient = await UserModel.create({
        name: "Detail Patient",
        email: `detail-${Date.now()}@test.com`,
        phone: "12345678",
        password_hash: "1234",
        role: "patient",
        clinic_id: clinicId,
      });

      const res = await request(app)
        .get(`/api/doctors/patients/${patient._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Detail Patient");
    });
    it("should return 404 if patient is not found", async () => {
      const { token } = await createDoctorWithToken();
      const fakePatientId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .get(`/api/doctors/patients/${fakePatientId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Patient not found");
    });
  });

  describe("Doctor Journals", () => {
    it("should return journal overview", async () => {
      const { token, clinicId } = await createDoctorWithToken();
      const patient = await UserModel.create({
        name: "Journal Patient",
        email: `journal-${Date.now()}@test.com`,
        phone: "12345678",
        password_hash: "1234",
        role: "patient",
        clinic_id: clinicId,
      });

      // opretter en journal med tom entries-liste til nyoprettet patient
      await JournalModel.create({
        patient_id: patient._id,
        entries: [],
      });

      const res = await request(app)
        .get("/api/doctors/journals")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      // bør vise ovenstående journal
      expect(res.body.length).toBeGreaterThan(0);
    });

    it("should return journal by ID", async () => {
      const { token, clinicId } = await createDoctorWithToken();
      const patient = await UserModel.create({
        name: "Journal ID Patient",
        email: `jid-${Date.now()}@test.com`,
        phone: "12345678",
        password_hash: "1234",
        role: "patient",
        clinic_id: clinicId,
      });

      const journal = await JournalModel.create({
        patient_id: patient._id,
        entries: [],
      });

      const res = await request(app)
        .get(`/api/doctors/journals/${journal._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.journalId).toBe(String(journal._id));
    });

    it("should return filtered journal overview with search", async () => {
      const { token, clinicId } = await createDoctorWithToken();
      const patient = await UserModel.create({
        name: "Mads Mikkelsen",
        email: "mads@test.com",
        password_hash: "test",
        role: "patient",
        clinic_id: clinicId,
        cpr_number: "010101-1234",
      });

      await JournalModel.create({ patient_id: patient._id, entries: [] });

      const res = await request(app)
        .get("/api/doctors/journals?search=mads")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body[0].patientName).toBe("Mads Mikkelsen");
    });

    it("should return full journal with entries and populated doctor info", async () => {
      const { token, clinicId, doctor } = await createDoctorWithToken();
      const patient = await UserModel.create({
        name: "Populated Patient",
        email: "pop@test.com",
        password_hash: "test",
        role: "patient",
        clinic_id: clinicId,
      });

      const appointment = await AppointmentModel.create({
        doctor_id: doctor._id,
        patient_id: patient._id,
        clinic_id: clinicId,
        date: new Date(),
        time: "10:00",
        status: "bekræftet",
      });

      const journal = await JournalModel.create({
        patient_id: patient._id,
        entries: [],
      });

      const journalEntry = await JournalEntryModel.create({
        appointment_id: appointment._id,
        notes: "some entry",
        created_by_ai: false,
      });

      journal.entries.push(journalEntry._id as mongoose.Types.ObjectId);
      await journal.save();

      const res = await request(app)
        .get(`/api/doctors/journals/${journal._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.entries[0].notes).toBe("some entry");
    });
    it("should return 404 if journal is not found", async () => {
      const { token } = await createDoctorWithToken();
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .get(`/api/doctors/journals/${fakeId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Journal not found");
    });
  });

  describe("Doctor Prescriptions", () => {
    it("should create a prescription", async () => {
      const { token, clinicId } = await createDoctorWithToken();
      const patient = await UserModel.create({
        name: "Rx Patient",
        email: `rx-${Date.now()}@test.com`,
        phone: "12345678",
        password_hash: "1234",
        role: "patient",
        clinic_id: clinicId,
      });

      const res = await request(app)
        .post("/api/doctors/prescriptions")
        .set("Authorization", `Bearer ${token}`)
        .send({
          patient_id: patient._id,
          medication_name: "Ibuprofen",
          dosage: "200mg",
          instructions: "1 gang dagligt",
        });

      expect(res.status).toBe(201);
      expect(res.body.prescription.medication_name).toBe("Ibuprofen");
    });

    it("should get prescriptions by patient", async () => {
      const { token, clinicId } = await createDoctorWithToken();
      const patient = await UserModel.create({
        name: "Rx Patient 2",
        email: `rx2-${Date.now()}@test.com`,
        phone: "12345678",
        password_hash: "1234",
        role: "patient",
        clinic_id: clinicId,
      });

      await PrescriptionModel.create({
        patient_id: patient._id,
        medication_name: "Paracetamol",
        dosage: "500mg",
        instructions: "2 gange dagligt",
        issued_date: new Date(),
      });

      const res = await request(app)
        .get(`/api/doctors/prescriptions/${patient._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe("Doctor Test Results", () => {
    it("should get test results by patient", async () => {
      const { token, clinicId } = await createDoctorWithToken();
      const patient = await UserModel.create({
        name: "Test Result Patient",
        email: `testres-${Date.now()}@test.com`,
        phone: "12345678",
        password_hash: "1234",
        role: "patient",
        clinic_id: clinicId,
      });

      await TestResultModel.create({
        patient_id: patient._id,
        test_name: "Blodprøve",
        result: "Normal",
        date: new Date(),
      });

      const res = await request(app)
        .get(`/api/doctors/testresults/${patient._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe("Doctor AI Notes", () => {
    it("should get AI chat session for an appointment", async () => {
      const { token, clinicId } = await createDoctorWithToken();
      const patient = await UserModel.create({
        name: "AI Chat Patient",
        email: `aichat-${Date.now()}@test.com`,
        phone: "12345678",
        password_hash: "1234",
        role: "patient",
        clinic_id: clinicId,
      });

      const appointment = await AppointmentModel.create({
        clinic_id: clinicId,
        doctor_id: new mongoose.Types.ObjectId(),
        patient_id: patient._id,
        date: new Date(),
        time: "15:00",
        status: "bekræftet",
      });

      await ChatSessionModel.create({
        saved_to_appointment_id: appointment._id,
        summary_for_doctor: "AI Summary here",
        messages: [
          { user: "Hej", ai: "Hej med dig!" },
          {
            user: "Jeg har ondt i hovedet",
            ai: "Det kan skyldes flere ting...",
          },
        ],
        patient_id: patient._id,
      });

      const res = await request(app)
        .get(`/api/doctors/ai-notes/${appointment._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.summary_for_doctor).toBe("AI Summary here");
    });
  });

  describe("Error Handling/validation", () => {
    it("should return 400 if journalId or appointmentId is missing", async () => {
      const { token } = await createDoctorWithToken();

      const res = await request(app)
        .post("/api/doctors/test/create-journal-entry")
        .set("Authorization", `Bearer ${token}`)
        .send({
          notes: "Missing IDs",
          created_by_ai: false,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("journalId & appointmentId are neccessary");
    });

    it("should return 404 if patient is not found", async () => {
      const { token } = await createDoctorWithToken();
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .get(`/api/doctors/patients/${fakeId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Patient not found");
    });
  });
});
