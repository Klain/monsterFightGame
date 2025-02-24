// src/constants/attributes.ts
export const validAttributes = [
    "strength",
    "endurance",
    "constitution",
    "precision",
    "agility",
    "vigor",
    "spirit",
    "willpower",
    "arcane",
  ] as const;
  
  export type AttributeType = typeof validAttributes[number];
  
    export function isAttribute(value: string): value is AttributeType {
    return validAttributes.includes(value as AttributeType);
  }
  