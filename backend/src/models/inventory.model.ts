import CacheDataService from "../services/cache/CacheDataService";
import { ItemInstance } from "./itemInstance.model";

export class Inventory {
  items: number[] = [];//Guardamos solo los idItemInstance y los obtenemos de cacheItemInstance

  constructor(inventory?: number[]) {
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
    const backpack = this.items.filter(itemId => CacheDataService.cacheItemInstances.get(itemId)?.equipped === false);
    const inventoryMap = new Map<number, any>();

    backpack.forEach(itemId => {
      const itemData : ItemInstance =  CacheDataService.cacheItemInstances.get(itemId)?.wsr();
      if(!itemData){return;}
      inventoryMap.set(itemData.id , itemData);
    });
    return Object.fromEntries(inventoryMap);
  }

  wsrEquip() {
    const equip = this.items.filter(itemId => CacheDataService.cacheItemInstances.get(itemId)?.equipped === true);
    const equipMapped = new Array(16).fill(null); 

    equip.forEach(itemId => {
      const itemInstance = CacheDataService.cacheItemInstances.get(itemId);
      if(!itemInstance){throw new Error ("wsrEquip : Error al construir la respuesta de equipo para el front")}
      const itemDefinition =  CacheDataService.getItemDefinitionById(itemInstance.itemId);
      if(!itemDefinition || !itemInstance){return;}
      if(!itemDefinition ||!itemDefinition.equipPositionType){throw new Error ("wsrEquip : Error al construir la respuesta de equipo para el front")}
    
        let itemPosition = itemDefinition.equipPositionType-1;
        if ([10, 12, 14].includes(itemPosition) && equipMapped[itemPosition] !== null) {
          itemPosition += 1; 
        }
        if (itemPosition >= 0 && itemPosition < 16) {
            equipMapped[itemPosition] = itemInstance.wsr();
        }
    });

    return equipMapped;
  }

}
