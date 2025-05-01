import express from "express";
import { getPatients } from "../controllers/patient/patient.controller";
import { authenticateJWT } from "../middleware/authenticateJWT.middleware";
import { authorizeRoles } from "../middleware/authorizeRoles.middleware";

const router = express.Router();

router.get(
  "/",
  authenticateJWT,
  authorizeRoles(["admin", "doctor", "secretary"]),
  getPatients
);

export default router;
