import { body, param } from "express-validator";

export const createClinicValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Kliniknavn er påkrævet")
    .isLength({ min: 2, max: 100 })
    .withMessage("Navn skal være mellem 2 og 100 tegn"),

  body("address")
    .trim()
    .notEmpty()
    .withMessage("Adresse er påkrævet")
    .isLength({ min: 5, max: 200 })
    .withMessage("Adresse skal være mellem 5 og 200 tegn"),
];

// Id, Så det ikke kan misbruges
// beskytter mod f.eks. SQL injection lignende attacks i MongoDB queries
export const clinicIdValidator = [
  param("id").isMongoId().withMessage("Ugyldigt klinik-ID"),
];
