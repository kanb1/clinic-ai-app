import { Request, Response, NextFunction } from "express";
// samler alle valideringsfejl fra tidligere middleware
import { validationResult } from "express-validator";

// Middleware for at undgå for detaljerede fejl
// Sender generelle fejlbeskeder (OWASP) -> "Security Misconfiguration & Sensitive Data Exposure"

// bruges efter min validators i routen
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // samler alle valideringsfejl, som er blevet registreret af mine valideringsregler (validators)
  // fx body("email").isEmail()
  const errors = validationResult(req);

  // hvis fejl:
  if (!errors.isEmpty()) {
    // returnerer status 400
    res.status(400).json({
      // generel fejlbesked
      message: "Ugyldige input",
      // liste (err.msg) ->  kun  fejlbeskederne --> ignorer de teknsike detaljer -> fx ikke param, localtion osv
      // det som sendes tilbage til frontend som errors
      // beskytter mod input mapping attacks
      errors: errors.array().map((err) => err.msg),
    });
    return;
  }
  // ingen fejl? -> næst emiddleware eller routehandler
  next();
};
