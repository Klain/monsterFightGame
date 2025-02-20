import { ItemInstance } from "./itemInstance.model";

export class Inventory {
  
  items:ItemInstance[]=[];
  
  constructor(inventory? : ItemInstance[]) {
    if(inventory){
      this.items = inventory;
    }
  }
  wsr(): any {
    //continua aqui, el error esta en el mapeado del return de backpack
    const backpack =  this.items.filter(item=>item.equipped != true).map(item => item.wsr());
    const equip =  this. items.filter(item=>item.equipped == true);
    let equipMapped = equip.map(item => item.wsr());
    equipMapped.length = 16; 

    return {inventory:{
      backpack: backpack,
      equip: equipMapped
    }};
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