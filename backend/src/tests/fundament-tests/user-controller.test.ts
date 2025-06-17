import request from "supertest";
import mongoose from "mongoose";
// midlertidig mongodb i hukommelsen -> bruger ik egen db
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../index";
import { UserModel } from "../../models/user.model";
import { SessionModel } from "../../models/session.model";

import { createUserAndToken } from "../test-utils/createUserAndToken";

// *********Test Setup før og efter*********
// *********Test Setup før og efter*********
// *********Test Setup før og efter*********

let mongoServer: MongoMemoryServer;

// før alle test:
beforeAll(async () => {
  // start in-memory mongodb-server
  mongoServer = await MongoMemoryServer.create();
  // forbind mongoose til test-db

  await mongoose.connect(mongoServer.getUri());
});

// efter alle test:
afterAll(async () => {
  // afbryd forbindelse
  await mongoose.disconnect();
  // stop test-server
  await mongoServer.stop();
});

// rydder db før hver test
// tests skal ik påvirke hinanden
beforeEach(async () => {
  await UserModel.deleteMany({});
  await SessionModel.deleteMany({});
});

// *********Test Setup før og efter*********
// *********Test Setup før og efter*********
// *********Test Setup før og efter*********

// describe -> starter testsuite
// it -> definerer en test
describe("User Controller", () => {
  describe("GET /api/users/me", () => {
    it("should return own user profile", async () => {
      const { token, user } = await createUserAndToken("patient");

      const res = await request(app)
        .get("/api/users/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(user.email);
    });

    it("should return 404 if user not found", async () => {
      const { token } = await createUserAndToken("patient");

      await UserModel.deleteMany({});

      const res = await request(app)
        .get("/api/users/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/users/staff-statuses", () => {
    it("should return staff status in clinic", async () => {
      const { token, user } = await createUserAndToken("doctor");

      await UserModel.create({
        name: "Sekretær",
        email: "sek@test.com",
        password_hash: "hashcode123",
        role: "secretary",
        clinic_id: user.clinic_id,
        status: "optaget",
      });

      const res = await request(app)
        .get("/api/users/staff-statuses")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe("PATCH /api/users/update-status/me", () => {
    it("should update own status", async () => {
      const { token } = await createUserAndToken("secretary");

      const res = await request(app)
        .patch("/api/users/update-status/me")
        .set("Authorization", `Bearer ${token}`)
        .send({ status: "optaget" });

      expect(res.status).toBe(200);
      expect(res.body.user.status).toBe("optaget");
    });

    it("should return 400 if status is invalid", async () => {
      const { token } = await createUserAndToken("doctor");

      const res = await request(app)
        .patch("/api/users/update-status/me")
        .set("Authorization", `Bearer ${token}`)
        .send({ status: "crazy-status" });

      expect(res.status).toBe(400);
      expect(res.body.errors?.[0]?.msg).toMatch(/Status skal være enten/);
    });

    it("should return 404 if user not found", async () => {
      const { token } = await createUserAndToken("doctor");

      await UserModel.deleteMany({});

      const res = await request(app)
        .patch("/api/users/update-status/me")
        .set("Authorization", `Bearer ${token}`)
        .send({ status: "ledig" });

      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/users/patients", () => {
    it("should return all patients in same clinic", async () => {
      const { token, user } = await createUserAndToken("doctor");

      await UserModel.create({
        name: "Patient ex",
        email: "ex@test.com",
        password_hash: "hash",
        role: "patient",
        clinic_id: user.clinic_id,
      });

      const res = await request(app)
        .get("/api/users/patients")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body[0].role).toBe("patient");
    });
  });
});
