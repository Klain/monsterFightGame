export interface Opponent {
    id: number;
    name: string;
    level: number;
  }
  
  export interface CombatResult {
    message: string;
    battle_log: string[];
    xpGained: number;
    goldGained: number;
  }
  
  export interface HeistLog {
    message: string;
    log: string[];
  }