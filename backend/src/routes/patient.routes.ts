import express from "express";
import { authenticateJWT } from "../middleware/authenticateJWT.middleware";
import { authorizeRoles } from "../middleware/authorizeRoles.middleware";
import {
  getUnreadMessagesForPatient,
  markMessageAsRead,
} from "../controllers/patient/patient.controller";

const router = express.Router();

router.use(authenticateJWT);
router.use(authorizeRoles(["patient"]));

router.get("/messages/unread", getUnreadMessagesForPatient);
router.patch("/messages/:id/read", markMessageAsRead);

export default router;
