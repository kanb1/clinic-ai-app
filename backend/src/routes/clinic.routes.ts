import express from "express";
import {
  createClinic,
  getClinicById,
  getClinics,
  getMyClinic,
} from "../controllers/fundament/clinic.controller";
import { authenticateJWT } from "../middleware/authenticateJWT.middleware";
import { authorizeRoles } from "../middleware/authorizeRoles.middleware";

const router = express.Router();

// /api/clinics/x
router.post("/", authenticateJWT, authorizeRoles(["admin"]), createClinic);
router.get("/", getClinics);
router.get("/my", authenticateJWT, authorizeRoles(["admin"]), getMyClinic);
router.get("/:id", getClinicById);

export default router;
