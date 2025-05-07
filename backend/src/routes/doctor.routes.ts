import express from "express";
import { authenticateJWT } from "../middleware/authenticateJWT.middleware";
import { authorizeRoles } from "../middleware/authorizeRoles.middleware";
import { createPrescription } from "../controllers/doctor/doctor.controller";

const router = express.Router();

router.use(authenticateJWT);
router.use(authorizeRoles(["doctor"]));

// Dashboard (overblik og status på ansatte)
// Kalender (oversigt over alle aftaler)
// Dagens aftaler (patientdetaljer og muligheder)
// Patientoversigt
// Journaler
// Recept og Testresultater
router.post("/prescriptions", createPrescription);
// AI-noter og journal

export default router;
