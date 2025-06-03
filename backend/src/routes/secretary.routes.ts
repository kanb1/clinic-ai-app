import express from "express";
import { authenticateJWT } from "../middleware/authenticateJWT.middleware";
import { authorizeRoles } from "../middleware/authorizeRoles.middleware";
import {
  addSymptomNote,
  checkAndSeedSlots,
  createAppointment,
  getAppointments,
  getAvailabilityOverview,
  getAvailabilitySlots,
  getDoctors,
  getPastAppointmentsToday,
  getTodaysAppointments,
  getUnreadMessages,
  markMessageAsReadBySecretary,
  searchPatients,
  sendMessage,
} from "../controllers/secretary/secretary.controller";
import { messageLimiter } from "../middleware/rateLimiters";
import { handleValidationErrors } from "../middleware/validationError.middleware";
import {
  validateAddNoteToAppointment,
  validateAvailabilityQuery,
  validateBookAppointment,
  validateCreateAppointment,
  validateMarkMessageAsRead,
  validateSendMessage,
} from "../validators/secretaryValidators";

const router = express.Router();

// Alle routes her kræver login og secretary rolle
router.use(authenticateJWT);
router.use(authorizeRoles(["secretary"]));

// Messages
router.get("/messages/unread", getUnreadMessages);
router.post(
  "/messages",
  validateSendMessage,
  handleValidationErrors,
  messageLimiter,
  sendMessage
);
router.patch(
  "/messages/:id/read",
  validateMarkMessageAsRead,
  handleValidationErrors,
  markMessageAsReadBySecretary
);

// Patients and Doctors (Choose)
router.get("/patients", searchPatients); // samme som før, men nu med ?search=
router.get("/doctors", getDoctors);

// Kalender og ledige tider
router.get(
  "/appointments",
  validateBookAppointment,
  handleValidationErrors,
  getAppointments
);
router.get("/availability", authenticateJWT, getAvailabilityOverview);
router.get(
  "/availability-slots",
  validateAvailabilityQuery,
  handleValidationErrors,
  authenticateJWT,
  getAvailabilitySlots
);
router.get("/check-and-seed-slots", authenticateJWT, checkAndSeedSlots);

// Booking og notering
router.post(
  "/appointments",
  validateCreateAppointment,
  handleValidationErrors,
  createAppointment
);
router.patch(
  "/appointments/:id/secretary-note",
  validateAddNoteToAppointment,
  handleValidationErrors,
  addSymptomNote
);

// Dashboard og historik
router.get("/appointments/today", getTodaysAppointments);
router.get("/appointments/past-today", getPastAppointmentsToday);
// staffstatus ligger i user

// ************** SEED ROUTE (KUN MIDLERTIDIGT - SLET SENERE) **************
import { seedAppointmentsToday } from "./test-routes/secretary/seed-secretary-appointments-today";
import { seedAvailabilitySlots } from "./test-routes/secretary/seed-secretary-availability";

router.post("/appointments/seed-today", seedAppointmentsToday);
router.post("/availability/seed", seedAvailabilitySlots);

export default router;
