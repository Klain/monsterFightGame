import DatabaseService from "./databaseService";
import { Item } from "../models/item.model";
import { CharacterItem } from "../models/characterItem";
import { Character } from "../models/character.model";
import webSocketService from "./webSocketService";
import { Inventory } from "../models/inventory.model";

class ShopService {
  /**
   * Obtiene los ítems disponibles en la tienda desde la caché.
   * @returns Lista de ítems.
   */
  static getShopItems(): Item[] {
    return Array.from(DatabaseService.itemCache.values());
  }

  /**
   * Permite a un personaje comprar un ítem en la tienda.
   * @param character personaje.
   * @param item ítem a comprar.
   */
   static async buyItem(character: Character, item: Item): Promise<void> {
    // 📦 Verificar si el personaje ya tiene el ítem
    const inventory = new Inventory(DatabaseService.getInventoryFromCache(character.id));
    const existingItem = inventory.items.find(i => i.itemId === item.id);

    if (existingItem) {
      existingItem.stock += 1;
      await DatabaseService.run(
        `UPDATE character_items SET stock = ? WHERE character_id = ? AND item_id = ?`,
        [existingItem.stock, character.id, item.id]
      );
      
    } else {
      const newCharacterItem = new CharacterItem({
        characterId: character.id,
        itemId: item.id,
        equipped: false,
        stock: 1,
      });
      await DatabaseService.run(
        `INSERT INTO character_items (character_id, item_id, equipped, stock) VALUES (?, ?, FALSE, ?)`,
        [character.id, item.id, 1]
      );
      inventory.items.push(newCharacterItem);
      webSocketService.characterRefresh(character.userId,{...character.wsrCurrencies(),...inventory.wsrBackpack()});

    }

    character.currentGold -= item.price;
    DatabaseService.updateCharacterInCache(character.id, character);
    await DatabaseService.run(
      `UPDATE characters SET current_gold = ? WHERE id = ?`,
      [character.currentGold, character.id]
    );
    DatabaseService.updateInventoryInCache(character.id, inventory.items);
  }
}

export default ShopService;
