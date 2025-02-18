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
  backpack: Item[]; 
  equip: Item[]; 
  shop: Item[];
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
  id : number;
  name : string;
  itemType : number;
  levelRequired : number;
  stock : number; // Número de veces que lo tiene en inventario
  priceBuy : number;
  priceSell : number;
  imageUrl? : string;

  equipType?: number;
  equipPositionType?: number;
  effects?: { effect_name: string; value: number }[];
  equipped?: boolean;
}
