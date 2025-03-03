//front\src\app\core\interfaces\combat.interfaces.ts
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

  export interface LeaderboardCharacter {
    id: number;
    name: string;
    faction: string;
    class: number;
    level: number;
    totalGold: number;
    isFriend: boolean;
    canSendRequest: boolean; 
    isOwnCharacter :boolean;
  }
 
  export interface LeaderboardResponse {
    characters: LeaderboardCharacter[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
  