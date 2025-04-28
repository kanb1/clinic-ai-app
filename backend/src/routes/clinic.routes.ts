import express from "express";
import { createClinic, getClinics } from "../controllers/clinic.controller";

const router = express.Router();

// /api/clinics/x
router.post("/", createClinic);
router.get("/", getClinics);

export default router;
