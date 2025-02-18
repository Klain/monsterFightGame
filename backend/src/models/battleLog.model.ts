export class BattleLog {
    id: number = 0;
    attackerId: number = 0;
    defenderId: number = 0;
    winnerId: number = 0;
    goldWon: number = 0;
    xpWon: number = 0;
    lastAttack: Date = new Date();
  
    constructor(data: Partial<BattleLog>) {
      Object.assign(this, data);
    }
  }
  