import { Request, Response, NextFunction } from 'express';

// middleware tager et argument: allowedRoles: Liste fx ["admin", "doctor"]
export const authorizeRoles = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Tjekker om req.user.role findes i listen
    // user.role findes allerede for brugeren i db -> Pakkes nemlig ind i jwt-payloaden når logger ind
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        message: 'Access denied: You don\'t have the permission for this',
      });
      return;
    }
    next();
  };
};
