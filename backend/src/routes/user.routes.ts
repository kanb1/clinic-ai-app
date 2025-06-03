import express from "express";
import {
  getMyProfile,
  getPatients,
  getStaffStatuses,
  updateMyOwnStatus,
} from "../controllers/fundament/user.controller";
import { authenticateJWT } from "../middleware/authenticateJWT.middleware";
import { authorizeRoles } from "../middleware/authorizeRoles.middleware";
import { updateStatusValidator } from "../validators/userValidators";
import { handleValidationErrors } from "../middleware/validationError.middleware";

const router = express.Router();

router.get("/me", authenticateJWT, getMyProfile);
router.get(
  "/staff-statuses",
  authenticateJWT,
  authorizeRoles(["secretary", "doctor"]),
  getStaffStatuses
);
router.patch(
  "/update-status/me",
  authenticateJWT,
  authorizeRoles(["secretary", "doctor"]),
  updateMyOwnStatus
);
router.get(
  "/patients",
  authenticateJWT,
  authorizeRoles(["secretary", "doctor"]),
  updateStatusValidator,
  handleValidationErrors,
  getPatients
);

export default router;
