import { db } from "../database"; 
import { Character } from "../models/character.model";
import { Item } from "../models/item.model";

class DatabaseService {
  static characterCache: Map<number, Character> = new Map(); // Caché para personajes
  static inventoryCache: Map<number, Item[]> = new Map(); // Caché para inventario (characterId -> array de ítems)

  // Inicializar todos los cachés
  static async initializeCache(): Promise<void> {
    try {
      console.log("Cargando cachés...");

      const characters = await this.all<Character>("SELECT * FROM characters");
      characters.forEach((character) => {
        this.characterCache.set(character.id, new Character(character));
      });

      const inventory = await this.all<Item & { character_id: number }>(`
        SELECT ci.*, i.name, i.type, i.attack_bonus, i.defense_bonus, i.price, i.rarity, i.level_required
        FROM character_items ci
        JOIN items i ON ci.item_id = i.id
      `);
      inventory.forEach((row) => {
        const item = new Item(row); // Convierte cada ítem en una instancia del modelo Item
        if (!this.inventoryCache.has(row.character_id)) {
          this.inventoryCache.set(row.character_id, []);
        }
        this.inventoryCache.get(row.character_id)!.push(item); // Añade el ítem al inventario del personaje
      });

      console.log("✅ Todos los cachés cargados correctamente.");
    } catch (error) {
      console.error("❌ Error al inicializar los cachés:", error);
      process.exit(1); // Si algo falla, detén el servidor
    }
  }

  // Obtener el inventario de un personaje desde el caché
  static getInventoryFromCache(characterId: number): Item[] {
    return this.inventoryCache.get(characterId) || [];
  }

  // Actualizar el inventario de un personaje en el caché
  static updateInventoryInCache(characterId: number, updatedInventory: Item[]): void {
    this.inventoryCache.set(
      characterId,
      updatedInventory.map((item) => new Item(item)) // Asegúrate de convertir a instancias de Item
    );
  }

  // Obtener un personaje completo con inventario y relaciones
  static getCharacterWithRelations(characterId: number): {
    character: Character;
    inventory: Item[];
  } {
    const character = this.getCharacterFromCache(characterId);
    if (!character) throw new Error("Personaje no encontrado en el caché");
    const inventory = this.getInventoryFromCache(characterId);

    return { character, inventory };
  }

  // Obtener un personaje desde el caché
  static getCharacterFromCache(characterId: number): Character | null {
    return this.characterCache.get(characterId) || null;
  }
  static updateCharacterInCache(id: number, updatedCharacter: Character) {
    this.characterCache.set(id, updatedCharacter);
  }
  static removeCharacterFromCache(id: number) {
    this.characterCache.delete(id);
  }
  // Métodos genéricos para consultas SQL
  static async get<T>(query: string, params: unknown[] = []): Promise<T | null> {
    return new Promise((resolve, reject) => {
      db.get(query, params, (err, row) => {
        if (err) {
          console.error("Database GET Error:", err);
          return reject(err);
        }
        resolve((row as T) || null);
      });
    });
  }

  static async all<T>(query: string, params: unknown[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) {
          console.error("Database ALL Error:", err);
          return reject(err);
        }
        resolve((rows as T[]) || []);
      });
    });
  }

  static async run(query: string, params: unknown[] = []): Promise<{ lastID: number; changes: number }> {
    return new Promise((resolve, reject) => {
      db.run(query, params, function (err) {
        if (err) {
          console.error("Database RUN Error:", err);
          return reject(err);
        }
        resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }
}

export default DatabaseService;
