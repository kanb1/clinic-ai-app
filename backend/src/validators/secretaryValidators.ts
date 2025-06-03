import { body, param, query } from "express-validator";

export const validateSendMessage = [
  body("receiver_id").isMongoId().withMessage("Ugyldigt modtager-ID"),
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Beskedindhold er påkrævet")
    .isLength({ max: 1000 })
    .withMessage("Besked må maks være 1000 tegn"),
];

export const validateMarkMessageAsRead = [
  param("id").isMongoId().withMessage("Ugyldigt besked-ID"),
];

export const validateBookAppointment = [
  body("patient_id").isMongoId().withMessage("Ugyldigt patient-ID"),
  body("doctor_id").isMongoId().withMessage("Ugyldigt læge-ID"),
  body("date").isISO8601().withMessage("Dato skal være gyldig (YYYY-MM-DD)"),
  body("time")
    .matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("Tidsformat skal være HH:mm"),
  body("secretary_note")
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage("Noten må maks være 500 tegn"),
];

export const validateCreateAppointment = [
  body("doctorId")
    .notEmpty()
    .withMessage("Læge-ID er påkrævet")
    .isMongoId()
    .withMessage("Ugyldigt læge-ID"),

  body("patientId")
    .notEmpty()
    .withMessage("Patient-ID er påkrævet")
    .isMongoId()
    .withMessage("Ugyldigt patient-ID"),

  body("date")
    .notEmpty()
    .withMessage("Dato er påkrævet")
    .isISO8601()
    .withMessage("Ugyldig datoformat. Brug ISO8601"),

  body("time")
    .notEmpty()
    .withMessage("Tidspunkt er påkrævet")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("Ugyldigt tidsformat (fx 14:30)"),
];

export const validateAddNoteToAppointment = [
  body("appointmentId")
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
  query("doctorId")
    .notEmpty()
    .withMessage("Læge-ID er påkrævet")
    .isMongoId()
    .withMessage("Ugyldigt læge-ID"),

  query("date")
    .notEmpty()
    .withMessage("Dato er påkrævet")
    .isISO8601()
    .withMessage("Ugyldig datoformat"),
];
