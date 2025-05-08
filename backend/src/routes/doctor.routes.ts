import express from "express";
import { authenticateJWT } from "../middleware/authenticateJWT.middleware";
import { authorizeRoles } from "../middleware/authorizeRoles.middleware";
import {
  cancelAppointmentByDoctor,
  createPrescription,
  getAppointmentsForDoctor,
  getTodayAppointmentDetails,
  getTodaysAppointments,
} from "../controllers/doctor/doctor.controller";

const router = express.Router();

router.use(authenticateJWT);
router.use(authorizeRoles(["doctor"]));

// Dashboard (overblik og status på ansatte)
router.get("/appointments/today", getTodaysAppointments);
// status på ansatte er i user-controlleren, da både sekretær og doctor bruger denne

// Kalender (oversigt over alle aftaler)
router.get("/appointments", getAppointmentsForDoctor);

// Dagens aftaler (patientdetaljer og muligheder)
router.get("/appointments/today-details", getTodayAppointmentDetails);
router.patch("/appointments/:id/cancel", cancelAppointmentByDoctor);

// Patientoversigt
// Journaler
// Recept og Testresultater
router.post("/prescriptions", createPrescription);
// AI-noter og journal

export default router;
