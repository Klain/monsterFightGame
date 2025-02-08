export class Status {
  characterId: number = 0;
  currentHealth: number = 100;
  totalHealth: number = 100;
  currentStamina: number = 100;
  totalStamina: number = 100;
  currentMana: number = 100;
  totalMana: number = 100;

  constructor(data: Partial<Status>) {
    Object.assign(this, data);
  }

  getHealthPercentage(): number {
    return (this.currentHealth / this.totalHealth) * 100;
  }

  isDead(): boolean {
    return this.currentHealth <= 0;
  }
}
