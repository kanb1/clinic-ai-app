import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../index";
import { UserModel } from "../../models/user.model";
import {
  createTestStaffMembers,
  createTestUser,
} from "../test-utils/testUtils";

let mongoServer: MongoMemoryServer;
let clinicId: mongoose.Types.ObjectId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  //opretter nyt unikt clinicid til brugerne
  clinicId = new mongoose.Types.ObjectId();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await UserModel.deleteMany({});
});

describe("GET /api/users/me", () => {
  it("should return user profile without password_hash", async () => {
    // opretter admin
    const { token } = await createTestUser("admin", clinicId);
    //og logger ind med jwt token
    const res = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    // email matcher "admin"
    expect(res.body.email).toMatch(/admin-.*@test\.com/);
    // passhash ik sendes med i responsen
    expect(res.body).not.toHaveProperty("password_hash");
  });

  it("should return 401 if no token is provided", async () => {
    const res = await request(app).get("/api/users/me");
    expect(res.status).toBe(401);
  });

  it("should return 404 if user not found", async () => {
    // opretter en bruger og sletter den efter
    const { token, userId } = await createTestUser("admin", clinicId);
    await UserModel.findByIdAndDelete(userId);

    // Kalder /me med den gamle token som teknisk set stadigvæk er gyldigt
    const res = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${token}`);

    //   forventer at den fejler pga bruger er slettet
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("User not found");
  });
});

describe("GET /api/users/staff-statuses", () => {
  it("should return staff members (doctors and secretaries)", async () => {
    // logged in bruger som er en sekretær i samme klinik
    const { token } = await createTestUser("secretary", clinicId); // login-bruger først
    await createTestStaffMembers(clinicId); // opret doctor + secretary bagefter

    const res = await request(app)
      .get("/api/users/staff-statuses")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2); // doctor + secretary (uden login-bruger)
    expect(res.body[0]).toHaveProperty("name");
    expect(res.body[0]).not.toHaveProperty("password_hash");
  });

  it("should return empty array if no staff in same clinic", async () => {
    // opretter kun login-brugeren men ingen ansatte
    const { token } = await createTestUser("secretary", clinicId); // Bruger er i klinik, men ingen staff

    const res = await request(app)
      .get("/api/users/staff-statuses")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]); //bør returnere en tom liste
  });
});
