import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/express";
import { SessionModel } from "../models/session.model";

export const authenticateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Couldn't find any token" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("The JWT_SECRET is missing");
    }

    // er tokenet gyldigt? er signaturen korrekt?
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;

    // Tjekker JTI i databasen
    const session = await SessionModel.findOne({ jti: decoded.jti });
    if (!session) {
      res
        .status(401)
        .json({ message: "Token is no longer valid (session not found)" });
      return;
    }

    // hvis ja, så får vi payloaden ud --> gemmer payloaden i req.user
    //  kan nemlig bruges i andre routes
    req.user = {
      _id: decoded._id,
      role: decoded.role,
      clinicId: decoded.clinicId,
    }; // hvis alt er ok, gå videre til næste middleware eller route
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Invalid or expired token" });
    return;
  }
};
