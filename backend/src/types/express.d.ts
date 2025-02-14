//backend\src\types\express.d.ts
import { User } from "../models/user.model";
import { Character } from "../models/character";
import { ActivityType } from "../constants/enums";

declare global {
  namespace Express {
    export interface Request {
      locals: {
        user?: User;
        character?: Character;
        activityType?: ActivityType;
        maxDuration? : number;
        message?:{
          subject:string,
          body:string,
        },
        combat?:{
          defender:Character
        }

      };
    }
  }
}
