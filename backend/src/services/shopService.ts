import CacheDataService from "./CacheDataService";
import { ItemDefinition } from "../models/itemDefinition.model";
import { ItemInstance } from "../models/itemInstance.model";
import { Character } from "../models/character.model";
import webSocketService from "./webSocketService";
import { Inventory } from "../models/inventory.model";

class ShopService {
  /**
   * Obtiene los ítems disponibles en la tienda desde la caché.
   * @returns Lista de ítems.
   */
  static getShopItems(): ItemDefinition[] {
    return Array.from(CacheDataService.itemDefinition.values());
  }

  /**
   * Permite a un personaje comprar un ítem en la tienda.
   * @param character personaje.
   * @param item ítem a comprar.
   */
   static async buyItem(character: Character, item: ItemDefinition): Promise<void> {
    // 📦 Verificar si el personaje ya tiene el ítem
    const inventory = new Inventory(CacheDataService.getInventory(character.id));
    const existingItem = inventory.items.find(i => i.item_id === item.id);

    if (existingItem) {
      existingItem.stock += 1;
      await CacheDataService.run(
        `UPDATE character_items SET stock = ? WHERE character_id = ? AND item_id = ?`,
        [existingItem.stock, character.id, item.id]
      );
      
    } else {
      const newCharacterItem = new ItemInstance({
        character_id: character.id,
        item_id: item.id,
        equipped: false,
        stock: 1,
      });
      await CacheDataService.run(
        `INSERT INTO character_items (character_id, item_id, equipped, stock) VALUES (?, ?, FALSE, ?)`,
        [character.id, item.id, 1]
      );
      inventory.items.push(newCharacterItem);
      webSocketService.characterRefresh(character.userId,{...character.wsrCurrencies(),...inventory.wsrBackpack()});

    }

    character.currentGold -= item.price;
    CacheDataService.updateCharacter(character.id, character);
    await CacheDataService.run(
      `UPDATE characters SET current_gold = ? WHERE id = ?`,
      [character.currentGold, character.id]
    );
    CacheDataService.updateInventory(character.id, inventory.items);
  }
}

export default ShopService;
