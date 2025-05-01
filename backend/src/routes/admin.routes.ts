import express from "express";
import {
  addDoctor,
  addSecretary,
  getStaff,
} from "../controllers/admin/staff.controller";
import { authenticateJWT } from "../middleware/authenticateJWT.middleware";
import { authorizeRoles } from "../middleware/authorizeRoles.middleware";

const router = express.Router();

// Alle routes her kræver login og admin rolle
router.use(authenticateJWT);
router.use(authorizeRoles(["admin"]));

router.get("/staff", getStaff);
router.post("/staff/doctors", addDoctor);
router.post("/staff/secretary", addSecretary);

export default router;
