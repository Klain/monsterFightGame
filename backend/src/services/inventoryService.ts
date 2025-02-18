import CacheDataService from "./CacheDataService";
import { ItemInstance } from "../models/itemInstance.model";

class InventoryService {
  /**
   * Obtiene el inventario de un personaje desde la caché.
   * @param characterId ID del personaje.
   * @returns Lista de objetos en su inventario.
   */
  static getInventory(characterId: number): ItemInstance[] {
    return CacheDataService.getInventory(characterId).items;
  }

  /**
   * Equipa un ítem en el inventario del personaje.
   * @param characterId ID del personaje.
   * @param itemId ID del ítem a equipar.
   */
  static async equipItem(characterId: number, itemId: number): Promise<void> {
    const inventory = CacheDataService.getInventory(characterId);

    // 🔄 Actualizar caché
    inventory.items = inventory.items.map((ci) =>
      ci.item_id === itemId ? new ItemInstance({ ...ci, equipped: true }) : ci
    );
    CacheDataService.updateInventory(characterId, inventory);

    // 🔄 Marcar para sincronización en base de datos
    CacheDataService.pendingUpdates.add(characterId);
  }

  /**
   * Desequipa un ítem en el inventario del personaje.
   * @param characterId ID del personaje.
   * @param itemId ID del ítem a desequipar.
   */
  static async unequipItem(characterId: number, itemId: number): Promise<void> {
    const inventory = CacheDataService.getInventory(characterId);

    // 🔄 Actualizar caché
    inventory.items = inventory.items.map((ci) =>
      ci.item_id === itemId ? new ItemInstance({ ...ci, equipped: false }) : ci
    );
    CacheDataService.updateInventory(characterId, inventory);

    // 🔄 Marcar para sincronización en base de datos
    CacheDataService.pendingUpdates.add(characterId);
  }

  /**
   * Vende un ítem, eliminándolo del inventario del personaje y sumando el oro.
   * @param characterId ID del personaje.
   * @param itemId ID del ítem a vender.
   */
  static async sellItem(characterId: number, itemId: number): Promise<void> {
    const item = CacheDataService.getItemDefinition(itemId);
    if (!item) throw new Error("Ítem no encontrado en caché");

    // 🔄 Actualizar caché eliminando el ítem del inventario
    const inventory = CacheDataService.getInventory(characterId);
    inventory.items = inventory.items.filter((ci) => ci.item_id !== itemId);
    CacheDataService.updateInventory(characterId, inventory);

    // 🔄 Marcar para sincronización en base de datos
    CacheDataService.pendingUpdates.add(characterId);

    // 🔄 Actualizar oro en caché
    const character = CacheDataService.getCharacter(characterId);
    if (character) {
      character.currentGold += item.price;
      CacheDataService.updateCharacter(characterId, character);
    }
  }
}

export default InventoryService;
