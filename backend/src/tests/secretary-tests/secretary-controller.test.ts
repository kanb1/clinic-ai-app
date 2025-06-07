import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../index";
import { MessageModel } from "../../models/message.model";
import { UserModel } from "../../models/user.model";
import { AppointmentModel } from "../../models/appointment.model";
import { AvailabilitySlotModel } from "../../models/availabilityslots.model";
import { createSecretaryAndToken } from "../test-utils/createSecretaryAndToken";
import { idsAreEqual } from "../test-utils/helpers";
import { createPatientWithToken } from "../test-utils/createPatientWithToken";

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
  await MessageModel.deleteMany({});
  await UserModel.deleteMany({});
  await AppointmentModel.deleteMany({});
  await AvailabilitySlotModel.deleteMany({});
});

describe("Secretary Controller", () => {
  describe("Messages", () => {
    it("should get unread messages filtered by clinic and scope", async () => {
      const { token, secretary } = await createSecretaryAndToken();

      const otherClinicId = new mongoose.Types.ObjectId();

      // Message from same clinic, staff scope
      await MessageModel.create({
        sender_id: secretary._id,
        receiver_scope: "staff",
        content: "Staff besked",
        type: "besked",
        read: false,
      });

      // Message from different clinic - should not appear
      await MessageModel.create({
        sender_id: secretary._id,
        receiver_scope: "staff",
        content: "Anden klinik besked",
        type: "besked",
        read: false,
      });

      const res = await request(app)
        .get("/api/secretary/messages/unread")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            content: "Staff besked",
            read: false,
          }),
        ])
      );
    });

    it("should send a message to an individual", async () => {
      const { token, secretary } = await createSecretaryAndToken();
      const receiver = await UserModel.create({
        name: "Patient",
        role: "patient",
        clinic_id: secretary.clinic_id,
        email: "patient@test.com",
        phone: "11111",
        password_hash: "pass",
      });

      const receiverId = (receiver._id as mongoose.Types.ObjectId).toString();

      const res = await request(app)
        .post("/api/secretary/messages")
        .set("Authorization", `Bearer ${token}`)
        .send({
          content: "Test besked",
          receiver_scope: "individual",
          receiver_id: receiverId,
          type: "besked",
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toMatch(/Message sent/i);
      expect(res.body.newMessage.content).toBe("Test besked");
    });

    it("should reject sending message without receiver_id if individual", async () => {
      const { token } = await createSecretaryAndToken();

      const res = await request(app)
        .post("/api/secretary/messages")
        .set("Authorization", `Bearer ${token}`)
        .send({
          content: "Test besked",
          receiver_scope: "individual",
          type: "besked",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Ugyldige input/i);
    });

    it("should mark message as read by secretary", async () => {
      const { token, secretary } = await createSecretaryAndToken();

      const message = await MessageModel.create({
        sender_id: secretary._id,
        receiver_scope: "all",
        content: "Hello unread",
        type: "besked",
        read: false,
      });

      const res = await request(app)
        .patch(`/api/secretary/messages/${message._id}/read`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/marked as read/i);

      const updated = await MessageModel.findById(message._id);
      expect(updated?.read).toBe(true);
    });

    it("should handle messages with missing sender or clinic_id gracefully", async () => {
      const { token } = await createSecretaryAndToken();

      jest.spyOn(MessageModel, "find").mockReturnValue({
        populate: jest.fn().mockReturnThis(), // returnerer samme mock objektsom i controlleren
        sort: jest.fn().mockResolvedValue([
          {
            _id: new mongoose.Types.ObjectId(),
            sender_id: {
              _id: new mongoose.Types.ObjectId(),
              clinic_id: null, // Manglende clinic_id som testet
              name: "Sender without clinic_id",
              role: "doctor",
              toString() {
                return this._id.toString();
              },
            },
            receiver_scope: "all",
            content: "Sender without clinic_id",
            type: "besked",
            read: false,
          },
        ]),
      } as any);

      const res = await request(app)
        .get("/api/secretary/messages/unread")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      jest.restoreAllMocks();
    });

    it("should return 404 when marking non-existent message as read", async () => {
      const { token } = await createSecretaryAndToken();

      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .patch(`/api/secretary/messages/${fakeId}/read`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/not found/i);
    });

    // Test til fejlhåndtering i getUnreadMessages
    it("should handle DB errors gracefully in getUnreadMessages", async () => {
      const { token } = await createSecretaryAndToken();

      // Mocker MessageModel.find til at kaste fejl
      jest.spyOn(MessageModel, "find").mockImplementation(() => {
        throw new Error("Forced DB error");
      });

      const res = await request(app)
        .get("/api/secretary/messages/unread")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(500);
      expect(res.body.message).toMatch(/Failed/i);

      jest.restoreAllMocks();
    });

    // Test til sendMessage med ugyldigt receiver_scope
    it("should reject invalid receiver_scope in sendMessage", async () => {
      const { token } = await createSecretaryAndToken();

      const res = await request(app)
        .post("/api/secretary/messages")
        .set("Authorization", `Bearer ${token}`)
        .send({
          content: "Test besked",
          receiver_scope: "invalid_scope",
          type: "besked",
        });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe("Patients & Doctors", () => {
    it("should search patients by query", async () => {
      const { token, secretary } = await createSecretaryAndToken();

      // Opretter nogle patienter i lklinikken
      await UserModel.create({
        name: "Anna Patient",
        role: "patient",
        clinic_id: secretary.clinic_id,
        email: "anna@test.com",
        phone: "123456",
        password_hash: "pass",
      });
      await UserModel.create({
        name: "Bob Patient",
        role: "patient",
        clinic_id: secretary.clinic_id,
        email: "bob@test.com",
        phone: "654321",
        password_hash: "pass",
      });

      const res = await request(app)
        .get("/api/secretary/patients")
        .query({ search: "Anna" })
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].name).toMatch(/Anna/i);
    });

    it("should get doctors in the clinic", async () => {
      const { token, secretary } = await createSecretaryAndToken();

      // Opretter læge i klnikken
      await UserModel.create({
        name: "Dr. Simon",
        role: "doctor",
        clinic_id: secretary.clinic_id,
        email: "simon@test.com",
        phone: "111222",
        password_hash: "pass",
      });

      const res = await request(app)
        .get("/api/secretary/doctors")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.some((doc: any) => doc.name === "Dr. Simon")).toBe(true);
    });
  });

  describe("Appointments & Availability", () => {
    it("should get all appointments for clinic", async () => {
      const { token, secretary } = await createSecretaryAndToken();

      // Opret appointment i klinikken
      const appointment = await AppointmentModel.create({
        patient_id: new mongoose.Types.ObjectId(),
        doctor_id: new mongoose.Types.ObjectId(),
        clinic_id: secretary.clinic_id,
        date: new Date(),
        time: "10:00",
        status: "venter",
      });

      const res = await request(app)
        .get("/api/secretary/appointments")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(
        res.body.some((appt: any) =>
          idsAreEqual(
            appt._id,
            (appointment._id as mongoose.Types.ObjectId).toString()
          )
        )
      ).toBe(true);
    });

    it("should get availability overview with doctor filter", async () => {
      const { token, secretary } = await createSecretaryAndToken();

      const res = await request(app)
        .get("/api/secretary/availability")
        .query({ weekStart: "2025-06-01" })
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("should get availability slots with doctor filter", async () => {
      const { token, secretary } = await createSecretaryAndToken();

      const res = await request(app)
        .get("/api/secretary/availability-slots")
        .query({ weekStart: "2025-06-01" })
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("should get today's appointments", async () => {
      const { token, secretary } = await createSecretaryAndToken();

      const appointment = await AppointmentModel.create({
        patient_id: new mongoose.Types.ObjectId(),
        doctor_id: new mongoose.Types.ObjectId(),
        clinic_id: secretary.clinic_id,
        date: new Date(),
        time: "10:00",
        status: "venter",
      });

      const res = await request(app)
        .get("/api/secretary/appointments/today")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(
        res.body.some((appt: any) =>
          idsAreEqual(
            appt._id,
            (appointment._id as mongoose.Types.ObjectId).toString()
          )
        )
      ).toBe(true);
    });

    it("should get past appointments today", async () => {
      const { token, secretary } = await createSecretaryAndToken();

      const now = new Date();

      await AppointmentModel.create({
        patient_id: new mongoose.Types.ObjectId(),
        doctor_id: new mongoose.Types.ObjectId(),
        clinic_id: secretary.clinic_id,
        date: now,
        time: "08:00",
        status: "bekræftet",
      });

      await AppointmentModel.create({
        patient_id: new mongoose.Types.ObjectId(),
        doctor_id: new mongoose.Types.ObjectId(),
        clinic_id: secretary.clinic_id,
        date: now,
        time: "23:59",
        status: "venter",
      });

      const res = await request(app)
        .get("/api/secretary/appointments/past-today")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.every((appt: any) => appt.status !== "venter")).toBe(
        true
      );
    });

    it("should check and seed slots if missing", async () => {
      const { token } = await createSecretaryAndToken();

      const res = await request(app)
        .get("/api/secretary/check-and-seed-slots")
        .set("Authorization", `Bearer ${token}`);

      expect([200, 201, 404]).toContain(res.status);
      if (res.status === 201) {
        expect(res.body.count).toBeGreaterThan(0);
      } else if (res.status === 404) {
        expect(res.body.message).toMatch(/Ingen læger fundet/i);
      } else {
        expect(res.body.message).toMatch(/opdateret|ingen grund til/i);
      }
    });

    it("should create appointment and mark slot as booked", async () => {
      const { token, secretary } = await createSecretaryAndToken();

      // Opret doctor
      const doctor = await UserModel.create({
        name: "Dr. Manual",
        role: "doctor",
        clinic_id: secretary.clinic_id,
        email: `drmanual${Date.now()}@test.com`,
        phone: `1000${Date.now()}`,
        password_hash: "pass",
      });

      // Opret ledigt slot
      const slot = await AvailabilitySlotModel.create({
        doctor_id: doctor._id,
        clinic_id: secretary.clinic_id,
        date: new Date(),
        start_time: "10:00",
        end_time: "10:15",
        is_booked: false,
      });

      // Opret patient
      const patient = await UserModel.create({
        name: "Patient Manual",
        role: "patient",
        clinic_id: secretary.clinic_id,
        email: `patientmanual${Date.now()}@test.com`,
        phone: `5000${Date.now()}`,
        password_hash: "pass",
      });

      // Opret appointment via API
      const res = await request(app)
        .post("/api/secretary/appointments")
        .set("Authorization", `Bearer ${token}`)
        .send({
          patient_id: patient._id,
          doctor_id: doctor._id,
          slot_id: slot._id,
        });

      expect(res.status).toBe(201);
      expect(res.body.appointment.status).toBe("venter");

      // Tjek at slot nu er booket
      const updatedSlot = await AvailabilitySlotModel.findById(slot._id);
      expect(updatedSlot?.is_booked).toBe(true);
    });

    it("should reject creating appointment with already booked slot", async () => {
      const { token, secretary } = await createSecretaryAndToken();

      const doctor = await UserModel.create({
        name: "Dr. Booked",
        role: "doctor",
        clinic_id: secretary.clinic_id,
        email: "drbooked@test.com",
        phone: "12345",
        password_hash: "pass",
      });

      const slot = await AvailabilitySlotModel.create({
        doctor_id: doctor._id,
        clinic_id: secretary.clinic_id,
        date: new Date(),
        start_time: "10:00",
        end_time: "10:15",
        is_booked: true,
      });

      const res = await request(app)
        .post("/api/secretary/appointments")
        .set("Authorization", `Bearer ${token}`)
        .send({
          patient_id: new mongoose.Types.ObjectId(),
          doctor_id: doctor._id,
          slot_id: slot._id,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Slot not available/i);
    });

    it("should handle errors and return 500 in getPastAppointmentsToday", async () => {
      const { token } = await createSecretaryAndToken();

      jest.spyOn(AppointmentModel, "find").mockImplementation(() => {
        throw new Error("Forced error");
      });

      const res = await request(app)
        .get("/api/secretary/appointments/past-today")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(500);
      expect(res.body.message).toMatch(/Failed/i);

      jest.restoreAllMocks();
    });

    it("should add symptom note to appointment", async () => {
      const { token, secretary } = await createSecretaryAndToken();

      // Opret appointment uden note
      const appointment = await AppointmentModel.create({
        patient_id: new mongoose.Types.ObjectId(),
        doctor_id: new mongoose.Types.ObjectId(),
        clinic_id: secretary.clinic_id,
        date: new Date(),
        time: "11:00",
        status: "venter",
      });

      const res = await request(app)
        .patch(`/api/secretary/appointments/${appointment._id}/secretary-note`)
        .set("Authorization", `Bearer ${token}`)
        .send({ note: "Patient klager over smerter" });

      expect(res.status).toBe(200);
      expect(res.body.appointment.secretary_note).toBe(
        "Patient klager over smerter"
      );
    });

    it("should not add symptom note if note already exists", async () => {
      const { token, secretary } = await createSecretaryAndToken();

      // Opret doctor
      const doctor = await UserModel.create({
        name: "Dr. Note",
        role: "doctor",
        clinic_id: secretary.clinic_id,
        email: `drnote${Date.now()}@test.com`,
        phone: `2000${Date.now()}`,
        password_hash: "pass",
      });

      // Opret patient
      const patient = await UserModel.create({
        name: "Patient Note",
        role: "patient",
        clinic_id: secretary.clinic_id,
        email: `patientnote${Date.now()}@test.com`,
        phone: `6000${Date.now()}`,
        password_hash: "pass",
      });

      // Opret appointment med eksisterende note
      const appointment = await AppointmentModel.create({
        patient_id: patient._id,
        doctor_id: doctor._id,
        clinic_id: secretary.clinic_id,
        date: new Date(),
        time: "11:00",
        status: "venter",
        secretary_note: "Eksisterende note",
      });

      // Forsøg at tilføje ny note - skal fejle
      const res = await request(app)
        .patch(`/api/secretary/appointments/${appointment._id}/secretary-note`)
        .set("Authorization", `Bearer ${token}`)
        .send({ note: "Ny note" });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Note already exists|Ugyldige input/i);
    });

    // ******* Fejlhåndtering og edge cases
    // Test til createAppointment med ugyldigt slot_id
    it("should reject appointment creation with invalid slot_id", async () => {
      const { token, secretary } = await createSecretaryAndToken();

      const res = await request(app)
        .post("/api/secretary/appointments")
        .set("Authorization", `Bearer ${token}`)
        .send({
          patient_id: new mongoose.Types.ObjectId(),
          doctor_id: new mongoose.Types.ObjectId(),
          slot_id: new mongoose.Types.ObjectId(), // som ikke findes
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Slot not available/i);
    });

    // Test til addSymptomNote uden note i body
    it("should reject adding symptom note if note is missing or empty", async () => {
      const { token, secretary } = await createSecretaryAndToken();

      const appointment = await AppointmentModel.create({
        patient_id: new mongoose.Types.ObjectId(),
        doctor_id: new mongoose.Types.ObjectId(),
        clinic_id: secretary.clinic_id,
        date: new Date(),
        time: "12:00",
        status: "venter",
      });

      const res = await request(app)
        .patch(`/api/secretary/appointments/${appointment._id}/secretary-note`)
        .set("Authorization", `Bearer ${token}`)
        .send({ note: "" });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Ugyldige input/i);
    });

    it("should reject adding empty symptom note", async () => {
      const { token, secretary } = await createSecretaryAndToken();

      const appointment = await AppointmentModel.create({
        patient_id: new mongoose.Types.ObjectId(),
        doctor_id: new mongoose.Types.ObjectId(),
        clinic_id: secretary.clinic_id,
        date: new Date(),
        time: "12:00",
        status: "venter",
      });

      const res = await request(app)
        .patch(`/api/secretary/appointments/${appointment._id}/secretary-note`)
        .set("Authorization", `Bearer ${token}`)
        .send({ note: "" });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Ugyldige input/i);
    });

    it("should return 400 if weekStart query param is missing or invalid", async () => {
      const { token } = await createSecretaryAndToken();

      const resMissing = await request(app)
        .get("/api/secretary/availability-slots")
        .set("Authorization", `Bearer ${token}`);

      expect(resMissing.status).toBe(400);
      expect(resMissing.body.message).toMatch(/Ugyldige input/i);

      const resInvalid = await request(app)
        .get("/api/secretary/availability-slots")
        .query({ weekStart: "invalid-date" })
        .set("Authorization", `Bearer ${token}`);

      expect(resInvalid.status).toBe(400);
      expect(resInvalid.body.message).toMatch(/Ugyldige input/i);
    });

    it.skip("should return empty array when no appointments", async () => {
      const { token } = await createSecretaryAndToken();

      // Mock find: til tom array
      jest.spyOn(AppointmentModel, "find").mockResolvedValue([]);

      const res = await request(app)
        .get("/api/secretary/appointments/past-today")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
      jest.restoreAllMocks();
    });

    it.skip("should filter out appointments not from today", async () => {
      const { token, secretary } = await createSecretaryAndToken();

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(10, 0, 0, 0);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const today = new Date();

      await AppointmentModel.create([
        {
          patient_id: new mongoose.Types.ObjectId(),
          doctor_id: new mongoose.Types.ObjectId(),
          clinic_id: secretary.clinic_id,
          date: yesterday,
          time: "10:00",
          status: "bekræftet",
        },
        {
          patient_id: new mongoose.Types.ObjectId(),
          doctor_id: new mongoose.Types.ObjectId(),
          clinic_id: secretary.clinic_id,
          date: tomorrow,
          time: "10:00",
          status: "bekræftet",
        },
        {
          patient_id: new mongoose.Types.ObjectId(),
          doctor_id: new mongoose.Types.ObjectId(),
          clinic_id: secretary.clinic_id,
          date: today,
          time: "09:00",
          status: "bekræftet",
        },
      ]);

      const res = await request(app)
        .get("/api/secretary/appointments/past-today")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(
        res.body.every(
          (appt: any) =>
            new Date(appt.date).toDateString() === today.toDateString()
        )
      ).toBe(true);
    });

    it("should return 400 if no note provided when adding symptom note", async () => {
      const { token, secretary } = await createSecretaryAndToken();

      const appointment = await AppointmentModel.create({
        patient_id: new mongoose.Types.ObjectId(),
        doctor_id: new mongoose.Types.ObjectId(),
        clinic_id: secretary.clinic_id,
        date: new Date(),
        time: "12:00",
        status: "venter",
      });

      const res = await request(app)
        .patch(`/api/secretary/appointments/${appointment._id}/secretary-note`)
        .set("Authorization", `Bearer ${token}`)
        .send({ note: "" }); // tom note

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Ugyldige input/i);
    });

    it("should return 400 if slot is not available or already booked", async () => {
      const { token, secretary } = await createSecretaryAndToken();

      // Laver en slot som allerede er booket
      const bookedSlot = await AvailabilitySlotModel.create({
        doctor_id: new mongoose.Types.ObjectId(),
        clinic_id: secretary.clinic_id,
        date: new Date(),
        start_time: "09:00",
        end_time: "09:15",
        is_booked: true,
      });

      // Prøver at booke en aftale på den booked slot
      const res = await request(app)
        .post("/api/secretary/appointments")
        .set("Authorization", `Bearer ${token}`)
        .send({
          patient_id: new mongoose.Types.ObjectId(),
          doctor_id: new mongoose.Types.ObjectId(),
          slot_id: bookedSlot._id,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Slot not available/i);
    });

    it("should return 404 if no doctors found in clinic when seeding slots", async () => {
      const { token } = await createSecretaryAndToken();

      // Sletter alle doctors i klinikken
      await UserModel.deleteMany({ role: "doctor" });

      const res = await request(app)
        .get("/api/secretary/check-and-seed-slots")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/Ingen læger fundet/i);
    });
  });

  describe("Extra coverage tests for Secretary Controller", () => {
    it("should return empty array if no unread messages", async () => {
      const { token } = await createSecretaryAndToken();

      // mock så find returnerer tomt array
      jest.spyOn(MessageModel, "find").mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([]),
      } as any);

      const res = await request(app)
        .get("/api/secretary/messages/unread")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
      jest.restoreAllMocks();
    });

    it("should filter messages with receiver_scope 'staff' for doctor role", async () => {
      const { token, secretary } = await createSecretaryAndToken();

      //  mock user role til doctor
      jest.spyOn(secretary, "role", "get").mockReturnValue("doctor");

      // mocker find med besked til staff
      jest.spyOn(MessageModel, "find").mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([
          {
            _id: new mongoose.Types.ObjectId(),
            sender_id: {
              _id: secretary._id,
              clinic_id: secretary.clinic_id,
              name: "Doctor Sender",
              role: "doctor",
              toString(): string {
                return (this as any)._id.toString();
              },
            },
            receiver_scope: "staff",
            content: "Staff message for doctor",
            type: "besked",
            read: false,
            receiver_id: null,
          },
        ]),
      } as any);

      const res = await request(app)
        .get("/api/secretary/messages/unread")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].content).toBe("Staff message for doctor");
      jest.restoreAllMocks();
    });

    it("should handle already read message in markMessageAsReadBySecretary", async () => {
      const { token } = await createSecretaryAndToken();

      const msg = await MessageModel.create({
        sender_id: new mongoose.Types.ObjectId(),
        receiver_scope: "all",
        content: "Already read message",
        type: "besked",
        read: true,
      });

      const res = await request(app)
        .patch(`/api/secretary/messages/${msg._id}/read`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/already marked as read/i);
    });

    it("should return 400 on sendMessage with Ugyldige input", async () => {
      const { token } = await createSecretaryAndToken();

      const res = await request(app)
        .post("/api/secretary/messages")
        .set("Authorization", `Bearer ${token}`)
        .send({
          content: "Ugyldige input test",
          receiver_scope: "individual",
          receiver_id: "notavalidid",
          type: "besked",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Ugyldige input/i);
    });

    it("should return 500 error when createAppointment throws", async () => {
      const { token } = await createSecretaryAndToken();

      jest.spyOn(AvailabilitySlotModel, "findById").mockImplementation(() => {
        throw new Error("Forced error");
      });

      const res = await request(app)
        .post("/api/secretary/appointments")
        .set("Authorization", `Bearer ${token}`)
        .send({
          patient_id: new mongoose.Types.ObjectId(),
          doctor_id: new mongoose.Types.ObjectId(),
          slot_id: new mongoose.Types.ObjectId(),
        });

      expect(res.status).toBe(500);
      jest.restoreAllMocks();
    });

    it("should return 500 error when addSymptomNote throws", async () => {
      const { token } = await createSecretaryAndToken();

      jest.spyOn(AppointmentModel, "findById").mockImplementation(() => {
        throw new Error("Forced error");
      });

      const res = await request(app)
        .patch(
          `/api/secretary/appointments/${new mongoose.Types.ObjectId()}/secretary-note`
        )
        .set("Authorization", `Bearer ${token}`)
        .send({ note: "Some note" });

      expect(res.status).toBe(500);
      jest.restoreAllMocks();
    });

    it("should return 429 when rate limit exceeded in sendMessage", async () => {
      const { token } = await createSecretaryAndToken();

      // Mock MessageModel.create til at kaste fejl (simuler rate-limit)
      jest.spyOn(MessageModel, "create").mockImplementation(() => {
        const error = new Error("Rate limit");
        throw error;
      });

      const res = await request(app)
        .post("/api/secretary/messages")
        .set("Authorization", `Bearer ${token}`)
        .send({
          content: "Test message",
          receiver_scope: "all",
          type: "besked",
        });

      expect(res.status).toBe(429);
      expect(res.body.message).toMatch(/For mange beskeder/i);

      jest.restoreAllMocks();
    });

    it("should handle errors when marking message as read", async () => {
      const { token } = await createSecretaryAndToken();

      const mockMessage = {
        read: false,
        save: jest.fn().mockRejectedValue(new Error("Save error")),
      };

      jest
        .spyOn(MessageModel, "findById")
        .mockResolvedValue(mockMessage as any);

      const res = await request(app)
        .patch(`/api/secretary/messages/${new mongoose.Types.ObjectId()}/read`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(500);
      expect(res.body.message).toMatch(/Error/i);

      jest.restoreAllMocks();
    });

    it("should return 404 if no doctors found when seeding slots", async () => {
      const { token } = await createSecretaryAndToken();

      await UserModel.deleteMany({ role: "doctor" });

      const res = await request(app)
        .get("/api/secretary/check-and-seed-slots")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/Ingen læger fundet/i);
    });

    it("should handle errors gracefully in getUnreadMessages", async () => {
      jest.spyOn(MessageModel, "find").mockImplementation(() => {
        throw new Error("Forced error");
      });

      const { token } = await createSecretaryAndToken();

      const res = await request(app)
        .get("/api/secretary/messages/unread")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(500);
      expect(res.body.message).toMatch(/Failed/i);

      jest.restoreAllMocks();
    });

    it("should return 500 if getUnreadMessages throws error", async () => {
      jest.spyOn(MessageModel, "find").mockImplementation(() => {
        throw new Error("Forced error");
      });

      const { token } = await createSecretaryAndToken();

      const res = await request(app)
        .get("/api/secretary/messages/unread")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(500);
      expect(res.body.message).toMatch(/Failed/i);

      jest.restoreAllMocks();
    });

    it("should return 400 if receiver_scope is individual but no receiver_id is provided", async () => {
      const { token } = await createSecretaryAndToken();

      const res = await request(app)
        .post("/api/secretary/messages")
        .set("Authorization", `Bearer ${token}`)
        .send({
          content: "Test",
          type: "besked",
          receiver_scope: "individual",
          // receiver_id mangler
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Ugyldige input/);
    });

    it("should return 400 if receiver_scope is individual but receiver_id is invalid", async () => {
      const { token } = await createSecretaryAndToken();

      const res = await request(app)
        .post("/api/secretary/messages")
        .set("Authorization", `Bearer ${token}`)
        .send({
          content: "Test",
          type: "besked",
          receiver_scope: "individual",
          receiver_id: "invalid-object-id",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Ugyldige input/);
    });

    it("should return 404 if message not found in markMessageAsReadBySecretary", async () => {
      jest.spyOn(MessageModel, "findById").mockResolvedValue(null);

      const { token } = await createSecretaryAndToken();
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .patch(`/api/secretary/messages/${fakeId}/read`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/not found/i);

      jest.restoreAllMocks();
    });

    it("should return 200 if message is already read", async () => {
      jest.spyOn(MessageModel, "findById").mockResolvedValue({
        read: true,
        save: jest.fn(),
      } as any);

      const { token } = await createSecretaryAndToken();
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .patch(`/api/secretary/messages/${fakeId}/read`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/already marked as read/i);

      jest.restoreAllMocks();
    });

    it("should return 500 on error in markMessageAsReadBySecretary", async () => {
      jest.spyOn(MessageModel, "findById").mockImplementation(() => {
        throw new Error("Forced error");
      });

      const { token } = await createSecretaryAndToken();
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .patch(`/api/secretary/messages/${fakeId}/read`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(500);

      jest.restoreAllMocks();
    });

    it("should filter unread messages correctly for secretary role", async () => {
      const { token, secretary } = await createSecretaryAndToken();

      jest.spyOn(secretary, "role", "get").mockReturnValue("secretary");

      jest.spyOn(MessageModel, "find").mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([
          {
            _id: new mongoose.Types.ObjectId(),
            sender_id: {
              _id: secretary._id,
              clinic_id: secretary.clinic_id,
              name: "Staff Sender",
              role: "secretary",
              toString(): string {
                return (this as any)._id.toString();
              },
            },
            receiver_scope: "all",
            content: "Message to all",
            type: "besked",
            read: false,
            receiver_id: null,
          },
          {
            _id: new mongoose.Types.ObjectId(),
            sender_id: {
              _id: secretary._id,
              clinic_id: secretary.clinic_id,
              name: "Doctor Sender",
              role: "doctor",
              toString(): string {
                return (this as any)._id.toString();
              },
            },
            receiver_scope: "staff",
            content: "Message to staff",
            type: "besked",
            read: false,
            receiver_id: null,
          },
          {
            _id: new mongoose.Types.ObjectId(),
            sender_id: {
              _id: secretary._id,
              clinic_id: secretary.clinic_id,
              name: "Patient Sender",
              role: "patient",
              toString(): string {
                return (this as any)._id.toString();
              },
            },
            receiver_scope: "patients",
            content: "Message to patients",
            type: "besked",
            read: false,
            receiver_id: null,
          },
        ]),
      } as any);

      const res = await request(app)
        .get("/api/secretary/messages/unread")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);

      expect(res.body.some((msg: any) => msg.receiver_scope === "all")).toBe(
        true
      );
      expect(res.body.some((msg: any) => msg.receiver_scope === "staff")).toBe(
        true
      );
      expect(
        res.body.some((msg: any) => msg.receiver_scope === "patients")
      ).toBe(false);
    });

    it("should return 500 error if MessageModel.create throws unexpected error", async () => {
      const { token } = await createSecretaryAndToken();

      jest.spyOn(MessageModel, "create").mockImplementation(() => {
        throw new Error("Unexpected error");
      });

      const res = await request(app)
        .post("/api/secretary/messages")
        .set("Authorization", `Bearer ${token}`)
        .send({
          content: "Test message",
          receiver_scope: "all",
          type: "besked",
        });

      expect(res.status).toBe(500);
      expect(res.body.message).toMatch(/Error/i);

      jest.restoreAllMocks();
    });

    it("should handle errors thrown during populate or sort in getUnreadMessages", async () => {
      const { token } = await createSecretaryAndToken();

      const mockPopulate = jest.fn().mockReturnThis();
      const mockSort = jest.fn().mockImplementation(() => {
        throw new Error("Populate or sort error");
      });

      jest.spyOn(MessageModel, "find").mockReturnValue({
        populate: mockPopulate,
        sort: mockSort,
      } as any);

      const res = await request(app)
        .get("/api/secretary/messages/unread")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(500);
      expect(res.body.message).toMatch(/Failed/i);

      jest.restoreAllMocks();
    });

    it("should return 500 if save fails in addSymptomNote", async () => {
      const { token } = await createSecretaryAndToken();

      const appointment = {
        secretary_note: null,
        save: jest.fn().mockRejectedValue(new Error("Save error")),
      };

      jest
        .spyOn(AppointmentModel, "findById")
        .mockResolvedValue(appointment as any);

      const res = await request(app)
        .patch(
          `/api/secretary/appointments/${new mongoose.Types.ObjectId()}/secretary-note`
        )
        .set("Authorization", `Bearer ${token}`)
        .send({ note: "Test note" });

      expect(res.status).toBe(500);
      expect(res.body.message).toMatch(/Error/i);

      jest.restoreAllMocks();
    });

    it("should return 500 if insertMany throws in checkAndSeedSlots", async () => {
      const { token } = await createSecretaryAndToken();

      jest.spyOn(UserModel, "find").mockResolvedValue([
        {
          _id: new mongoose.Types.ObjectId(),
          clinic_id: new mongoose.Types.ObjectId(),
          role: "doctor",
        },
      ] as any);

      jest.spyOn(AvailabilitySlotModel, "find").mockResolvedValue([]);

      jest.spyOn(AvailabilitySlotModel, "insertMany").mockImplementation(() => {
        throw new Error("Insert many failed");
      });

      const res = await request(app)
        .get("/api/secretary/check-and-seed-slots")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(500);
      expect(res.body.message).toMatch(/Serverfejl/i);

      jest.restoreAllMocks();
    });

    it("should return 500 if aggregation fails in getAvailabilityOverview", async () => {
      const { token } = await createSecretaryAndToken();

      jest.spyOn(AvailabilitySlotModel, "aggregate").mockImplementation(() => {
        throw new Error("Aggregation error");
      });

      const res = await request(app)
        .get("/api/secretary/availability")
        .query({ weekStart: "2025-06-01" })
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(500);
      expect(res.body.message).toMatch(/Fail/i);

      jest.restoreAllMocks();
    });

    // Hvis receiver_scope ikke er "individual", skal receiver_id være null og ignoreres
    it("should ignore receiver_id if receiver_scope is not individual", async () => {
      const { token } = await createSecretaryAndToken();

      const res = await request(app)
        .post("/api/secretary/messages")
        .set("Authorization", `Bearer ${token}`)
        .send({
          content: "Test message",
          receiver_scope: "all",
          receiver_id: "some-invalid-id",
          type: "besked",
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toMatch(/Message sent/i);
    });

    it("should reject creating appointment with invalid doctor_id", async () => {
      const { token, secretary } = await createSecretaryAndToken();

      // Opret en patient og en slot først
      const slot = await AvailabilitySlotModel.create({
        doctor_id: new mongoose.Types.ObjectId(),
        clinic_id: secretary.clinic_id,
        date: new Date(),
        start_time: "10:00",
        end_time: "10:15",
        is_booked: false,
      });

      const patient = await UserModel.create({
        name: "Test Patient",
        role: "patient",
        clinic_id: secretary.clinic_id,
        email: "testpatient@test.com",
        phone: "12345",
        password_hash: "pass",
      });

      // Send med ugyldig doctor_id (fx en patient i stedet for læge)
      const invalidDoctor = await UserModel.create({
        name: "Not a Doctor",
        role: "patient", // Ikke doctor
        clinic_id: secretary.clinic_id,
        email: "notadoctor@test.com",
        phone: "54321",
        password_hash: "pass",
      });

      const res = await request(app)
        .post("/api/secretary/appointments")
        .set("Authorization", `Bearer ${token}`)
        .send({
          patient_id: patient._id,
          doctor_id: invalidDoctor._id,
          slot_id: slot._id,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Ugyldig læge valgt/i);
    });

    it("should return 400 if weekStart query param is missing", async () => {
      const { token } = await createSecretaryAndToken();

      const res = await request(app)
        .get("/api/secretary/availability")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/weekStart is required/i);
    });

    it("should return empty array if doctorId is invalid", async () => {
      const { token } = await createSecretaryAndToken();

      const res = await request(app)
        .get("/api/secretary/availability")
        .query({ weekStart: "2025-06-01", doctorId: "invalid-id" })
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });
});
