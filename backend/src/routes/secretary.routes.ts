import express from "express";
import { authenticateJWT } from "../middleware/authenticateJWT.middleware";
import { authorizeRoles } from "../middleware/authorizeRoles.middleware";
import { getUnreadMessages } from "../controllers/secretary/secretary.controller";

const router = express.Router();

// Alle routes her kræver login og admin rolle
router.use(authenticateJWT);
router.use(authorizeRoles(["secretary"]));

router.get(
  "/messages/unread",
  authenticateJWT,
  authorizeRoles(["secretary"]),
  getUnreadMessages
);

export default router;
