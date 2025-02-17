import { ActivityType } from "../enums/activity.enum";
export interface Character {
  name: string;
  faction: string;
  class: number;
  level: number;
  attributes: Attributes;
  attributesUpgradeCost: Attributes;
  status: Status;
  currencies: Currencies;
  inventory: Item[]; // Agregamos el inventario al personaje
  shop: Item[]; // Agregamos la tienda al personaje
  activity: Activity | null;
  maxActivityDuration: number[];
  lastFight?: Date;
}

export interface Attributes {
  strength: number;
  endurance: number;
  constitution: number;
  precision: number;
  agility: number;
  vigor: number;
  spirit: number;
  willpower: number;
  arcane: number;
}

export interface Status {
  currentHealth: number;
  totalHealth: number;
  currentStamina: number;
  totalStamina: number;
  currentMana: number;
  totalMana: number;
}

export interface Currencies {
  currentXp: number;
  totalXp: number;
  currentGold: number;
  totalGold: number;
  upgradePoints: number;
}

export interface Activity {
  type: ActivityType;
  startTime: Date;
  duration: number;
}

export interface Message {
  sender: string;
  receiver: string;
  subject: string;
  body: string;
  timestamp: Date;
}

export interface Item {
  id: number;
  name: string;
  itemType: number;
  equipType?: number;
  equipPositionType?: number;
  levelRequired: number;
  price: number;
  bonuses: Record<string, number>; // { "STRENGTH": 10, "AGILITY": 5, ... }
  equipped?: boolean;
  stock?: number; // Número de veces que lo tiene en inventario
}
