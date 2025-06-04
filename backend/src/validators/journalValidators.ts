import { param, body } from "express-validator";

export const validateGetOrCreateJournal = [
  param("patientId").isMongoId().withMessage("Ugyldigt patient ID"),
];

export const validateCreateJournalEntry = [
  body("journalId").isMongoId().withMessage("Ugyldigt journal ID"),
  body("appointmentId").isMongoId().withMessage("Ugyldigt aftale ID"),
  body("notes").isString().notEmpty().withMessage("Notat skal udfyldes"),
];

export const validateGetAppointmentsWithJournal = [
  param("patientId").isMongoId().withMessage("Ugyldigt patient ID"),
];
