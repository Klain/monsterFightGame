import CacheDataService from "./cache/CacheDataService";
import { ItemDefinition } from "../models/itemDefinition.model";

class ShopService {
  static getShopItems(): ItemDefinition[] {
    return Array.from(CacheDataService.cacheItemDefinitions.values());
  }
}

export default ShopService;
