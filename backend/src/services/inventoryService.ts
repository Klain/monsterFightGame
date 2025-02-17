import DatabaseService from "./databaseService";
import { CharacterItem } from "../models/characterItem";

class InventoryService {
  /**
   * Obtiene el inventario de un personaje desde la caché.
   * @param characterId ID del personaje.
   * @returns Lista de objetos en su inventario.
   */
  static getInventory(characterId: number): CharacterItem[] {
    return DatabaseService.getInventoryFromCache(characterId);
  }

  /**
   * Equipa un ítem en el inventario del personaje.
   * @param characterId ID del personaje.
   * @param itemId ID del ítem a equipar.
   */
  static async equipItem(characterId: number, itemId: number): Promise<void> {
    await DatabaseService.run(
      `UPDATE character_items SET equipped = TRUE WHERE character_id = ? AND item_id = ?`,
      [characterId, itemId]
    );

    // 🔄 Actualizar caché
    const inventory = DatabaseService.getInventoryFromCache(characterId);
    const updatedInventory = inventory.map((ci) =>
      ci.itemId === itemId ? new CharacterItem({ ...ci, equipped: true }) : ci
    );
    DatabaseService.updateInventoryInCache(characterId, updatedInventory);
  }

  /**
   * Desequipa un ítem en el inventario del personaje.
   * @param characterId ID del personaje.
   * @param itemId ID del ítem a desequipar.
   */
  static async unequipItem(characterId: number, itemId: number): Promise<void> {
    await DatabaseService.run(
      `UPDATE character_items SET equipped = FALSE WHERE character_id = ? AND item_id = ?`,
      [characterId, itemId]
    );

    // 🔄 Actualizar caché
    const inventory = DatabaseService.getInventoryFromCache(characterId);
    const updatedInventory = inventory.map((ci) =>
      ci.itemId === itemId ? new CharacterItem({ ...ci, equipped: false }) : ci
    );
    DatabaseService.updateInventoryInCache(characterId, updatedInventory);
  }

  /**
   * Vende un ítem, eliminándolo del inventario del personaje.
   * @param characterId ID del personaje.
   * @param itemId ID del ítem a vender.
   */
  static async sellItem(characterId: number, itemId: number): Promise<void> {
    const item = DatabaseService.getItemFromCache(itemId);
    if (!item) throw new Error("Ítem no encontrado en caché");

    await DatabaseService.run(
      `DELETE FROM character_items WHERE character_id = ? AND item_id = ?`,
      [characterId, itemId]
    );
    await DatabaseService.run(
      `UPDATE characters SET current_gold = current_gold + ? WHERE id = ?`,
      [item.price, characterId]
    );

    // 🔄 Actualizar caché
    const inventory = DatabaseService.getInventoryFromCache(characterId).filter(
      (ci) => ci.itemId !== itemId
    );
    DatabaseService.updateInventoryInCache(characterId, inventory);
  }
}

export default InventoryService;
