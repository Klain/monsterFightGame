import { CharacterItem } from "./characterItem";

export class Inventory {
    items:CharacterItem[]=[]
  constructor(inventory:CharacterItem[]) {
    this.items = inventory;
  }
  wsr(): any {
    return {
      inventory: this.items.map(item => item.wsr()) 
    };
  }
}
