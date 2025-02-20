import CacheDataService from "./CacheDataService";
import { ItemDefinition } from "../models/itemDefinition.model";

class ShopService {
  /**
   * Obtiene los ítems disponibles en la tienda desde la caché.
   * @returns Lista de ítems.
   */
  static getShopItems(): ItemDefinition[] {
    return Array.from(CacheDataService.itemDefinitions.values());
  }
}

export default ShopService;
