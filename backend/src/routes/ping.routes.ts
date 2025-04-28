import { Router } from "express";
import { authenticateJWT } from "../middleware/authenticateJWT.middleware";

const router = Router();

router.get("/protected", authenticateJWT, (req, res) => {
  res.json({ message: "Protected route accessed", user: req.user });
});

export default router;
