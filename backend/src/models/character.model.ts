 //backend\src\models\character.ts
 export class Character {
  id: number = 0;
  userId: number = 0;
  name: string = "";
  faction: string = "";
  class: number = 1;
  level: number = 1;

  strength: number = 1;
  endurance: number = 1;
  constitution: number = 1;
  precision: number = 1;
  agility: number = 1;
  vigor: number = 1;
  spirit: number = 1;
  willpower: number = 1;
  arcane: number = 1;

  currentHealth: number = 100;
  totalHealth: number = 100;
  currentStamina: number = 100;
  totalStamina: number = 100;
  currentMana: number = 100;
  totalMana: number = 100;

  characterId: number = 0;
  currentXp: number = 0;
  totalXp: number = 0;
  currentGold: number = 0;
  totalGold: number = 0;

  upgradePoints: number = 0;
  lastFight?: Date;

  constructor(data: Partial<Character>) {
    Object.assign(this, data);
  }

  calculateUpgradeCost(attributeValue: number): number {
    return 100 + attributeValue * 10;
  }

  getHealthPercentage(): number {
    return (this.currentHealth / this.totalHealth) * 100;
  }

  isDead(): boolean {
    return this.currentHealth <= 0;
  }

  // Método para calcular el nivel basado en la experiencia total
  getLevelFromXp(): number {
    return Math.floor(this.totalXp / 1000);
  }

  // Método para verificar si tiene suficiente oro
  hasEnoughGold(amount: number): boolean {
    return this.currentGold >= amount;
  }
}
