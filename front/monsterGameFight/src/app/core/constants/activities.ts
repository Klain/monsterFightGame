//src\constants\activities.ts
export const validActivities = ["null","explorar", "sanar","descansar","meditar"] as const;

export type ActivityType = typeof validActivities[number];

export function isActivity(value: string): value is ActivityType {
  return validActivities.includes(value as ActivityType);
}
