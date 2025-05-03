import { JwtPayload as DefaultJwtPayload } from 'jsonwebtoken';

export interface JwtPayload extends DefaultJwtPayload {
  userId: string;
  role: string;
  clinicId: string;
}
// tilføjer selv user property på request typen af express

//  req: {
//   headers: {...},
//   body: {...},
//   params: {...},
//   query: {...}
// og nu også user: {
//userId: string;
//role: string;
// clinicId: string;}
// }
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
