import { db } from "../database";
import { Character } from "../models/character.model";
import { CharacterItem } from "../models/characterItem";
import { Item } from "../models/item.model";

class DatabaseService {
  static characterCache: Map<number, Character> = new Map();
  static inventoryCache: Map<number, CharacterItem[]> = new Map();
  static itemCache: Map<number, Item> = new Map();

  // 🔥 Inicializar cachés
  static async initializeCache(): Promise<void> {
    try {
      console.log("🔄 Cargando cachés...");

      // 🏷️ Cargar personajes en caché
      const characters = await this.all<Character>("SELECT * FROM characters");
      characters.forEach((character) => {
        this.characterCache.set(character.id, new Character(character));
      });

      // 📦 Cargar todos los ítems en caché
      const items = await this.all<{
        id: number;
        name: string;
        itemType: number;
        equipType?: number | null;
        equipPositionType?: number | null;
        levelRequired: number;
        price: number;
        effects: string | null;
      }>(`
        SELECT 
          i.id,
          i.name,
          i.itemType,
          i.equipType,
          i.equipPositionType,
          i.levelRequired,
          i.price,
          COALESCE(GROUP_CONCAT(e.name || ':' || ie.value, ','), '') AS effects
        FROM items i
        LEFT JOIN items_effects ie ON i.id = ie.item_id
        LEFT JOIN effects e ON ie.effect_id = e.id
        GROUP BY i.id, i.name, i.itemType, i.equipType, i.equipPositionType, i.levelRequired, i.price;
      `);
      
      console.log(`📦 Se encontraron ${items.length} ítems en la base de datos.`);

      items.forEach((row) => {
        const effects = row.effects
          ? row.effects.split(",").map((effect: string) => {
              const [effect_name, value] = effect.split(":");
              return { effect_name, value: parseInt(value, 10) };
            })
          : [];

        const item = Item.parseDB(row, effects);
        this.itemCache.set(item.id, item);
      });

      // 🔄 Cargar inventarios en caché
      const inventory = await this.all<{
        id: number;
        character_id: number;
        item_id: number;
        equipped: boolean;
        stock: number;
      }>(`
        SELECT ci.*, COUNT(ci.item_id) AS stock
        FROM character_items ci
        GROUP BY ci.character_id, ci.item_id
      `);

      inventory.forEach((row) => {
        const characterItem = CharacterItem.parseDB(row);
        if (!this.inventoryCache.has(row.character_id)) {
          this.inventoryCache.set(row.character_id, []);
        }
        this.inventoryCache.get(row.character_id)!.push(characterItem);
      });

      console.log("✅ Cachés cargados correctamente.");
    } catch (error) {
      console.error("❌ Error al inicializar cachés:", error);
      process.exit(1);
    }
  }

  // 🔥 Obtener un ítem desde el caché
  static getItemFromCache(itemId: number): Item | null {
    return this.itemCache.get(itemId) || null;
  }

  // 📦 Obtener el inventario de un personaje desde el caché
  static getInventoryFromCache(characterId: number): CharacterItem[] {
    const inventory = this.inventoryCache.get(characterId);
    return inventory ? Array.from(inventory) : []; // Asegurar que siempre se devuelva un array
  }
  

  // 🔄 Actualizar el inventario de un personaje en caché
  static updateInventoryInCache(characterId: number, updatedInventory: CharacterItem[]): void {
    this.inventoryCache.set(characterId, updatedInventory);
  }

  // 📦 Obtener un personaje con su inventario
  static getCharacterWithRelations(characterId: number): {
    character: Character;
    inventory: CharacterItem[];
  } {
    const character = this.getCharacterFromCache(characterId);
    if (!character) throw new Error("Personaje no encontrado en caché");

    const inventory = this.getInventoryFromCache(characterId);
    return { character, inventory };
  }

  // 📦 Obtener un personaje desde el caché
  static getCharacterFromCache(characterId: number): Character | null {
    return this.characterCache.get(characterId) || null;
  }

  // 🔄 Actualizar personaje en caché
  static updateCharacterInCache(id: number, updatedCharacter: Character) {
    this.characterCache.set(id, updatedCharacter);
  }

  // ❌ Eliminar personaje del caché
  static removeCharacterFromCache(id: number) {
    this.characterCache.delete(id);
  }

  // 📌 Métodos SQL Genéricos
  static async get<T>(query: string, params: unknown[] = []): Promise<T | null> {
    return new Promise((resolve, reject) => {
      db.get(query, params, (err, row) => {
        if (err) return reject(err);
        resolve((row as T) || null);
      });
    });
  }

  static async all<T>(query: string, params: unknown[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) return reject(err);
        resolve((rows as T[]) || []);
      });
    });
  }

  static async run(query: string, params: unknown[] = []): Promise<{ lastID: number; changes: number }> {
    return new Promise((resolve, reject) => {
      db.run(query, params, function (err) {
        if (err) return reject(err);
        resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }
}

export default DatabaseService;