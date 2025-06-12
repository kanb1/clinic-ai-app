import { Request, Response, NextFunction } from "express";

export const authorizeRoles = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        message: "Access denied: You don't have the permission for this",
      });
      return;
    }
    next();
  };
};
