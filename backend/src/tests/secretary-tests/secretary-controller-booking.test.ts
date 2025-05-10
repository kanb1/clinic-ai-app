import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../index";
import { createTestUser } from "../test-utils/testUtils";
import {
  AvailabilitySlotModel,
  IAvailabilitySlot,
} from "../../models/availabilityslots.model";
import { AppointmentModel } from "../../models/appointment.model";

let mongoServer: MongoMemoryServer;
let clinicId: mongoose.Types.ObjectId;
let secretaryToken: string;
let doctorId: mongoose.Types.ObjectId;
let patientId: mongoose.Types.ObjectId;
let slotId: mongoose.Types.ObjectId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  clinicId = new mongoose.Types.ObjectId();

  const { token: secToken } = await createTestUser("secretary", clinicId);
  secretaryToken = secToken;

  const { userId: docId } = await createTestUser("doctor", clinicId);
  doctorId = docId;

  const { userId: patId } = await createTestUser("patient", clinicId);
  patientId = patId;

  const slot = await AvailabilitySlotModel.create({
    doctor_id: doctorId,
    date: new Date("2025-05-20"),
    start_time: "13:30",
    end_time: "14:00",
    is_booked: false,
  });

  slotId = slot._id as mongoose.Types.ObjectId;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Secretary Booking Endpoints", () => {
  it("POST /appointments should create a new appointment", async () => {
    const res = await request(app)
      .post("/api/secretary/appointments")
      .set("Authorization", `Bearer ${secretaryToken}`)
      .send({
        patient_id: patientId,
        doctor_id: doctorId,
        slot_id: slotId,
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Appointment created");
    expect(res.body.appointment).toHaveProperty("status", "venter");

    const slot = await AvailabilitySlotModel.findById(slotId);
    expect(slot?.is_booked).toBe(true);
  });

  it("PATCH /appointments/:id/secretary-note should add a note", async () => {
    // 👇 Vi bruger præcis de samme IDs som resten af testen
    const appointment = await AppointmentModel.create({
      patient_id: patientId,
      doctor_id: doctorId,
      clinic_id: clinicId,
      date: new Date("2025-05-21"),
      time: "09:00",
      status: "venter",
    });

    const res = await request(app)
      .patch(`/api/secretary/appointments/${appointment._id}/secretary-note`)
      .set("Authorization", `Bearer ${secretaryToken}`)
      .send({ note: "Patient klagede over hovedpine" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Symptom note added");
    expect(res.body.appointment.secretary_note).toBe(
      "Patient klagede over hovedpine"
    );
  });
});
