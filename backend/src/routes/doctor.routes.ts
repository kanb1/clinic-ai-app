import express from "express";
import { authenticateJWT } from "../middleware/authenticateJWT.middleware";
import { authorizeRoles } from "../middleware/authorizeRoles.middleware";
import { createPrescription } from "../controllers/doctor/doctor.controller";

const router = express.Router();

router.use(authenticateJWT);
router.use(authorizeRoles(["doctor"]));

router.post("/prescriptions", createPrescription);

export default router;
