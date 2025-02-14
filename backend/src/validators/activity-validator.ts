//backend\src\constants\activities.ts
import { ActivityType } from "../constants/enums";
export function isActivity(value: number): value is ActivityType {
  return Object.values(ActivityType).includes(value);
}
