import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../index";
import { ChatSessionModel } from "../../models/chatsession.model";
import { createPatientWithToken } from "../test-utils/createPatientWithToken";
import OpenAI from "openai";
import * as aiController from "../../controllers/patient/ai.controller";

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
  await ChatSessionModel.deleteMany({});
});

describe("AI Controller (Patient)", () => {
  it("should respond with a chatbot reply", async () => {
    const { token: patientToken } = await createPatientWithToken();

    const res = await request(app)
      .post("/api/patients/ai/start")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({
        message: "Jeg har haft hovedpine i flere dage",
      });

    expect(res.status).toBe(200);
    expect(typeof res.body.reply).toBe("string");
    expect(res.body.reply.length).toBeGreaterThan(5);
  }, 10000);

  it("should save chat and generate summary", async () => {
    const { token: patientToken, patient } = await createPatientWithToken();

    const messages = [
      {
        user: "Jeg har haft ondt i halsen i 4 dage",
        ai: "Det lyder ikke særlig godt. Har det forbedret sig?",
      },
      {
        user: "Nej det er kun blevet værre",
        ai: "Det er godt du fortæller det og forståeligt med bekymring. Har du haft feber? Hvor høj har den været?",
      },
    ];

    const dummyAppointmentId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .post("/api/patients/ai/save-chat")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({
        messages,
        appointmentId: dummyAppointmentId,
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/Samtale gemt/i);
    expect(res.body.chat).toHaveProperty("summary_for_doctor");
    expect(res.body.chat.patient_id).toBeDefined();
    expect(res.body.chat.saved_to_appointment_id).toBe(
      dummyAppointmentId.toString()
    );
  }, 10000);

  it("should prevent duplicate chat save for same appointment", async () => {
    const { token: patientToken, patient } = await createPatientWithToken();
    const patientId = patient._id as mongoose.Types.ObjectId;
    const appointmentId = new mongoose.Types.ObjectId();

    // First save
    await ChatSessionModel.create({
      patient_id: patientId,
      messages: [],
      saved_to_appointment_id: appointmentId,
      summary_for_doctor: "Test",
    });

    const res = await request(app)
      .post("/api/patients/ai/save-chat")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({
        messages: [{ user: "test", ai: "reply" }],
        appointmentId,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/allerede en gemt chat/i);
  });
});

// Test for openai fejl:
it("should return 429 if OpenAI throws error in startChatSession", async () => {
  jest.spyOn(aiController, "getOpenAIClient").mockImplementationOnce(() => {
    throw new Error("Too many requests");
  });

  const { token } = await createPatientWithToken();

  const res = await request(app)
    .post("/api/patients/ai/start")
    .set("Authorization", `Bearer ${token}`)
    .send({ message: "Hej" });

  expect(res.status).toBe(429);
  expect(res.body.message).toMatch(/for mange beskeder/i);
});

// Test for save chat fejl:
it("should return 500 if OpenAI summary fails in saveChatHistory", async () => {
  jest.spyOn(aiController, "getOpenAIClient").mockImplementationOnce(() => {
    return {
      chat: {
        completions: {
          create: jest
            .fn()
            .mockRejectedValue(new Error("Something went wrong")),
        },
      },
    } as any;
  });

  const { token } = await createPatientWithToken();
  const appointmentId = new mongoose.Types.ObjectId();

  const res = await request(app)
    .post("/api/patients/ai/save-chat")
    .set("Authorization", `Bearer ${token}`)
    .send({
      messages: [{ user: "test", ai: "hej" }],
      appointmentId,
    });

  expect(res.status).toBe(500);
  expect(res.body.message).toMatch(/noget gik galt/i);
});

// FEJL TESTING

// Test at getOpenAIClient kaster fejl uden API key
it("should throw error if OPENAI_API_KEY is missing", () => {
  const originalKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;

  const aiCtrl = require("../../controllers/patient/ai.controller");
  expect(() => aiCtrl.getOpenAIClient()).toThrow("Missing OpenAI API key");

  process.env.OPENAI_API_KEY = originalKey;
});

// Test at startChatSession håndterer tom besked
it("should return 400 if message is empty", async () => {
  const { token } = await createPatientWithToken();

  const res = await request(app)
    .post("/api/patients/ai/start")
    .set("Authorization", `Bearer ${token}`)
    .send({ message: "" });

  expect(res.status).toBe(400);
  expect(res.body.errors[0].msg).toMatch(/Besked mangler/);
});

// Test at saveChatHistory håndterer tom messages array
it("should return 400 if messages array is empty in saveChatHistory", async () => {
  const { token } = await createPatientWithToken();
  const appointmentId = new mongoose.Types.ObjectId();

  const res = await request(app)
    .post("/api/patients/ai/save-chat")
    .set("Authorization", `Bearer ${token}`)
    .send({
      messages: [],
      appointmentId,
    });

  expect(res.status).toBe(400);
  expect(res.body.errors[0].msg).toMatch(/ikke-tom liste/);
});
