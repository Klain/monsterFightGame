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

  wsr(){
    const databaseItem = CacheDataService.getItemDefinitionById(this.itemId);
    if(databaseItem){
      const result = {
        [this.id]: {
          ...databaseItem.wsr(),
          characterId: this.characterId,
          equipped: this.equipped,
          stock: this.stock,
        }
      };
      return result
      
    }else{
      return {};
    }
  }
}
