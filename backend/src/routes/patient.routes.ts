import express from "express";
import { authenticateJWT } from "../middleware/authenticateJWT.middleware";
import { authorizeRoles } from "../middleware/authorizeRoles.middleware";
import {
  confirmAppointment,
  getUnreadMessagesForPatient,
  getUpcomingAppointments,
  markMessageAsRead,
} from "../controllers/patient/patient.controller";

const router = express.Router();

router.use(authenticateJWT);
router.use(authorizeRoles(["patient"]));

// Messages
router.get("/messages/unread", getUnreadMessagesForPatient);
router.patch("/messages/:id/read", markMessageAsRead);

// Aftalehåndtering
router.get("/appointments/upcoming", getUpcomingAppointments);
router.patch("/appointments/:id/confirm", confirmAppointment);

// Sundhedsdata
// Brugerprofil
// AI/Chatbot

export default router;
