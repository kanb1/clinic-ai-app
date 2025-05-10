import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../index";
import { createTestUser } from "../test-utils/testUtils";
import { AppointmentModel } from "../../models/appointment.model";
import { AvailabilitySlotModel } from "../../models/availabilityslots.model";

let mongoServer: MongoMemoryServer;
let clinicId: mongoose.Types.ObjectId;
let secretaryToken: string;
let doctorId: mongoose.Types.ObjectId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  clinicId = new mongoose.Types.ObjectId();
  const { token } = await createTestUser("secretary", clinicId);
  secretaryToken = token;

  const { userId: docId } = await createTestUser("doctor", clinicId);
  doctorId = docId; // bruger denne ID i slots
  const patientId = new mongoose.Types.ObjectId();

  // Tilføjer test-aftale i klinikken
  await AppointmentModel.create({
    clinic_id: clinicId,
    doctor_id: doctorId,
    patient_id: patientId,
    date: new Date("2025-05-10"),
    time: "10:00",
    status: "venter",
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Secretary Calendar Endpoints", () => {
  it("GET /appointments should return all clinic appointments", async () => {
    const res = await request(app)
      .get("/api/secretary/appointments")
      .set("Authorization", `Bearer ${secretaryToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0]).toHaveProperty("clinic_id");
  });

  it("GET /availability should return grouped available slots", async () => {
    const now = new Date("2025-05-05");
    const later = new Date("2025-05-06");

    await AvailabilitySlotModel.create([
      {
        doctor_id: doctorId,
        date: now,
        start_time: "09:00",
        end_time: "09:30",
        is_booked: false,
      },
      {
        doctor_id: doctorId,
        date: later,
        start_time: "10:00",
        end_time: "10:30",
        is_booked: false,
      },
    ]);

    const res = await request(app)
      .get("/api/secretary/availability?weekStart=2025-05-05")
      .set("Authorization", `Bearer ${secretaryToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty("doctorName");
    expect(res.body[0]).toHaveProperty("availableSlots");
  });

  it("should return 200 and empty array if doctorId is invalid", async () => {
    const res = await request(app)
      .get(
        "/api/secretary/availability?weekStart=2025-05-05&doctorId=invalidid123"
      )
      .set("Authorization", `Bearer ${secretaryToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0); //
  });

  it("should return 400 if weekStart is missing", async () => {
    const res = await request(app)
      .get("/api/secretary/availability") // ingen weekStart
      .set("Authorization", `Bearer ${secretaryToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/weekStart is required/i);
  });

  it("should return 200 and empty array if doctorId is invalid", async () => {
    const res = await request(app)
      .get("/api/secretary/availability?weekStart=2025-05-05&doctorId=invalid")
      .set("Authorization", `Bearer ${secretaryToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });
});
