import express from "express";
import {
  addDoctor,
  addSecretary,
  deleteDoctor,
  deletePatient,
  deleteSecretary,
  getDoctors,
  getPatients,
  getSecretaries,
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
// Get patients list
router.get(
  "/patients-list",
  authorizeRoles(["admin", "secretary"]),
  getPatients
);
// Get doctors list
router.get(
  "/staff/doctors-list",
  authorizeRoles(["admin", "secretary"]),
  getDoctors
);
// Get secretaries list
router.get(
  "/staff/secretaries-list",
  authorizeRoles(["admin", "secretary"]),
  getSecretaries
);

router.use(authorizeRoles(["admin"]));

router.get("/staff", getStaff);
router.post("/staff/doctors", addDoctor);
router.post("/staff/secretary", addSecretary);
router.put("/staff/doctors/:id", updateDoctor);
router.put("/staff/secretaries/:id", updateSecretary);
router.delete("/staff/doctors/:id", deleteDoctor);
router.delete("/staff/secretaries/:id", deleteSecretary);

//CPR-lookup
router.get("/lookup/:cpr", lookupPatientByCpr);

router.put("/:id", updatePatient);

router.delete("/:id", deletePatient);

// Genbrug fra sekretær:
router.post("/messages", sendMessage);

// MIDLERTIDIG - SKAL SLETTES - Migration for at oprette journaler
// router.post("/migrate-journals", migrateMissingJournals);

export default router;
