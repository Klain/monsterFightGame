import CacheDataService from "./cache/CacheDataService";
import { ItemDefinition } from "../models/itemDefinition.model";

class ShopService {
  /**
   * Obtiene los ítems disponibles en la tienda desde la caché.
   * @returns Lista de ítems.
   */
  static getShopItems(): ItemDefinition[] {
    return Array.from(CacheDataService.cacheItemDefinitions.values());
  }
}

export default ShopService;
