import CacheDataService from "./CacheDataService";
import { ItemDefinition } from "../models/itemDefinition.model";

class ItemDatabaseService {
  
  /**
   * Obtener un ítem por ID.
   * @param id - ID del ítem.
   * @returns El ítem encontrado.
   */
  static async getItemById(id: number): Promise<ItemDefinition | null> {
    try {
      return CacheDataService.getItemDefinition(id);

    } catch (error) {
      console.error("❌ Error al obtener ítem:", error);
      throw new Error("Error al obtener ítem.");
    }
  }
  
  /**
   * Obtener todos los ítems.
   * @returns Una lista de ítems.
   */
   static async getAllItems(): Promise<ItemDefinition[]> {
    try {
      return CacheDataService.getAllItemDefinitions();

    } catch (error) {
      console.error("❌ Error al obtener ítems:", error);
      throw new Error("Error al obtener ítems.");
    }
  }
}

export default ItemDatabaseService;
