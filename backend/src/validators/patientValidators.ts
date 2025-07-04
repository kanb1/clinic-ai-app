import { body, param } from "express-validator";

export const validateMessageIdParam = [
  param("id").isMongoId().withMessage("Ugyldigt message ID"),
];

export const validateAppointmentIdParam = [
  param("id").isMongoId().withMessage("Ugyldigt aftale ID"),
];

export const validatePatientIdParam = [
  param("patientId").isMongoId().withMessage("Ugyldigt patient ID"),
];

export const validateUpdateProfile = [
  body("email")
    .trim()
    .isLength({ max: 254 })
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    .withMessage("Ugyldig e-mailadresse"),
  body("phone")
    .optional()
    .isMobilePhone("da-DK")
    .withMessage("Ugyldigt telefonnummer"),
  body().custom((body) => {
    if (!body.email && !body.phone) {
      throw new Error("Du skal angive mindst e-mail eller telefonnummer");
    }
    return true;
  }),
];
