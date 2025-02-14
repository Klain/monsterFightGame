//backend\src\constants\activities.ts
import { ActivityType } from "../enums/activity.enum";
function isActivity(value: any): value is ActivityType {
  return Object.values(ActivityType).includes(value);
}
