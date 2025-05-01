import express from "express";
import {
  addDoctor,
  addSecretary,
  deleteDoctor,
  deleteSecretary,
  getStaff,
  updateDoctor,
  updateSecretary,
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
router.put("/staff/doctors/:id", updateDoctor);
router.put("/staff/secretaries/:id", updateSecretary);
router.delete("/staff/doctors/:id", deleteDoctor);
router.delete("/staff/secretaries/:id", deleteSecretary);

export default router;
