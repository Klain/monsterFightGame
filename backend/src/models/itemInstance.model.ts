import CacheDataService from "../services/cache/CacheDataService";

export class ItemInstance {
  id: number = 0;
  characterId: number = 0;
  itemId: number = 0;
  equipped: boolean = false;
  stock: number = 0;

  constructor(data: Partial<ItemInstance>) {
    Object.assign(this, data);
  }

  wsr(): any {
    const databaseItem = CacheDataService.getItemDefinitionById(this.itemId);
    if (!databaseItem) return null;

    return {
      id: this.itemId,
      name: databaseItem.name,
      itemType: databaseItem.itemType,
      levelRequired: databaseItem.levelRequired,
      stock: this.stock,
      priceBuy: databaseItem.price,
      priceSell: Math.floor(databaseItem.price / 2),
      equipType: databaseItem.equipType,
      equipPositionType: databaseItem.equipPositionType,
      effects: databaseItem.effects || [],
      equipped: this.equipped,
    };
  }
}
