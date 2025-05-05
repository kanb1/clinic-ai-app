import express from "express";
import { authenticateJWT } from "../middleware/authenticateJWT.middleware";
import { authorizeRoles } from "../middleware/authorizeRoles.middleware";
import {
  getUnreadMessages,
  sendMessage,
} from "../controllers/secretary/secretary.controller";

const router = express.Router();

// Alle routes her kræver login og secretary rolle
router.use(authenticateJWT);
router.use(authorizeRoles(["secretary"]));

router.get("/messages/unread", getUnreadMessages);
router.post("/messages", sendMessage);

export default router;
