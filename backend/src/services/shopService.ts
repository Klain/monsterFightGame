import DatabaseService from "./databaseService";
import { Item } from "../models/item.model";
import { CharacterItem } from "../models/characterItem";

class ShopService {
  /**
   * Obtiene los ítems disponibles en la tienda desde la caché.
   * @returns Lista de ítems.
   */
  static async getShopItems(): Promise<Item[]> {
    return Array.from(DatabaseService.itemCache.values());
  }

  /**
   * Permite a un personaje comprar un ítem en la tienda.
   * @param characterId ID del personaje.
   * @param itemId ID del ítem a comprar.
   */
  static async buyItem(characterId: number, itemId: number): Promise<void> {
    const item = DatabaseService.getItemFromCache(itemId);
    if (!item) throw new Error("Ítem no encontrado en caché");

    const character = DatabaseService.getCharacterFromCache(characterId);
    if (!character) throw new Error("Personaje no encontrado en caché");

    if (character.currentGold < item.price) throw new Error("Oro insuficiente");

    // 💰 Restar oro
    character.currentGold -= item.price;
    DatabaseService.updateCharacterInCache(characterId, character);

    await DatabaseService.run(
      `UPDATE characters SET current_gold = ? WHERE id = ?`,
      [character.currentGold, characterId]
    );

    // 📦 Agregar el ítem al inventario
    await DatabaseService.run(
      `INSERT INTO character_items (character_id, item_id, equipped) VALUES (?, ?, FALSE)`,
      [characterId, itemId]
    );

    // 🔄 Actualizar caché de inventario
    const inventory = DatabaseService.getInventoryFromCache(characterId);
    const newCharacterItem = new CharacterItem({
      characterId,
      itemId,
      equipped: false,
      stock: 1,
    });
    DatabaseService.updateInventoryInCache(characterId, [...inventory, newCharacterItem]);
  }
}

export default ShopService;
