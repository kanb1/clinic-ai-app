import express from "express";
import { authenticateJWT } from "../middleware/authenticateJWT.middleware";
import { authorizeRoles } from "../middleware/authorizeRoles.middleware";
import { getUnreadMessagesForPatient } from "../controllers/patient/patient.controller";

const router = express.Router();

router.use(authenticateJWT);
router.use(authorizeRoles(["patient"]));

router.get("/messages/unread", getUnreadMessagesForPatient);

export default router;
