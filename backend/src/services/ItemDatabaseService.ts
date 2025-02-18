import DatabaseService from "./databaseService";
import { Item } from "../models/item.model";

class ItemDatabaseService {
  
  /**
   * Obtener un ítem por ID.
   * @param id - ID del ítem.
   * @returns El ítem encontrado.
   */
  static async getItemById(id: number): Promise<Item | null> {
    try {
      return DatabaseService.getItemFromCache(id);

    } catch (error) {
      console.error("❌ Error al obtener ítem:", error);
      throw new Error("Error al obtener ítem.");
    }
  }
  
  /**
   * Obtener todos los ítems.
   * @returns Una lista de ítems.
   */
   static async getAllItems(): Promise<Item[]> {
    try {
      return DatabaseService.getAllItemsFromCache();

    } catch (error) {
      console.error("❌ Error al obtener ítems:", error);
      throw new Error("Error al obtener ítems.");
    }
  }
}

export default ItemDatabaseService;
