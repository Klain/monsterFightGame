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
    let equipMapped = equip.map(item => item.wsr());
    equipMapped.length = 16;
    return equipMapped;
  }
}
