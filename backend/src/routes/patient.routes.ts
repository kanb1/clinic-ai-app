import express from "express";
import { authenticateJWT } from "../middleware/authenticateJWT.middleware";
import { authorizeRoles } from "../middleware/authorizeRoles.middleware";
import {
  cancelAppointment,
  confirmAppointment,
  getPrescriptionsForPatient,
  getUnreadMessagesForPatient,
  getUpcomingAppointments,
  markMessageAsRead,
  updateMyProfile,
} from "../controllers/patient/patient.controller";
import {
  saveChatHistory,
  startChatSession,
} from "../controllers/patient/ai.controller";
import { chatLimiter } from "../middleware/rateLimiters";
import { handleValidationErrors } from "../middleware/validationError.middleware";
import {
  validateAppointmentIdParam,
  validateMessageIdParam,
  validatePatientIdParam,
  validateUpdateProfile,
} from "../validators/patientValidators";

const router = express.Router();

router.use(authenticateJWT);
router.use(authorizeRoles(["patient"]));

// Messages
router.get("/messages/unread", getUnreadMessagesForPatient);
router.patch(
  "/messages/:id/read",
  validateMessageIdParam,
  handleValidationErrors,
  markMessageAsRead
);

// Aftalehåndtering
router.get("/appointments/upcoming", getUpcomingAppointments);
router.patch(
  "/appointments/:id/confirm",
  validateAppointmentIdParam,
  handleValidationErrors,
  confirmAppointment
);
router.patch(
  "/appointments/:id/cancel",
  validateAppointmentIdParam,
  handleValidationErrors,
  cancelAppointment
);

// Sundhedsdata
router.get(
  "/prescriptions/:patientId",
  validatePatientIdParam,
  handleValidationErrors,
  getPrescriptionsForPatient
);

// Brugerprofil
// (Hente brugerprofils oplysninger ligger inde i user controlleren, "getMyProfile")
router.put(
  "/profile",
  validateUpdateProfile,
  handleValidationErrors,
  updateMyProfile
);

// AI/Chatbot
router.post("/ai/start", chatLimiter, startChatSession);
router.post("/ai/save-chat", saveChatHistory);

export default router;
