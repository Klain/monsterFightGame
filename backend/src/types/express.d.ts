//backend\src\types\express.d.ts
import { User } from "../models/user.model";
import { Character } from "../models/character";

declare global {
  namespace Express {
    export interface Request {
      locals: {
        user?: User;
        character?: Character;
        activityType?: string;
        maxDuration? : number;
        message?:{
          subject:string,
          body:string,
        }
      };
    }
  }
}
