//backend\src\constants\activities.ts
export const validActivities = ["trabajo", "entrenamiento"] as const;

export type ActivityType = typeof validActivities[number];

export function isActivity(value: string): value is ActivityType {
  return validActivities.includes(value as ActivityType);
}
