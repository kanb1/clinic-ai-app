import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      message: "Ugyldige input",
      errors: errors.array().map((err) => err.msg), // undgår tekniske detaljer for hackeren
    });
    return;
  }
  next();
};
