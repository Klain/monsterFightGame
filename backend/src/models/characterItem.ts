export class CharacterItem {
  id: number = 0;
  characterId: number = 0;
  itemId: number = 0;
  equipped: boolean = false;
  stock: number = 0;

  constructor(data: Partial<CharacterItem>) {
    Object.assign(this, data);
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
