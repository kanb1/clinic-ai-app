import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../index";
import { UserModel } from "../../models/user.model";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await UserModel.deleteMany({});
});

describe("POST /api/auth/register", () => {
  it("should register a new user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Kanza Bok",
      email: "kanza@example.com",
      password: "Strong123!",
      role: "patient",
      clinic_id: new mongoose.Types.ObjectId(),
    });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe("kanza@example.com");
  });

  it("should return 400 if missing fields", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "missing@example.com",
      password: "Strong123!",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("All fields are required!");
  });

  it("should fail if user already exists", async () => {
    await UserModel.create({
      name: "Kanza",
      email: "kanza@example.com",
      password_hash: "Strong123!", // min pre-save hasher det her
      role: "patient",
      clinic_id: new mongoose.Types.ObjectId(),
    });

    const res = await request(app).post("/api/auth/register").send({
      name: "Kanza Bok",
      email: "kanza@example.com",
      password: "Strong123!",
      role: "patient",
      clinic_id: new mongoose.Types.ObjectId(),
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("User already exists!");
  });
});

it("should return 500 if DB error occurs during register", async () => {
  jest
    .spyOn(UserModel.prototype, "save")
    .mockRejectedValueOnce(new Error("DB error"));

  const res = await request(app).post("/api/auth/register").send({
    name: "Crash Test",
    email: "crash@test.com",
    password: "Strong123!",
    role: "patient",
    clinic_id: new mongoose.Types.ObjectId(),
  });

  expect(res.status).toBe(500);
  expect(res.body.message).toBe("Server error");
});

describe("POST /api/auth/login", () => {
  it("should login with correct credentials", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Kanza Bok",
      email: "kanza@example.com",
      password: "Strong123!",
      role: "patient",
      clinic_id: new mongoose.Types.ObjectId(),
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "kanza@example.com",
      password: "Strong123!",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.email).toBe("kanza@example.com");
  });

  it("should fail with wrong password", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Kanza Bok",
      email: "kanza@example.com",
      password: "Strong123!",
      role: "patient",
      clinic_id: new mongoose.Types.ObjectId(),
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "kanza@example.com",
      password: "WrongPassword1!",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid credentials");
  });

  it("should fail with invalid email format", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "invalidemail",
      password: "Strong123!",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/ugyldig/i);
  });

  it("should fail if password does not meet policy", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "abc123", // en ugyldig pass
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Ugyldige input");
  });
});

// simulerer manglende jwt i login:
it("should return 500 if JWT_SECRET is missing", async () => {
  const realSecret = process.env.JWT_SECRET;
  delete process.env.JWT_SECRET;

  await request(app).post("/api/auth/register").send({
    name: "nojwt",
    email: "nojwt@test.com",
    password: "Strong123!",
    role: "patient",
    clinic_id: new mongoose.Types.ObjectId(),
  });

  const res = await request(app).post("/api/auth/login").send({
    email: "nojwt@test.com",
    password: "Strong123!",
  });

  expect(res.status).toBe(429);
  expect(res.body.message).toBe(
    "For mange loginforsøg. Prøv igen om 15 minutter."
  );

  process.env.JWT_SECRET = realSecret;
});

// Test af logout outputtet:
describe("POST /api/auth/logout", () => {
  it("should logout user with valid token", async () => {
    const registerRes = await request(app).post("/api/auth/register").send({
      name: "Logout Test",
      email: "logout@test.com",
      password: "Strong123!",
      role: "patient",
      clinic_id: new mongoose.Types.ObjectId(),
    });

    const loginRes = await request(app).post("/api/auth/login").send({
      email: "logout@test.com",
      password: "Strong123!",
    });

    const token = loginRes.body.token;

    const res = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Logout successful");
  });
});
