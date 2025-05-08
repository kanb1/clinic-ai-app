import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../index";
import { UserModel } from "../../models/user.model";
import { ClinicModel } from "../../models/clinic.model";

let mongoServer: MongoMemoryServer;
let token: string;
let userId: mongoose.Types.ObjectId;

beforeAll(async () => {
  // starter en test-database i hukommelsen
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  // forbinder Mongoose til den
  await mongoose.connect(uri);

  // Opretter testbruger (admin) og JWT-token
  const user = new UserModel({
    name: "Admin User",
    email: "admin@example.com",
    password_hash: "hashed123",
    role: "admin",
    clinic_id: new mongoose.Types.ObjectId(),
  });

  await user.save();
  // gemmer ID til senere test
  userId = user._id as mongoose.Types.ObjectId;

  // Generer JWT-token til auth
  token = jwt.sign(
    { _id: user._id, role: user.role, clinicId: user.clinic_id },
    process.env.JWT_SECRET!,
    { expiresIn: "1d" }
  );
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await ClinicModel.deleteMany({});
});

describe("POST /api/clinics", () => {
  it("should create a new clinic", async () => {
    const res = await request(app)
      .post("/api/clinics")
      .set("Authorization", `Bearer ${token}`) //sender jwt-token
      .send({
        name: "Test Clinic",
        address: "Clinic Street 1",
      });

    expect(res.status).toBe(201); //forventer oprettelse
    expect(res.body.name).toBe("Test Clinic");
    expect(res.body.created_by).toBe(userId.toString()); //tjek at brugerens ID er korrekt sat
  });
});

describe("GET /api/clinics", () => {
  it("should return all clinics", async () => {
    await ClinicModel.create({
      name: "Test Clinic A",
      address: "Address A",
      created_by: userId, //opretter en testklinik
    });

    const res = await request(app).get("/api/clinics");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true); // tjekker at det er et array
    expect(res.body.length).toBeGreaterThan(0); // og at der er mindst én klinik
  });
});
