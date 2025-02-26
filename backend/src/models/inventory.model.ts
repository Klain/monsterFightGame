import CacheDataService from "../services/cache/CacheDataService";
import { ItemInstance } from "./itemInstance.model";

export class Inventory {
  items: ItemInstance[] = [];

  constructor(inventory?: ItemInstance[]) {
    if (inventory) {
      this.items = inventory;
    }
  }

  wsr(): any {
    return {
      backpack: this.wsrBackpack(),
      equip: this.wsrEquip(),
    };
  }

  wsrBackpack() {
    const backpack = this.items.filter(item => !item.equipped);
    const inventoryMap = new Map<number, ItemInstance[]>();

    backpack.forEach(item => {
      const itemData = item.wsr();
      const itemId = itemData.id;

      if (!inventoryMap.has(itemId)) {
        inventoryMap.set(itemId, []);
      }
      inventoryMap.get(itemId)?.push(itemData);
    });

    return Object.fromEntries(inventoryMap);
  }

  wsrEquip() {
    const equip = this.items.filter(item => item.equipped);
    const equipMapped = new Array(16).fill(null); 

    equip.forEach(item => {
      const itemDefinition =  CacheDataService.getItemDefinitionById(item.itemId);
      if(!itemDefinition ||!itemDefinition.equipPositionType){throw new Error ("wsrEquip : Error al construir la respuesta de equipo para el front")}
        let itemPosition = itemDefinition.equipPositionType-1;
        if ([10, 12, 14].includes(itemPosition) && equipMapped[itemPosition] !== null) {
          itemPosition += 1; 
        }
        if (itemPosition >= 0 && itemPosition < 16) {
            equipMapped[itemPosition] = item.wsr();
        }
    });

    return equipMapped;
}

}
