import request from "supertest";
import mongoose from "mongoose";
// midlertidig mongodb i hukommelsen -> bruger ik egen db
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../index";
import { UserModel } from "../../models/user.model";
import { ClinicModel } from "../../models/clinic.model";
import jwt from "jsonwebtoken";
import { createAdminAndToken } from "../test-utils/createAdminAndToken";

let mongoServer: MongoMemoryServer;

// *********Test Setup før og efter*********
// *********Test Setup før og efter*********
// *********Test Setup før og efter*********

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
  await ClinicModel.deleteMany({});
});

// *********Test Setup før og efter*********
// *********Test Setup før og efter*********
// *********Test Setup før og efter*********

// describe -> starter testsuite
// it -> definerer en test
describe("Clinic Controller", () => {
  describe("POST /api/clinics/", () => {
    it("should create a new clinic", async () => {
      const { token } = await createAdminAndToken();

      const res = await request(app)
        .post("/api/clinics")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Klinik Test", address: "Adresse 123" });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe("Klinik Test");
    });

    it("should return 500 if creating clinic throws an error", async () => {
      const { token } = await createAdminAndToken();

      jest.spyOn(ClinicModel, "findOne").mockImplementationOnce(() => {
        throw new Error("DB error");
      });

      const res = await request(app)
        .post("/api/clinics")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Fejl Klinik", address: "Fejlvej 1" });

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Error");
      // alle jest.spyOn og mocks bliver nulstillet
      // slkal ik påvirke de næste test -> risker at db stadig fejler pga mock stadig er aktiv
      jest.restoreAllMocks();
    });

    it("should not allow admin to create multiple clinics", async () => {
      const { admin, token } = await createAdminAndToken();

      await ClinicModel.create({
        name: "Allerede Klinik",
        address: "Eksisterendevej 1",
        created_by: admin._id,
      });

      const res = await request(app)
        .post("/api/clinics")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Ny Klinik", address: "Nyvej 2" });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/allerede oprettet/i);
    });
  });

  describe("GET /api/clinics/", () => {
    it("should return all clinics", async () => {
      await ClinicModel.create({
        name: "Klinik 1",
        address: "Adresse 1",
        created_by: new mongoose.Types.ObjectId(),
      });

      const res = await request(app).get("/api/clinics");
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
    it("should return 500 if getClinics throws error", async () => {
      jest
        .spyOn(ClinicModel, "find")
        .mockRejectedValueOnce(new Error("DB error"));

      const res = await request(app).get("/api/clinics");
      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Error");

      // alle jest.spyOn og mocks bliver nulstillet
      // slkal ik påvirke de næste test -> risker at db stadig fejler pga mock stadig er aktiv
      jest.restoreAllMocks();
    });
  });

  describe("GET /api/clinics/:id", () => {
    it("should return a clinic by ID", async () => {
      const clinic = await ClinicModel.create({
        name: "Specifik Klinik",
        address: "specifik 99",
        created_by: new mongoose.Types.ObjectId(),
      });

      const res = await request(app).get(`/api/clinics/${clinic._id}`);
      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Specifik Klinik");
    });

    it("should return 404 if clinic not found", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/clinics/${fakeId}`);
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Clinic not found");
    });

    // Tvinger getClinicById til at fejle
    it("should return 500 if getClinicById throws error", async () => {
      const fakeId = new mongoose.Types.ObjectId();

      jest
        .spyOn(ClinicModel, "findById")
        .mockRejectedValueOnce(new Error("Failed"));

      const res = await request(app).get(`/api/clinics/${fakeId}`);
      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Server error");

      jest.restoreAllMocks();
    });
  });

  describe("GET /api/clinics/my", () => {
    it("should return clinic for logged-in admin", async () => {
      const { admin, token } = await createAdminAndToken();

      await ClinicModel.create({
        name: "Klinik Eksempel",
        address: "klinikvej 10",
        created_by: admin._id,
      });

      const res = await request(app)
        .get("/api/clinics/my")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Klinik Eksempel");
    });

    it("should return 404 if admin has no clinic", async () => {
      const { token } = await createAdminAndToken();

      const res = await request(app)
        .get("/api/clinics/my")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/ikke oprettet/i);
    });

    // Tvinger getMyClinic til at fejle
    it("should return 500 if getMyClinic throws error", async () => {
      const { token } = await createAdminAndToken();

      jest
        .spyOn(ClinicModel, "findOne")
        .mockRejectedValueOnce(new Error("Boom"));

      const res = await request(app)
        .get("/api/clinics/my")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Serverfejl");

      jest.restoreAllMocks();
    });
  });
});
