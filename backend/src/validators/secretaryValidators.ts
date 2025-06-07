import { body, param, query } from "express-validator";

export const validateSendMessage = [
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Beskedindhold er påkrævet")
    .isLength({ max: 1000 })
    .withMessage("Besked må maks være 1000 tegn"),

  body("receiver_scope")
    .notEmpty()
    .isIn(["individual", "patients", "staff", "all"])
    .withMessage("Ugyldig receiver_scope"),

  // Kun hvis receiver_scope === "individual" - da den ellers ik er nødvendig da receiver_scope==="all"
  body("receiver_id")
    .if(body("receiver_scope").equals("individual"))
    .isMongoId()
    .withMessage("Ugyldigt modtager-ID"),
];

export const validateMarkMessageAsRead = [
  param("id").isMongoId().withMessage("Ugyldigt besked-ID"),
];

export const validateCreateAppointment = [
  body("doctor_id").isMongoId().withMessage("Ugyldigt læge-ID"),
  body("patient_id").isMongoId().withMessage("Ugyldigt patient-ID"),
  body("slot_id").isMongoId().withMessage("Ugyldigt slot-ID"),
  body("secretary_note")
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage("Noten må maks være 500 tegn"),
];

export const validateAddNoteToAppointment = [
  param("id")
    .notEmpty()
    .withMessage("Aftale-ID er påkrævet")
    .isMongoId()
    .withMessage("Ugyldigt aftale-ID"),

  body("note")
    .notEmpty()
    .withMessage("Note er påkrævet")
    .isLength({ max: 1000 })
    .withMessage("Noten må maks være 1000 tegn"),
];

export const validateAvailabilityQuery = [
  query("doctorId").optional().isMongoId().withMessage("Ugyldigt læge-ID"),

  query("weekStart")
    .notEmpty()
    .withMessage("weekStart er påkrævet")
    .isISO8601()
    .withMessage("Ugyldigt datoformat"),
];
