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
  getAppointmentsWithJournalForPatient,
  getOrCreateJournalByPatientId,
} from "../controllers/doctor/journal.controller";
import { handleValidationErrors } from "../middleware/validationError.middleware";
import {
  validateCancelAppointment,
  validateCreatePrescription,
  validateGetJournalById,
  validateGetPatientDetails,
  validateTodayAppointmentDetails,
} from "../validators/doctorValidators";

const router = express.Router();

router.use(authenticateJWT);
router.use(authorizeRoles(["doctor"]));

// Dashboard (overblik og status på ansatte)
router.get("/appointments/today", getTodaysAppointments);
// status på ansatte er i user-controlleren, da både sekretær og doctor bruger denne

// Kalender (oversigt over alle aftaler)
router.get("/appointments", getAppointmentsForDoctor);

// Dagens aftaler (patientdetaljer og muligheder)
router.get(
  "/appointments/today-details",
  validateTodayAppointmentDetails,
  handleValidationErrors,
  getTodayAppointmentDetails
);
router.patch(
  "/appointments/:id/cancel",
  validateCancelAppointment,
  handleValidationErrors,
  cancelAppointmentByDoctor
);

// Patientoversigt
router.get("/patients", getPatientsForDoctor);
router.get(
  "/patients/:id",
  validateGetPatientDetails,
  handleValidationErrors,
  getPatientDetails
);

// Journaler
router.get("/journals", getJournalOverview);
router.get(
  "/journals/:id",
  validateGetJournalById,
  handleValidationErrors,
  getJournalById
);
router.post("/test/create-journal-entry", createTestJournalEntry); //SEED JOURNAL ENTRIES

// Recept og Testresultater
router.post(
  "/prescriptions",
  validateCreatePrescription,
  handleValidationErrors,
  createPrescription
);
router.get("/prescriptions/:patientId", getPrescriptionsByPatient);
router.post("/test/create-testresults", createTestResult); //SEED TEST RESULTS
router.get("/testresults/:patientId", getTestResultsByPatient);

// AI-noter og journal
router.get("/ai-notes/:appointmentId", getChatSessionByAppointment);
router.get(
  "/appointments-with-journal/:patientId",
  getAppointmentsWithJournalForPatient
);
router.get("/journals/patient/:patientId", getOrCreateJournalByPatientId);
router.post("/journalentry", createJournalEntry);

export default router;
