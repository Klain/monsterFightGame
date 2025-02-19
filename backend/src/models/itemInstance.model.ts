import CacheDataService from "../services/CacheDataService";

export class ItemInstance {
  id: number = 0;
  character_id: number = 0;
  item_id: number = 0;
  equipped: boolean = false;
  stock: number = 0;

  constructor(data: Partial<ItemInstance>) {
    Object.assign(this, data);
  }

  wsr(){
    const databaseItem = CacheDataService.getItemDefinitionById(this.item_id);
    if(databaseItem){
      const result = {
        [this.id]: {
          ...databaseItem.wsr(),
          characterId: this.character_id,
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
