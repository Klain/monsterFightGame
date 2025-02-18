import { CharacterItem } from "./characterItem";

export class Inventory {
    items:CharacterItem[]=[]
  constructor(inventory:CharacterItem[]) {
    this.items = inventory;
  }
  wsr(): any {
    //continua aqui, el error esta en el mapeado del return de backpack
    const backpack =  this.items.filter(item=>item.equipped != true);
    const equip =  this.items.filter(item=>item.equipped == true);
    let equipMapped = equip.map(item => item.wsr());
    equipMapped.length = 16; 

    return {
      backpack: backpack.map(item => item.wsr()),
      equip: equipMapped
    };
  }
  wsrBackpack(){
    const backpack =  this.items.filter(item=>item.equipped != true);
    return { backpack: backpack.map(item => item.wsr()), };
  }

  wsrEquip(){
    const equip =  this.items.filter(item=>item.equipped == true);
    let equipMapped = equip.map(item => item.wsr());
    equipMapped.length = 16; 
    return { equip: equipMapped };
  }
}