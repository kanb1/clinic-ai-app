import { JwtPayload as DefaultJwtPayload } from "jsonwebtoken";

export interface JwtPayload extends DefaultJwtPayload {
  _id: string;
  role: string;
  clinicId: string;
  jti?: string;
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
      user?: {
        _id: string;
        role: string;
        clinicId: string;
        jti?: string;
      };
    }
  }
}
