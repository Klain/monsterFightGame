import { Character } from "./character.model";

export class Item {
  id: number = 0;
  name: string = "";
  type: "weapon" | "armor" | "accessory" = "weapon";
  attackBonus: number = 0;
  defenseBonus: number = 0;
  price: number = 0;
  rarity: "common" | "rare" | "legendary" = "common";
  levelRequired: number = 1;

  constructor(data: Partial<Item>) {
    Object.assign(this, data);
  }

  // Método para verificar si un personaje cumple el nivel requerido
  canBeEquippedBy(character: Character): boolean {
    return character.level >= this.levelRequired;
  }
}
