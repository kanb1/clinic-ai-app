import express from "express";
import { getMyProfile } from "../controllers/fundament/user.controller";
import { authenticateJWT } from "../middleware/authenticateJWT.middleware";

const router = express.Router();

router.get("/me", authenticateJWT, getMyProfile);

export default router;
