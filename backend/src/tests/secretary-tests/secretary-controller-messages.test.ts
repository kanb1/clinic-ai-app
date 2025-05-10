import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../index";
import { createTestUser } from "../test-utils/testUtils";
import { MessageModel } from "../../models/message.model";
import { UserModel } from "../../models/user.model";

let mongoServer: MongoMemoryServer;
let clinicId: mongoose.Types.ObjectId;
let secretaryToken: string;
let secretaryId: mongoose.Types.ObjectId;
let patientId: mongoose.Types.ObjectId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  clinicId = new mongoose.Types.ObjectId();
  // Opretre bruger med rollen secretary
  const { token, userId } = await createTestUser("secretary", clinicId);
  secretaryToken = token;
  secretaryId = userId;

  // Opretter patient som sender (for testens skyld)
  const { userId: patientUserId } = await createTestUser("patient", clinicId);
  patientId = patientUserId;

  // Opret besked sendt fra patient til "all"
  await MessageModel.create({
    sender_id: patientId,
    receiver_id: "all", // betyder alle sekretærer
    content: "Hello",
    type: "besked",
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Ryd beskeder før hver test
  await MessageModel.deleteMany({});
});

// Messages
describe("Secretary Message Endpoints", () => {
  // Vi tester modtagelse af beskeder hos sekretæren
  it("GET /messages/unread should return messages for secretary's clinic", async () => {
    // Opret besked igen i denne test
    await MessageModel.create({
      sender_id: patientId,
      receiver_id: "all",
      content: "Hello",
      type: "besked",
    });

    const res = await request(app)
      .get("/api/secretary/messages/unread")
      .set("Authorization", `Bearer ${secretaryToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].content).toBe("Hello");
  });

  it("POST /messages should send a message", async () => {
    const res = await request(app)
      .post("/api/secretary/messages")
      .set("Authorization", `Bearer ${secretaryToken}`)
      .send({
        receiver_id: patientId,
        content: "Din tid er bekræftet",
        type: "besked",
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Message sent");
    expect(res.body.newMessage.content).toBe("Din tid er bekræftet");
  });

  it("PATCH /messages/:id/read should mark a message as read", async () => {
    const msg = await MessageModel.create({
      sender_id: patientId,
      receiver_id: secretaryId,
      content: "Læs mig",
      type: "besked",
      read: false,
    });

    const res = await request(app)
      .patch(`/api/secretary/messages/${msg._id}/read`)
      .set("Authorization", `Bearer ${secretaryToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Message marked as read by secretary");

    const updated = await MessageModel.findById(msg._id);
    expect(updated?.read).toBe(true);
  });

  it("should return 400 if required fields are missing", async () => {
    const res = await request(app)
      .post("/api/secretary/messages")
      .set("Authorization", `Bearer ${secretaryToken}`)
      .send({
        receiver_id: patientId,
        // mangler content og type
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("All fields are required");
  });

  it("should return 400 if receiver_id is invalid", async () => {
    const res = await request(app)
      .post("/api/secretary/messages")
      .set("Authorization", `Bearer ${secretaryToken}`)
      .send({
        receiver_id: "ugyldig_id", // ikke en ObjectId
        content: "Hej",
        type: "besked",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid receiver_id");
  });
});
