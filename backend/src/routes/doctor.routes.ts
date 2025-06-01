import express from "express";
import { authenticateJWT } from "../middleware/authenticateJWT.middleware";
import { authorizeRoles } from "../middleware/authorizeRoles.middleware";
import {
  cancelAppointmentByDoctor,
  createPrescription,
  createTestJournalEntry,
  createTestResult,
  getAppointmentsForDoctor,
  getChatSessionByAppointment,
  getJournalById,
  getJournalOverview,
  getPatientDetails,
  getPatientsForDoctor,
  getPrescriptionsByPatient,
  getTestResultsByPatient,
  getTodayAppointmentDetails,
  getTodaysAppointments,
} from "../controllers/doctor/doctor.controller";
import { JournalModel } from "../models/journal.model";
import { UserModel } from "../models/user.model";
import {
  createJournalEntry,
  getOrCreateJournalByPatientId,
} from "../controllers/doctor/journal.controller";

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
router.get("/patients", getPatientsForDoctor);
router.get("/patients/:id", getPatientDetails);

// Journaler
router.get("/journals", getJournalOverview);
router.get("/journals/:id", getJournalById);
router.post("/journalentry", createJournalEntry);
router.get("/journals/patient/:patientId", getOrCreateJournalByPatientId);
router.post("/test/create-journal-entry", createTestJournalEntry); //SEED JOURNAL ENTRIES

// Recept og Testresultater
router.post("/prescriptions", createPrescription);
router.get("/prescriptions/:patientId", getPrescriptionsByPatient);
router.post("/test/create-testresults", createTestResult); //SEED TEST RESULTS
router.get("/testresults/:patientId", getTestResultsByPatient);

// AI-noter og journal
router.get("/ai-notes/:appointmentId", getChatSessionByAppointment);

export default router;
