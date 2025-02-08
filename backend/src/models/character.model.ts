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

  upgradePoints: number = 0;
  lastFight?: Date;

  constructor(data: Partial<Character>) {
    Object.assign(this, data);
  }

  calculateUpgradeCost(attributeValue: number): number {
    return 100 + attributeValue * 10;
  }

  isValidAttribute(attribute: string): boolean {
    const validAttributes = [
      "strength",
      "endurance",
      "constitution",
      "precision",
      "agility",
      "vigor",
      "spirit",
      "willpower",
      "arcane",
    ];
    return validAttributes.includes(attribute);
  }
}
