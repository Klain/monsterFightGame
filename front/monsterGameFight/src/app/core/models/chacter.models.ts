//front\monsterGameFight\src\app\core\models\chacter.models.ts
import { ActivityType } from "../enums/activity.enum"; 

export interface Character {
  name: string;
  faction: string;
  class: number;
  level: number;
  attributes:Attributes;
  attributesUpgradeCost : Attributes;
  status:Status;
  currencies:Currencies;
  activity: Activity | null;
  maxActivityDuration : Array<number>;
  lastFight?: Date;
}

export interface Attributes{
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

export interface Status{
  currentHealth: number;
  totalHealth: number;
  currentStamina: number;
  totalStamina: number;
  currentMana: number;
  totalMana: number;
}

export interface Currencies{
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
  sender: string,
  receiver: string,
  subject: string,
  body: string,
  timestamp: Date,
}




