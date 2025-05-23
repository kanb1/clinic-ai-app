import express from "express";
import {
  addDoctor,
  addSecretary,
  deleteDoctor,
  deletePatient,
  deleteSecretary,
  getPatients,
  getStaff,
  lookupPatientByCpr,
  updateDoctor,
  updatePatient,
  updateSecretary,
} from "../controllers/admin/staff.controller";
import { authenticateJWT } from "../middleware/authenticateJWT.middleware";
import { authorizeRoles } from "../middleware/authorizeRoles.middleware";
import { sendMessage } from "../controllers/secretary/secretary.controller";

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
// Get patients list
router.get("/", getPatients);

//CPR-lookup
router.get("/lookup/:cpr", lookupPatientByCpr);

router.put("/:id", updatePatient);

router.delete("/:id", deletePatient);

// Genbrug fra sekretær:
router.post("/messages", sendMessage);

export default router;
