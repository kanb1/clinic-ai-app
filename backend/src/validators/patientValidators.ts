import { body, param } from "express-validator";

// PATCH /messages/:id/read
export const validateMessageIdParam = [
  param("id").isMongoId().withMessage("Ugyldigt message ID"),
];

// PATCH /appointments/:id/confirm /cancel
export const validateAppointmentIdParam = [
  param("id").isMongoId().withMessage("Ugyldigt aftale ID"),
];

// GET /prescriptions/:patientId
export const validatePatientIdParam = [
  param("patientId").isMongoId().withMessage("Ugyldigt patient ID"),
];

// PUT /profile
export const validateUpdateProfile = [
  body("email").optional().isEmail().withMessage("Ugyldig e-mail"),
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
