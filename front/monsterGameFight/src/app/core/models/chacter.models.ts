export interface Character {
  id: number;
  userId: number;
  name: string;
  faction: string;
  class: number;
  level: number;

  strength: number;
  endurance: number;
  constitution: number;
  precision: number;
  agility: number;
  vigor: number;
  spirit: number;
  willpower: number;
  arcane: number;

  currentHealth: number;
  totalHealth: number;
  currentStamina: number;
  totalStamina: number;
  currentMana: number;
  totalMana: number;

  characterId: number;
  currentXp: number;
  totalXp: number;
  currentGold: number;
  totalGold: number;

  upgradePoints: number;
  lastFight?: Date;
}
