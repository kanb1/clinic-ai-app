import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../index";
import { AppointmentModel } from "../../models/appointment.model";
import { createTestUser } from "../test-utils/testUtils";

let mongoServer: MongoMemoryServer;
let patientToken: string;
let patientId: mongoose.Types.ObjectId;
let clinicId: mongoose.Types.ObjectId;
let doctorId: mongoose.Types.ObjectId;

let confirmableId: mongoose.Types.ObjectId;
let cancelableId: mongoose.Types.ObjectId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  clinicId = new mongoose.Types.ObjectId();
  doctorId = new mongoose.Types.ObjectId();

  const { token, userId } = await createTestUser("patient", clinicId);
  patientToken = token;
  patientId = userId;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  await AppointmentModel.create([
    {
      patient_id: patientId,
      doctor_id: doctorId,
      clinic_id: clinicId,
      date: tomorrow,
      status: "venter",
      time: "14:30",
    },
    {
      patient_id: patientId,
      doctor_id: doctorId,
      clinic_id: clinicId,
      date: tomorrow,
      status: "bekræftet",
      time: "13:30",
    },
    {
      patient_id: patientId,
      doctor_id: doctorId,
      clinic_id: clinicId,
      date: tomorrow,
      status: "aflyst",
      time: "12:30",
    },
    {
      patient_id: patientId,
      doctor_id: doctorId,
      clinic_id: clinicId,
      date: yesterday,
      status: "bekræftet",
      time: "11:30",
    },
  ]);

  // Opretter en aftale som kan bekræftes og en som kan aflyses
  const confirmable = await AppointmentModel.create({
    patient_id: patientId,
    doctor_id: doctorId,
    clinic_id: clinicId,
    date: tomorrow,
    status: "venter",
    time: "10:30",
  });

  confirmableId = confirmable._id as mongoose.Types.ObjectId;

  // og en som kan aflyses
  const cancelable = await AppointmentModel.create({
    patient_id: patientId,
    doctor_id: doctorId,
    clinic_id: clinicId,
    date: tomorrow,
    status: "bekræftet",
    time: "16:30",
  });

  cancelableId = cancelable._id as mongoose.Types.ObjectId;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("GET /api/patients/appointments/upcoming", () => {
  it("should return only upcoming appointments with status 'bekræftet' or 'venter'", async () => {
    const res = await request(app)
      .get("/api/patients/appointments/upcoming")
      .set("Authorization", `Bearer ${patientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(4);
    res.body.forEach((appointment: any) => {
      expect(["bekræftet", "venter"]).toContain(appointment.status);
    });
  });

  it("should return 500 on DB error", async () => {
    const spy = jest
      .spyOn(AppointmentModel, "find")
      .mockRejectedValueOnce(new Error("DB error"));

    const res = await request(app)
      .get("/api/patients/appointments/upcoming")
      .set("Authorization", `Bearer ${patientToken}`);

    expect(res.status).toBe(500);
    expect(res.body.message).toMatch(/Failed to fetch/i);

    spy.mockRestore();
  });
});

describe("PATCH /api/patients/appointments/:id/confirm", () => {
  it("should confirm appointment if it belongs to patient", async () => {
    const res = await request(app)
      .patch(`/api/patients/appointments/${confirmableId}/confirm`)
      .set("Authorization", `Bearer ${patientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/Aftale bekræftet/i);

    const updated = await AppointmentModel.findById(confirmableId);
    expect(updated?.status).toBe("bekræftet");
  });

  it("should return 403 if appointment belongs to someone else", async () => {
    const otherId = new mongoose.Types.ObjectId();

    const otherAppointment = await AppointmentModel.create({
      patient_id: otherId,
      doctor_id: doctorId,
      clinic_id: clinicId,
      date: new Date(),
      status: "venter",
      time: "10:00",
    });

    const res = await request(app)
      .patch(`/api/patients/appointments/${otherAppointment._id}/confirm`)
      .set("Authorization", `Bearer ${patientToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/ikke ændre denne/i);
  });

  it("should return 404 if appointment does not exist", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .patch(`/api/patients/appointments/${fakeId}/confirm`)
      .set("Authorization", `Bearer ${patientToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/Aftale ikke fundet/i);
  });
});

describe("PATCH /api/patients/appointments/:id/cancel", () => {
  it("should cancel appointment if it belongs to patient", async () => {
    const res = await request(app)
      .patch(`/api/patients/appointments/${cancelableId}/cancel`)
      .set("Authorization", `Bearer ${patientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/Aftale blev aflyst/i);

    const updated = await AppointmentModel.findById(cancelableId);
    expect(updated?.status).toBe("aflyst");
  });

  it("should return 403 if appointment belongs to someone else", async () => {
    const otherId = new mongoose.Types.ObjectId();

    const otherAppointment = await AppointmentModel.create({
      patient_id: otherId,
      doctor_id: doctorId,
      clinic_id: clinicId,
      date: new Date(),
      status: "bekræftet",
      time: "14:00",
    });

    const res = await request(app)
      .patch(`/api/patients/appointments/${otherAppointment._id}/cancel`)
      .set("Authorization", `Bearer ${patientToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/ikke adgang til at aflyse/i);
  });

  it("should return 404 if appointment does not exist", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .patch(`/api/patients/appointments/${fakeId}/cancel`)
      .set("Authorization", `Bearer ${patientToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/ikke mulgit at finde/i);
  });
});
