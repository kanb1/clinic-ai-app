import { Router } from "express";
import { getPing } from "../controllers/ping.controller";

const router = Router();

router.get("/", getPing);

export default router;
