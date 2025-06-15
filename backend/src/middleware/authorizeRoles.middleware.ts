import { Request, Response, NextFunction } from "express";

// laver en funktion der returnerer en middleware (kalder authroizeRoles med en lsite af tilladte roller):
// auhtorizeRoles(["admin", "doctor"])
// express bruger til at beskytte route og kaldes hver gang en beskyttet route rammes:
export const authorizeRoles = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // !re.user: har authJWT sat req.user? -> ik korrekt logget ind
    // har brugeren den korrekte rolle?
    // begge må ik fejle
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        message: "Access denied: You don't have the permission for this",
      });
      return;
    }
    next();
  };
};
