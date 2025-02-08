export class Currencies {
  characterId: number = 0;
  currentXp: number = 0;
  totalXp: number = 0;
  currentGold: number = 0;
  totalGold: number = 0;

  constructor(data: Partial<Currencies>) {
    Object.assign(this, data);
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
