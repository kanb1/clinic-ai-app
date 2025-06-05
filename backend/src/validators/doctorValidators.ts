import { body, query } from "express-validator";
import { param } from "express-validator";

export const validateTodayAppointmentDetails = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page skal være et positivt tal"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit skal være mellem 1 og 50"),
];

export const validateCancelAppointment = [
  param("id").isMongoId().withMessage("Ugyldigt appointment ID"),
];

export const validateGetPatientDetails = [
  param("id").isMongoId().withMessage("Ugyldigt patient ID"),
];

export const validateGetJournalById = [
  param("id").isMongoId().withMessage("Ugyldigt journal ID"),
];

export const validateCreatePrescription = [
  body("patient_id").isMongoId().withMessage("Ugyldigt patient ID"),

  body("medication_name")
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Medicin-navn skal være mellem 2 og 100 tegn"),

  body("dosage")
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Dosering skal være mellem 2 og 100 tegn"),

  body("instructions")
    .isString()
    .trim()
    .isLength({ min: 2, max: 250 })
    .withMessage("Instruktioner skal være mellem 2 og 250 tegn"),
];
