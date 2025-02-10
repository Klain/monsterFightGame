//backend\src\constants\activities.ts
export const validActivities = ["explorar", "sanar","descansar","meditar"] as const;

export type ActivityType = typeof validActivities[number];

export function isActivity(value: string): value is ActivityType {
    const result = validActivities.includes(value as ActivityType);
  return result;
}
