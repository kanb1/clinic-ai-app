import express from "express";
import { login, register } from "../controllers/fundament/auth.controller";
import { authenticateJWT } from "../middleware/authenticateJWT.middleware";
import { loginLimiter } from "../middleware/rateLimiters";

const router = express.Router();

router.post("/login", loginLimiter, login);
router.post("/register", register);

// hente brugerinfo efter page refresh
// returnerer brugerens data baseret på gyldig JWT
// bruges af frontend til at hente brugerinfo efter refresh (fx i AuthProvider)
router.get("/me", authenticateJWT, (req, res) => {
  res.json({ user: req.user });
});

export default router;
