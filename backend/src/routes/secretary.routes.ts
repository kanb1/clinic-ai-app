import express from "express";
import { authenticateJWT } from "../middleware/authenticateJWT.middleware";
import { authorizeRoles } from "../middleware/authorizeRoles.middleware";
import {
  addSymptomNote,
  createAppointment,
  getAppointments,
  getAvailabilityOverview,
  getDoctors,
  getPastAppointmentsToday,
  getPatients,
  getTodaysAppointments,
  getUnreadMessages,
  markMessageAsReadBySecretary,
  searchPatients,
  sendMessage,
} from "../controllers/secretary/secretary.controller";

const router = express.Router();

// Alle routes her kræver login og secretary rolle
router.use(authenticateJWT);
router.use(authorizeRoles(["secretary"]));

// Messages
router.get("/messages/unread", getUnreadMessages);
router.post("/messages", sendMessage);
router.patch("/messages/:id/read", markMessageAsReadBySecretary);

// Patients and Doctors (Choose)
router.get("/patients", getPatients);
router.get("/patients", searchPatients); // samme som før, men nu med ?search=
router.get("/doctors", getDoctors);

// Kalender og ledige tider
router.get("/appointments", getAppointments);
router.get("/availability", authenticateJWT, getAvailabilityOverview);

// Booking og notering
router.post("/appointments", createAppointment);
router.patch("/appointments/:id/secretary-note", addSymptomNote);

// Dashboard og historik
router.get("/appointments/today", getTodaysAppointments);
router.get("/appointments/past-today", getPastAppointmentsToday);
// staffstatus ligger i user

// ************** SEED ROUTE (KUN MIDLERTIDIGT - SLET SENERE) **************
import { seedAppointmentsToday } from "./test-routes/secretary/seed-secretary-appointments-today";
router.post("/appointments/seed-today", seedAppointmentsToday);

export default router;
