export interface Character {
  id: number;
  name: string;
  faction:string;
  class:string;
  level: number;

  currentGold: number;
  totalGold: number;
  currentXp: number;
  totalXp: number;
  upgrade_points?: number;

  attack?: number;
  defense?: number;
  health: number;

  last_fight?: Date;
  lastFightResult?: string;

  lastOpponent?: string;
  lastGoldWon?: number;
  lastXpWon?: number;
}