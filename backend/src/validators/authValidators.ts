import { body } from "express-validator";

// OWASP-inspireret login validering
export const loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email er påkrævet")
    .isEmail()
    .withMessage("Ugyldig email")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Adgangskode er påkrævet")
    .isLength({ min: 8 })
    .withMessage("Skal være mindst 8 tegn")
    .matches(/[A-Z]/)
    .withMessage("Skal have mindst ét stort bogstav")
    .matches(/[0-9]/)
    .withMessage("Skal have mindst ét tal")
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage("Skal have ét specialtegn"),
];
