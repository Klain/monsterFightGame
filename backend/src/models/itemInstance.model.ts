import CacheDataService from "../services/cache/CacheDataService";

export class ItemInstance {
  readonly id: number = 0;
  readonly characterId: number = 0;
  readonly itemId: number = 0;
  equipped: boolean = false;
  stock: number = 0;

  constructor(data: Partial<ItemInstance>) {
    Object.assign(this, data);
  }

  wsr(): any {
    const databaseItem = CacheDataService.getItemDefinitionById(this.itemId);
    if (!databaseItem) return null;

    return {
      id: this.id,
      itemId:this.itemId,
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
      imageUrl:databaseItem.imageUrl,
    };
  }
}
