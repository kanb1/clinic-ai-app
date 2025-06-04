import { body } from "express-validator";

// baseret på OWASP
// express-validators isStrongPassword() tillader 8 tegn mens owasp anbefaler 12 tegn
const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{12,}$/;

export const validateAddDoctor = [
  body("name").trim().notEmpty().withMessage("Navn er påkrævet"),
  body("email")
    .trim()
    .isLength({ max: 254 })
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    .withMessage("Ugyldig e-mailadresse"),
  body("password")
    .matches(strongPasswordRegex)
    .withMessage(
      "Adgangskoden skal være mindst 12 tegn og indeholde store og små bogstaver, tal og specialtegn"
    ),
];

export const validateUpdateDoctor = [
  body("name").optional().isString(),
  body("email")
    .trim()
    .isLength({ max: 254 })
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    .withMessage("Ugyldig e-mailadresse"),
  body("phone").optional().isString(),
  body("address").optional().isString(),
  body("password")
    .optional()
    .matches(strongPasswordRegex)
    .withMessage(
      "Adgangskoden skal være mindst 12 tegn og indeholde store og små bogstaver, tal og specialtegn"
    ),
  body("status").optional().isIn(["ledig", "optaget"]),
];

export const validateAddSecretary = [
  body("name").trim().notEmpty().withMessage("Navn er påkrævet"),
  body("email")
    .trim()
    .isLength({ max: 254 })
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    .withMessage("Ugyldig e-mailadresse"),
  body("password")
    .matches(strongPasswordRegex)
    .withMessage(
      "Adgangskoden skal være mindst 12 tegn og indeholde store og små bogstaver, tal og specialtegn"
    ),
];

export const validateUpdateSecretary = [
  body("name").optional().isString(),
  body("email")
    .trim()
    .isLength({ max: 254 })
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    .withMessage("Ugyldig e-mailadresse"),
  body("phone").optional().isString(),
  body("address").optional().isString(),
  body("password")
    .optional()
    .matches(strongPasswordRegex)
    .withMessage(
      "Adgangskoden skal være mindst 12 tegn og indeholde store og små bogstaver, tal og specialtegn"
    ),
];

export const validateUpdatePatient = [
  body("name").optional().isString(),
  body("email")
    .trim()
    .isLength({ max: 254 })
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    .withMessage("Ugyldig e-mailadresse"),
  body("phone").optional().isString(),
  body("address").optional().isString(),
  body("password")
    .optional()
    .matches(strongPasswordRegex)
    .withMessage(
      "Adgangskoden skal være mindst 12 tegn og indeholde store og små bogstaver, tal og specialtegn"
    ),
];
