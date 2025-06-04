import express from "express";
import {
  login,
  logout,
  register,
} from "../controllers/fundament/auth.controller";
import { authenticateJWT } from "../middleware/authenticateJWT.middleware";
import { loginLimiter } from "../middleware/rateLimiters";
import { handleValidationErrors } from "../middleware/validationError.middleware";
import { loginValidator } from "../validators/authValidators";

const router = express.Router();

router.post(
  "/login",
  loginValidator,
  handleValidationErrors,
  loginLimiter,
  login
);
router.post("/logout", authenticateJWT, logout);
router.post("/register", register);

// hente brugerinfo efter page refresh
// returnerer brugerens data baseret på gyldig JWT
// bruges af frontend til at hente brugerinfo efter refresh (fx i AuthProvider)
router.get("/me", authenticateJWT, (req, res) => {
  res.json({ user: req.user });
});

export default router;
