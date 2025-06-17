import request from "supertest";
import mongoose from "mongoose";
// midlertidig mongodb i hukommelsen -> bruger ik egen db
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../index";
import { ChatSessionModel } from "../../models/chatsession.model";
import { createPatientWithToken } from "../test-utils/createPatientWithToken";
import OpenAI from "openai";
import * as aiController from "../../controllers/patient/ai.controller";

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
  await ChatSessionModel.deleteMany({});
});

// *********Test Setup før og efter*********
// *********Test Setup før og efter*********
// *********Test Setup før og efter*********

// describe -> starter testsuite
// it -> definerer en test
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
    // ik et tomt svar
    expect(res.body.reply.length).toBeGreaterThan(5);
  }, 10000); //timeout på 10sek (jest nornamlt 5) -> men ai kan tage tid at svare

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
    // appointment vi vil gemme chat på
    const appointmentId = new mongoose.Types.ObjectId();

    // First save
    await ChatSessionModel.create({
      patient_id: patientId,
      messages: [],
      saved_to_appointment_id: appointmentId,
      summary_for_doctor: "Test",
    });

    // prøver at gemme endnu en chat til samme appoin.
    const res = await request(app)
      .post("/api/patients/ai/save-chat")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({
        messages: [{ user: "test", ai: "reply" }],
        appointmentId,
      });

    // bør fejle
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/allerede en gemt chat/i);
  });
});

// Test for openai fejl:
it("should return 429 if OpenAI throws error in startChatSession", async () => {
  // vil gerne teste specifik fejl, overskriver fake openai klient
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

  // forsøger at gemme en chat når  openai-klient fejler
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
  // gemmer nuværende api-nøgle, så den kan gensættes efter uden ødelægge andre tests
  const originalKey = process.env.OPENAI_API_KEY;

  // fjerner midlertidigt miljøvariabel -> simuler den mangler
  delete process.env.OPENAI_API_KEY;

  // importer ai-controller -> hvor getopenaiclient findes
  // require importerer den nyeste state frem for import
  const aiCtrl = require("../../controllers/patient/ai.controller");
  // kalender getopenaiclient uden api-key
  // forventer fejl
  expect(() => aiCtrl.getOpenAIClient()).toThrow("Missing OpenAI API key");

  // gendanner nøgle
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
