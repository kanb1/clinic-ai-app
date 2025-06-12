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

      await MessageModel.create({
        sender_id: secretary._id,
        receiver_scope: "staff",
        content: "Staff besked",
        type: "besked",
        read: false,
      });

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
              // Manglende clinic_id som testet
              clinic_id: null,
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

      await UserModel.create({
        name: "Markus",
        role: "patient",
        clinic_id: secretary.clinic_id,
        email: "mark@test.com",
        phone: "123456",
        password_hash: "pass",
      });
      await UserModel.create({
        name: "Andrea",
        role: "patient",
        clinic_id: secretary.clinic_id,
        email: "andrea@test.com",
        phone: "654321",
        password_hash: "pass",
      });

      const res = await request(app)
        .get("/api/secretary/patients")
        .query({ search: "Markus" })
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].name).toMatch(/Markus/i);
    });

    it("should get doctors in the clinic", async () => {
      const { token, secretary } = await createSecretaryAndToken();

      await UserModel.create({
        name: "Simon læge",
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
      expect(res.body.some((doc: any) => doc.name === "Simon læge")).toBe(true);
    });
  });

  describe("Appointments & Availability", () => {
    it("should get all appointments for clinic", async () => {
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

      const doctor = await UserModel.create({
        name: "Dr. Manual",
        role: "doctor",
        clinic_id: secretary.clinic_id,
        email: `drmanual${Date.now()}@test.com`,
        phone: `1000${Date.now()}`,
        password_hash: "pass",
      });

      const slot = await AvailabilitySlotModel.create({
        doctor_id: doctor._id,
        clinic_id: secretary.clinic_id,
        date: new Date(),
        start_time: "10:00",
        end_time: "10:15",
        is_booked: false,
      });

      const patient = await UserModel.create({
        name: "Patient Manual",
        role: "patient",
        clinic_id: secretary.clinic_id,
        email: `patientmanual${Date.now()}@test.com`,
        phone: `5000${Date.now()}`,
        password_hash: "pass",
      });

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

      const updatedSlot = await AvailabilitySlotModel.findById(slot._id);
      expect(updatedSlot?.is_booked).toBe(true);
    });

    it("should reject creating appointment with already booked slot", async () => {
      const { token, secretary } = await createSecretaryAndToken();

      const doctor = await UserModel.create({
        name: "læge booked",
        role: "doctor",
        clinic_id: secretary.clinic_id,
        email: "booked@test.com",
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

      const doctor = await UserModel.create({
        name: "LægeNote",
        role: "doctor",
        clinic_id: secretary.clinic_id,
        email: `lnote${Date.now()}@test.com`,
        phone: `2000${Date.now()}`,
        password_hash: "pass",
      });

      const patient = await UserModel.create({
        name: "PatientNote",
        role: "patient",
        clinic_id: secretary.clinic_id,
        email: `pnote${Date.now()}@test.com`,
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

      // Forsøg at tilføje ny note  og den skkal fejle
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
        .send({ note: "" });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Ugyldige input/i);
    });

    it("should return 400 if slot is not available or already booked", async () => {
      const { token, secretary } = await createSecretaryAndToken();

      const bookedSlot = await AvailabilitySlotModel.create({
        doctor_id: new mongoose.Types.ObjectId(),
        clinic_id: secretary.clinic_id,
        date: new Date(),
        start_time: "09:00",
        end_time: "09:15",
        is_booked: true,
      });

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

      await UserModel.deleteMany({ role: "doctor" });

      const res = await request(app)
        .get("/api/secretary/check-and-seed-slots")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/Ingen læger fundet/i);
    });
  });
});
