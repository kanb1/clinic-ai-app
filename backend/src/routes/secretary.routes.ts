import express from "express";
import { authenticateJWT } from "../middleware/authenticateJWT.middleware";
import { authorizeRoles } from "../middleware/authorizeRoles.middleware";
import {
  getPatients,
  getUnreadMessages,
  markMessageAsReadBySecretary,
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

// Kalender og ledige tider
// Booking og notering
// Dashboard og historik
export default router;
