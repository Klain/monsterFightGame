import DatabaseService from "./database/databaseService";
import { Character } from "../models/character.model";
import { ItemDefinition } from "../models/itemDefinition.model";
import { Inventory } from "../models/inventory.model";

class CacheDataService {
  static characters: Map<number, Character> = new Map();
  static inventories: Map<number, Inventory> = new Map();
  static itemDefinitions: Map<number, ItemDefinition> = new Map();
  static pendingUpdates: Set<number> = new Set(); // IDs de personajes con cambios pendientes

  // ✅ Inicializar caché cargando todos los datos desde `DatabaseService`
  static async initializeCache(): Promise<void> {
    try {
      console.log("🔄 Cargando caché...");

      // 📦 Cargar ítems en caché
      const items = await DatabaseService.getAllItemDefinitions();
      console.log(`📦 Se encontraron ${items.length} ítems en la base de datos.`);
      items.forEach(item => this.itemDefinitions.set(item.id, item));

      // 🏷️ Cargar personajes en caché
      const characters = await DatabaseService.getAllCharacters();
      console.log(`🏷️ Se encontraron ${characters.length} personajes.`);
      characters.forEach(character => this.characters.set(character.id, character));

      // 🔄 Cargar inventarios en caché
      for (const character of characters) {
        const inventoryItems = await DatabaseService.getInventoryByCharacterId(character.id);
        const inventory = new Inventory();
        inventory.items = inventoryItems;
        this.inventories.set(character.id, inventory);
      }

      // 🔄 Iniciar sincronización periódica con la base de datos
      setInterval(() => this.syncPendingUpdates(), 30000); // Cada 30 segundos

      console.log("✅ Caché cargada correctamente.");
    } catch (error) {
      console.error("❌ Error al inicializar la caché:", error);
      process.exit(1);
    }
  }

  // ✅ ITEM DEFINITIONS
  static getItemDefinition(itemId: number): ItemDefinition | null {
    return this.itemDefinitions.get(itemId) || null;
  }
  static getAllItemDefinitions(): ItemDefinition[] {
    return Array.from(this.itemDefinitions.values());
  }

  // ✅ CHARACTERS
  static getCharacter(characterId: number): Character | null {
    return this.characters.get(characterId) || null;
  }

  static updateCharacter(characterId: number, updatedCharacter: Character): void {
    this.characters.set(characterId, updatedCharacter);
    this.pendingUpdates.add(characterId); // Marcar como pendiente de sincronizar
  }

  static removeCharacter(characterId: number): void {
    this.characters.delete(characterId);
    this.pendingUpdates.add(characterId); // Asegurar eliminación en BD
  }

  // ✅ INVENTORY
  static getInventory(characterId: number): Inventory {
    return this.inventories.get(characterId) || new Inventory();
  }

  static updateInventory(characterId: number, updatedInventory: Inventory): void {
    this.inventories.set(characterId, updatedInventory);
    this.pendingUpdates.add(characterId); // Marcar como pendiente de sincronizar
  }

  // ✅ OBTENER PERSONAJE COMPLETO CON INVENTARIO
  static getFullCharacter(characterId: number): { character: Character; inventory: Inventory } {
    const character = this.getCharacter(characterId);
    if (!character) throw new Error("❌ Personaje no encontrado en caché");

    const inventory = this.getInventory(characterId);
    return { character, inventory };
  }

  // ✅ SINCRONIZACIÓN DIFERIDA CON BASE DE DATOS
  static async syncPendingUpdates(): Promise<void> {
    if (this.pendingUpdates.size === 0) return; // Nada que actualizar
  
    console.log(`🔄 Sincronizando ${this.pendingUpdates.size} cambios con la base de datos...`);
    for (const characterId of this.pendingUpdates) {
      const character = this.characters.get(characterId);
      const inventory = this.inventories.get(characterId);
  
      if (character) {
        await DatabaseService.updateCharacter(characterId, character);
      }
      if (inventory) {
        await DatabaseService.updateInventory(characterId, inventory.items);
      }
    }
  
    this.pendingUpdates.clear(); // Resetear lista de cambios pendientes
    console.log("✅ Sincronización completada.");
  }
  
}

export default CacheDataService;
