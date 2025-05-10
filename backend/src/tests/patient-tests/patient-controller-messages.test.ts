import request from "supertest";
import mongoose from "mongoose";
import app from "../../index";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createTestUser } from "../test-utils/testUtils";
import { MessageModel } from "../../models/message.model";

let mongoServer: MongoMemoryServer;
let patientToken: string;
let patientId: mongoose.Types.ObjectId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const clinicId = new mongoose.Types.ObjectId();

  const result = await createTestUser("patient", clinicId);
  patientToken = result.token;
  patientId = result.userId;

  await MessageModel.create([
    {
      sender_id: new mongoose.Types.ObjectId(),
      receiver_id: patientId,
      content: "Direkte besked",
      type: "besked",
      read: false,
    },
    {
      sender_id: new mongoose.Types.ObjectId(),
      receiver_id: "all",
      content: "Broadcast besked",
      type: "besked",
      read: false,
    },
    {
      sender_id: new mongoose.Types.ObjectId(),
      receiver_id: patientId,
      content: "Allerede læst",
      type: "besked",
      read: true,
    },
  ]);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("GET /api/patients/messages/unread", () => {
  it("should return unread messages for patient", async () => {
    const res = await request(app)
      .get("/api/patients/messages/unread")
      .set("Authorization", `Bearer ${patientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty("content");
  });

  it("should return 500 on DB error", async () => {
    const spy = jest
      .spyOn(MessageModel, "find")
      .mockRejectedValueOnce(new Error("DB error"));

    const res = await request(app)
      .get("/api/patients/messages/unread")
      .set("Authorization", `Bearer ${patientToken}`);

    expect(res.status).toBe(500);
    expect(res.body.message).toMatch(/Failed to fetch/i);

    spy.mockRestore();
  });
});

describe("PATCH /api/patients/messages/:id/read", () => {
  let messageId: mongoose.Types.ObjectId;

  beforeEach(async () => {
    const message = await MessageModel.create({
      sender_id: new mongoose.Types.ObjectId(),
      receiver_id: patientId,
      content: "Markér som læst",
      type: "besked",
      read: false,
    });
    messageId = message._id as mongoose.Types.ObjectId;
  });

  it("should mark message as read if user is the receiver", async () => {
    const res = await request(app)
      .patch(`/api/patients/messages/${messageId}/read`)
      .set("Authorization", `Bearer ${patientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Message marked as read");

    const updated = await MessageModel.findById(messageId);
    expect(updated?.read).toBe(true);
  });

  it("should not allow marking broadcast messages as read", async () => {
    const broadcast = await MessageModel.create({
      sender_id: new mongoose.Types.ObjectId(),
      receiver_id: "all",
      content: "Broadcast",
      type: "besked",
      read: false,
    });

    const res = await request(app)
      .patch(`/api/patients/messages/${broadcast._id}/read`)
      .set("Authorization", `Bearer ${patientToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/Broadcast messages cannot/i);
  });

  it("should return 403 if message does not belong to patient", async () => {
    const otherUserId = new mongoose.Types.ObjectId();

    const msg = await MessageModel.create({
      sender_id: new mongoose.Types.ObjectId(),
      receiver_id: otherUserId,
      content: "Ikke din besked",
      type: "besked",
      read: false,
    });

    const res = await request(app)
      .patch(`/api/patients/messages/${msg._id}/read`)
      .set("Authorization", `Bearer ${patientToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/not authorized/i);
  });

  it("should return 404 if message does not exist", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .patch(`/api/patients/messages/${fakeId}/read`)
      .set("Authorization", `Bearer ${patientToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/not found/i);
  });
});
