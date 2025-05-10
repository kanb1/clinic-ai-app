import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../index";
import { createTestUser } from "../test-utils/testUtils";
import { AppointmentModel } from "../../models/appointment.model";

let mongoServer: MongoMemoryServer;
let clinicId: mongoose.Types.ObjectId;
let secretaryToken: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  clinicId = new mongoose.Types.ObjectId();
  const { token } = await createTestUser("secretary", clinicId);
  secretaryToken = token;

  const doctorId = new mongoose.Types.ObjectId();
  const patientId = new mongoose.Types.ObjectId();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  await AppointmentModel.create([
    {
      clinic_id: clinicId,
      doctor_id: doctorId,
      patient_id: patientId,
      date: today,
      time: "10:00",
      status: "venter",
    },
    {
      clinic_id: clinicId,
      doctor_id: doctorId,
      patient_id: patientId,
      date: yesterday,
      time: "09:00",
      status: "udført",
    },
    {
      clinic_id: clinicId,
      doctor_id: doctorId,
      patient_id: patientId,
      date: tomorrow,
      time: "13:00",
      status: "venter",
    },
  ]);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Secretary Dashboard Endpoints", () => {
  it("GET /todays-appointments should return only today's appointments", async () => {
    const res = await request(app)
      .get("/api/secretary/appointments/today")
      .set("Authorization", `Bearer ${secretaryToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].time).toBe("10:00");
  });

  // tjekker, hvad der sker, hvis databasen fejler
  it("should return 500 if DB error occurs in getTodaysAppointments", async () => {
    // jest funktion der udspionerer en funktion
    // kan ændre funktionens adfærd i testen ffx simulere en fejl
    const spy = jest.spyOn(AppointmentModel, "find");
    // når find() bliver kaldt første gang, skal den ikke fungere normalt, men i stedet kaste en fejl.
    spy.mockRejectedValueOnce(new Error("Simulated DB error"));

    const res = await request(app)
      .get("/api/secretary/appointments/today")
      .set("Authorization", `Bearer ${secretaryToken}`);

    expect(res.status).toBe(500);
    expect(res.body.message).toMatch(/Failed to fetch/i);

    spy.mockRestore();
  });
});
