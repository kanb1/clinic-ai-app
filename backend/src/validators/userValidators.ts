import { body } from "express-validator";

// OWASP-cheatsheet: Begræns værdier til whitelist af gyldige inputs (isIn), især når man opdaterer brugerdata
export const updateStatusValidator = [
  body("status")
    .isIn(["ledig", "optaget"])
    .withMessage("Status skal være enten 'ledig' eller 'optaget'"),
];
