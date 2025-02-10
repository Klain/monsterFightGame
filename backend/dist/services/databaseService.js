"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../database");
const character_model_1 = require("../models/character.model");
const item_model_1 = require("../models/item.model");
class DatabaseService {
    // Inicializar todos los cachés
    static async initializeCache() {
        try {
            console.log("Cargando cachés...");
            const characters = await this.all("SELECT * FROM characters");
            characters.forEach((character) => {
                this.characterCache.set(character.id, new character_model_1.Character(character));
            });
            const inventory = await this.all(`
        SELECT ci.*, i.name, i.type, i.attack_bonus, i.defense_bonus, i.price, i.rarity, i.level_required
        FROM character_items ci
        JOIN items i ON ci.item_id = i.id
      `);
            inventory.forEach((row) => {
                const item = new item_model_1.Item(row); // Convierte cada ítem en una instancia del modelo Item
                if (!this.inventoryCache.has(row.character_id)) {
                    this.inventoryCache.set(row.character_id, []);
                }
                this.inventoryCache.get(row.character_id).push(item); // Añade el ítem al inventario del personaje
            });
            console.log("✅ Todos los cachés cargados correctamente.");
        }
        catch (error) {
            console.error("❌ Error al inicializar los cachés:", error);
            process.exit(1); // Si algo falla, detén el servidor
        }
    }
    // Obtener el inventario de un personaje desde el caché
    static getInventoryFromCache(characterId) {
        return this.inventoryCache.get(characterId) || [];
    }
    // Actualizar el inventario de un personaje en el caché
    static updateInventoryInCache(characterId, updatedInventory) {
        this.inventoryCache.set(characterId, updatedInventory.map((item) => new item_model_1.Item(item)) // Asegúrate de convertir a instancias de Item
        );
    }
    // Obtener un personaje completo con inventario y relaciones
    static getCharacterWithRelations(characterId) {
        const character = this.getCharacterFromCache(characterId);
        if (!character)
            throw new Error("Personaje no encontrado en el caché");
        const inventory = this.getInventoryFromCache(characterId);
        return { character, inventory };
    }
    // Obtener un personaje desde el caché
    static getCharacterFromCache(characterId) {
        return this.characterCache.get(characterId) || null;
    }
    static updateCharacterInCache(id, updatedCharacter) {
        this.characterCache.set(id, updatedCharacter);
    }
    static removeCharacterFromCache(id) {
        this.characterCache.delete(id);
    }
    // Métodos genéricos para consultas SQL
    static async get(query, params = []) {
        return new Promise((resolve, reject) => {
            database_1.db.get(query, params, (err, row) => {
                if (err) {
                    console.error("Database GET Error:", err);
                    return reject(err);
                }
                resolve(row || null);
            });
        });
    }
    static async all(query, params = []) {
        return new Promise((resolve, reject) => {
            database_1.db.all(query, params, (err, rows) => {
                if (err) {
                    console.error("Database ALL Error:", err);
                    return reject(err);
                }
                resolve(rows || []);
            });
        });
    }
    static async run(query, params = []) {
        return new Promise((resolve, reject) => {
            database_1.db.run(query, params, function (err) {
                if (err) {
                    console.error("Database RUN Error:", err);
                    return reject(err);
                }
                resolve({ lastID: this.lastID, changes: this.changes });
            });
        });
    }
}
DatabaseService.characterCache = new Map(); // Caché para personajes
DatabaseService.inventoryCache = new Map(); // Caché para inventario (characterId -> array de ítems)
exports.default = DatabaseService;
