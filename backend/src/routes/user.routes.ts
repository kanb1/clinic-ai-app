import express from "express";
import {
  getMyProfile,
  getStaffStatuses,
} from "../controllers/fundament/user.controller";
import { authenticateJWT } from "../middleware/authenticateJWT.middleware";
import { authorizeRoles } from "../middleware/authorizeRoles.middleware";

const router = express.Router();

router.get("/me", authenticateJWT, getMyProfile);
router.get(
  "/staff-statuses",
  authenticateJWT,
  authorizeRoles(["secretary", "doctor"]),
  getStaffStatuses
);

export default router;
