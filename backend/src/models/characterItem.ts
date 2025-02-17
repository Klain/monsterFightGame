import DatabaseService from "../services/databaseService";

export class CharacterItem {
  id: number = 0;
  characterId: number = 0;
  itemId: number = 0;
  equipped: boolean = false;
  stock: number = 0;

  constructor(data: Partial<CharacterItem>) {
    Object.assign(this, data);
  }

  wsr(){
    const databaseItem = DatabaseService.getItemFromCache(this.itemId);
    if(databaseItem){
      return {
        [this.id]: {
          ...databaseItem.wsr(),
          characterId: this.characterId,
          equipped: this.equipped,
          stock: this.stock
        }
      };
      
    }else{
      return {};
    }
  }
  

  /**
   * Convierte datos de la BD en una instancia de `CharacterItem`
   * @param data - Fila obtenida de `character_items`
   * @returns `CharacterItem`
   */
  static parseDB(data: {
    id: number;
    character_id: number;
    item_id: number;
    equipped: boolean;
    stock: number;
  }): CharacterItem {
    return new CharacterItem({
      id: data.id,
      characterId: data.character_id,
      itemId: data.item_id,
      equipped: data.equipped,
      stock: data.stock,
    });
  }
}
