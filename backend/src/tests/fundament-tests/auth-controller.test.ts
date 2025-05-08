// Bruges til at lave httpkald til min app i testen som om det var Postman, bare i kode
import request from "supertest";
import mongoose from "mongoose";
// giver midlertidig mognodb server i hukommelsen
// nul opsætning og slettes automatisk
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../index";
import { UserModel } from "../../models/user.model";
import bcrypt from "bcryptjs";

// holder styr på min inmemory test-db under testen
let mongoServer: MongoMemoryServer;

// connect til mongo
beforeAll(async () => {
  // opretter mongodb-server
  mongoServer = await MongoMemoryServer.create();
  //  får dens fake uri, fake connection string
  const uri = mongoServer.getUri();
  //  forbinder mongoose til den
  await mongoose.connect(uri);
});

// lukker forbindelse og slukker testdatabasen
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// før hver test
// ryd alle brugere - tester på rent testmiljø
beforeEach(async () => {
  await UserModel.deleteMany({});
});

// describe - logisk navn
// it - hvad skal den gøres
describe("POST /api/auth/login", () => {
  it("should login with correct credentials", async () => {
    const user = new UserModel({
      name: "Test User",
      email: "test@example.com",
      password_hash: "test123", // raw, middleware hasher det
      role: "patient",
      clinic_id: new mongoose.Types.ObjectId(),
    });
    await user.save();

    // supertest kald - http request til min app. "send" json data
    const res = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "test123",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.email).toBe("test@example.com");
  });

  it("should fail with wrong password", async () => {
    const hashedPassword = await bcrypt.hash("test123", 10);
    await UserModel.create({
      name: "Test User",
      email: "test@example.com",
      password_hash: hashedPassword,
      role: "patient",
      clinic_id: new mongoose.Types.ObjectId(),
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "wrongpass",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid credentials");
  });
});

describe("POST /api/auth/register", () => {
  it("should register a new user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Kanza Bok",
      email: "k@example.com",
      password: "pass123",
      role: "patient",
      clinic_id: new mongoose.Types.ObjectId(),
    });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe("k@example.com");
  });

  it("should return 400 if missing fields", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "missing@example.com",
      password: "123456",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("All fields are required!");
  });

  it("should fail if user already exists", async () => {
    const user = new UserModel({
      name: "Kanza",
      email: "k@example.com",
      password_hash: "hashed123",
      role: "patient",
      clinic_id: new mongoose.Types.ObjectId(),
    });
    await user.save();

    const res = await request(app).post("/api/auth/register").send({
      name: "Kanza Bok",
      email: "k@example.com",
      password: "pass123",
      role: "patient",
      clinic_id: new mongoose.Types.ObjectId(),
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("User already exists!");
  });
});
