import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/express'; // eller hvor du nu gemmer det

// vil blive brugt i routes
export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Couldn\'t find any token' });
    return;
  }

  //splitter headeren fra "", altså vi tager selve tokenet efter bearer
  const token = authHeader.split(' ')[1];

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('The JWT_SECRET is missing');
    }

    // er tokenet gyldigt? er signaturen korrekt?
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    // hvis ja, så får vi payloaden ud --> gemmer payloaden i req.user
    //  kan nemlig bruges i andre routes
    req.user = decoded;
    // hvis alt er ok, gå videre til næste middleware eller route
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Invalid or expired token' });
    return;
  }
};
