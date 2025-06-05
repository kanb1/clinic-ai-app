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
  sendSystemMessage,
  updateDoctor,
  updatePatient,
  updateSecretary,
} from "../controllers/admin/staff.controller";
import { authenticateJWT } from "../middleware/authenticateJWT.middleware";
import { authorizeRoles } from "../middleware/authorizeRoles.middleware";
import { sendMessage } from "../controllers/secretary/secretary.controller";
import {
  validateAddDoctor,
  validateAddSecretary,
  validateUpdateDoctor,
  validateUpdatePatient,
  validateUpdateSecretary,
} from "../validators/adminValidators";
import { handleValidationErrors } from "../middleware/validationError.middleware";

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
router.post(
  "/staff/doctors",
  validateAddDoctor,
  handleValidationErrors,
  addDoctor
);
router.post(
  "/staff/secretary",
  validateAddSecretary,
  handleValidationErrors,
  addSecretary
);
router.put(
  "/staff/doctors/:id",
  handleValidationErrors,
  validateUpdateDoctor,
  updateDoctor
);
router.put(
  "/staff/secretaries/:id",
  handleValidationErrors,
  validateUpdateSecretary,
  updateSecretary
);
router.delete("/staff/doctors/:id", handleValidationErrors, deleteDoctor);
router.delete(
  "/staff/secretaries/:id",
  handleValidationErrors,
  deleteSecretary
);

//CPR-lookup
router.get("/lookup/:cpr", lookupPatientByCpr);

router.put(
  "/:id",
  handleValidationErrors,
  validateUpdatePatient,
  updatePatient
);

router.delete("/:id", deletePatient);
router.post("/system-messages", handleValidationErrors, sendSystemMessage);

export default router;
