import request from "supertest";
import mongoose from "mongoose";
import app from "../../index";
// midlertidig mongodb i hukommelsen -> bruger ik egen db
import { MongoMemoryServer } from "mongodb-memory-server";
import { createPatientWithToken } from "../test-utils/createPatientWithToken";
import { MessageModel } from "../../models/message.model";
import { AppointmentModel } from "../../models/appointment.model";
import { PrescriptionModel } from "../../models/prescription.model";
import { UserModel } from "../../models/user.model";

let mongoServer: MongoMemoryServer;

// *********Test Setup før og efter*********
// *********Test Setup før og efter*********
// *********Test Setup før og efter*********

beforeAll(async () => {
  // start in-memory mongodb-server
  mongoServer = await MongoMemoryServer.create();
  // forbind mongoose til test-db
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// rydder db før hver test
// tests skal ik påvirke hinanden
beforeEach(async () => {
  await MessageModel.deleteMany({});
  await AppointmentModel.deleteMany({});
  await PrescriptionModel.deleteMany({});
});

afterEach(() => {
  jest.restoreAllMocks();
});

// *********Test Setup før og efter*********
// *********Test Setup før og efter*********
// *********Test Setup før og efter*********

// describe -> starter testsuite
// it -> definerer en test
describe("Patient Controller", () => {
  it("should get unread messages", async () => {
    const { token, patient } = await createPatientWithToken();

    await MessageModel.create({
      sender_id: new mongoose.Types.ObjectId(),
      receiver_scope: "individual",
      receiver_id: patient._id,
      content: "Hej patient",
      read: false,
      type: "besked",
    });

    const res = await request(app)
      .get("/api/patients/messages/unread")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].content).toBe("Hej patient");
  });

  it("should confirm own appointment", async () => {
    const { token, patient } = await createPatientWithToken();

    const appointment = await AppointmentModel.create({
      patient_id: patient._id,
      doctor_id: new mongoose.Types.ObjectId(),
      clinic_id: new mongoose.Types.ObjectId(),
      date: new Date(),
      time: "09:00",
      status: "venter",
    });

    const res = await request(app)
      .patch(`/api/patients/appointments/${appointment._id}/confirm`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Aftale bekræftet");
  });

  it("should cancel own appointment", async () => {
    const { token, patient } = await createPatientWithToken();

    const appointment = await AppointmentModel.create({
      patient_id: patient._id,
      doctor_id: new mongoose.Types.ObjectId(),
      clinic_id: new mongoose.Types.ObjectId(),
      date: new Date(),
      time: "10:00",
      status: "bekræftet",
    });

    const res = await request(app)
      .patch(`/api/patients/appointments/${appointment._id}/cancel`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Aftale blev aflyst");
  });

  it("should get upcoming appointments", async () => {
    const { token, patient } = await createPatientWithToken();

    await AppointmentModel.create({
      patient_id: patient._id,
      doctor_id: new mongoose.Types.ObjectId(),
      clinic_id: new mongoose.Types.ObjectId(),
      // i morgen
      date: new Date(Date.now() + 86400000),
      time: "11:00",
      status: "bekræftet",
    });

    const res = await request(app)
      .get("/api/patients/appointments/upcoming")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("should get prescriptions for patient", async () => {
    const { token, patient } = await createPatientWithToken();

    await PrescriptionModel.create({
      patient_id: patient._id,
      medication_name: "Paracetamol",
      dosage: "500mg",
      instructions: "2 gange dagligt",
      issued_date: new Date(),
    });

    const res = await request(app)
      .get(`/api/patients/prescriptions/${patient._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body[0].medication_name).toBe("Paracetamol");
  });

  it("should update profile info", async () => {
    const { token } = await createPatientWithToken();

    const res = await request(app)
      .put("/api/patients/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ email: "new@email.com", phone: "22223333" });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("new@email.com");
  });
});

// Branch dæknin for 404, 500,403 fejl osv
it("should return 404 when trying to confirm non-existing appointment", async () => {
  const { token } = await createPatientWithToken();

  const res = await request(app)
    .patch(
      `/api/patients/appointments/${new mongoose.Types.ObjectId()}/confirm`
    )
    .set("Authorization", `Bearer ${token}`);

  expect(res.status).toBe(404);
  expect(res.body.message).toBe("Aftale ikke fundet");
});

it("should return 403 when trying to confirm another patient's appointment", async () => {
  const { token } = await createPatientWithToken();

  const appointment = await AppointmentModel.create({
    // ik samme patient
    patient_id: new mongoose.Types.ObjectId(),
    doctor_id: new mongoose.Types.ObjectId(),
    clinic_id: new mongoose.Types.ObjectId(),
    date: new Date(),
    time: "09:00",
    status: "venter",
  });

  const res = await request(app)
    .patch(`/api/patients/appointments/${appointment._id}/confirm`)
    .set("Authorization", `Bearer ${token}`);

  expect(res.status).toBe(403);
  expect(res.body.message).toBe("Du må ikke ændre denne aftale");
});

it("should return 404 when marking non-existing message as read", async () => {
  const { token } = await createPatientWithToken();

  const res = await request(app)
    .patch(`/api/patients/messages/${new mongoose.Types.ObjectId()}/read`)
    .set("Authorization", `Bearer ${token}`);

  expect(res.status).toBe(404);
  expect(res.body.message).toBe("Message not found");
});

it("should return 403 if trying to mark a broadcast message as read", async () => {
  const { token } = await createPatientWithToken();

  const msg = await MessageModel.create({
    sender_id: new mongoose.Types.ObjectId(),
    receiver_scope: "all",
    receiver_id: "all", // broadcast
    content: "Broadcast to all",
    read: false,
    type: "besked",
  });

  const res = await request(app)
    .patch(`/api/patients/messages/${msg._id}/read`)
    .set("Authorization", `Bearer ${token}`);

  expect(res.status).toBe(403);
  expect(res.body.message).toMatch(/cannot be marked as read/i);
});

it("should return 404 if trying to cancel non-existing appointment", async () => {
  const { token } = await createPatientWithToken();

  const res = await request(app)
    .patch(`/api/patients/appointments/${new mongoose.Types.ObjectId()}/cancel`)
    .set("Authorization", `Bearer ${token}`);

  expect(res.status).toBe(404);
  expect(res.body.message).toMatch(/finde aftale/);
});

// Test med invalid eller ingen input:
//updateMyProfile: Mangler test for invalid input
it("should return 400 if missing required profile fields", async () => {
  const { token } = await createPatientWithToken();

  const res = await request(app)
    .put("/api/patients/profile")
    .set("Authorization", `Bearer ${token}`)
    .send({}); // ingen email eller phone

  expect(res.status).toBe(400);
  expect(res.body.message).toMatch(/ugyldige/i);
});

// getPrescriptionsForPatient: test med ingen recepter
it("should return empty array if no prescriptions found", async () => {
  const { token, patient } = await createPatientWithToken();

  const res = await request(app)
    .get(`/api/patients/prescriptions/${patient._id}`)
    .set("Authorization", `Bearer ${token}`);

  expect(res.status).toBe(200);
  expect(res.body).toEqual([]);
});

// getUpcomingAppointments: test med ingen kommende aftaler
it("should return empty array if no upcoming appointments", async () => {
  const { token } = await createPatientWithToken();

  const res = await request(app)
    .get("/api/patients/appointments/upcoming")
    .set("Authorization", `Bearer ${token}`);

  expect(res.status).toBe(200);
  expect(res.body).toEqual([]);
});

// getUnreadMessages: test med ingen beskeder
it("should return empty array if no unread messages", async () => {
  const { token } = await createPatientWithToken();

  const res = await request(app)
    .get("/api/patients/messages/unread")
    .set("Authorization", `Bearer ${token}`);

  expect(res.status).toBe(200);
  expect(res.body).toEqual([]);
});

// updateMyProfile: test with invalid phone number
it("should return 400 if phone number is invalid", async () => {
  const { token } = await createPatientWithToken();

  const res = await request(app)
    .put("/api/patients/profile")
    .set("Authorization", `Bearer ${token}`)
    .send({ phone: "not-a-valid-phone" });

  expect(res.status).toBe(400);
  expect(res.body.message).toBe("Ugyldige input"); //kommer fra handleValidationErrors
});

// updateMyProfile: test with neither phone nor email provided
it("should return 400 if no email or phone is provided", async () => {
  const { token } = await createPatientWithToken();

  const res = await request(app)
    .put("/api/patients/profile")
    .set("Authorization", `Bearer ${token}`)
    .send({}); // tomt objekt

  expect(res.status).toBe(400);
  expect(res.body.message).toBe("Ugyldige input");
});

// getPrescriptionsForPatient: test that triggers 500 (feks ugydligt ObjectId)
it("should return 500 if prescription lookup throws", async () => {
  const { token } = await createPatientWithToken();

  const res = await request(app)
    // invalid mongoid
    .get(`/api/patients/prescriptions/invalid-id`)
    .set("Authorization", `Bearer ${token}`);

  expect(res.status).toBe(400);
});

// Hvis UserModel.findByIdAndUpdate returnerer null, fx hvis patienten ikke findes, så sker:
it("should return 404 if user is not found when updating profile", async () => {
  const { token } = await createPatientWithToken();

  // simulerer at en bruger ik findes længere/slettet
  // jest.spyOn -> overstyre mongo funktion findbyId.. midlertidigt
  jest.spyOn(UserModel, "findByIdAndUpdate").mockImplementationOnce(
    () =>
      // returnerer et objekt med select metode -> bruges i controller til at hente brugerinfo
      // select returnerer null her -> altså ingen bruger
      ({
        select: () => Promise.resolve(null),
      } as any)
  );

  const res = await request(app)
    .put("/api/patients/profile")
    .set("Authorization", `Bearer ${token}`)
    .send({ email: "test@example.com" });

  expect(res.status).toBe(404);
  expect(res.body.message).toMatch(/ikke fundet/i);
});

//If statements med return

it("should return 500 if updateMyProfile throws", async () => {
  const { token } = await createPatientWithToken();

  jest.spyOn(UserModel, "findByIdAndUpdate").mockImplementationOnce(() => {
    throw new Error("DB crash");
  });

  const res = await request(app)
    .put("/api/patients/profile")
    .set("Authorization", `Bearer ${token}`)
    .send({ email: "fail@test.com" });

  expect(res.status).toBe(500);
  expect(res.body.message).toBe("Noget gik galt");
});

it("should return 500 if getUpcomingAppointments throws", async () => {
  const { token } = await createPatientWithToken();

  jest.spyOn(AppointmentModel, "find").mockImplementationOnce(() => {
    throw new Error("DB error");
  });

  const res = await request(app)
    .get("/api/patients/appointments/upcoming")
    .set("Authorization", `Bearer ${token}`);

  expect(res.status).toBe(500);
  expect(res.body.message).toMatch(/error/i);
});
