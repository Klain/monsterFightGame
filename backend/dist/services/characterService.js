"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const databaseService_1 = __importDefault(require("./databaseService"));
const character_model_1 = require("../models/character.model");
class CharacterService {
    // Crear un personaje para un usuario
    static async createCharacterForUser(userId, username) {
        try {
            const defaultFaction = "Neutral";
            const defaultClass = 1;
            // Crea una instancia inicial del personaje con valores predeterminados
            const newCharacter = new character_model_1.Character({
                userId,
                name: username,
                faction: defaultFaction,
                class: defaultClass,
            });
            // Inserta el personaje en la base de datos usando sus propiedades
            const result = await databaseService_1.default.run(`INSERT INTO characters (
          user_id, name, faction, class, level, strength, endurance, constitution, precision, agility, vigor, spirit, willpower, arcane, 
          current_health, total_health, current_stamina, total_stamina, current_mana, total_mana, 
          current_xp, total_xp, current_gold, total_gold, upgrade_points, last_fight
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                newCharacter.userId,
                newCharacter.name,
                newCharacter.faction,
                newCharacter.class,
                newCharacter.level,
                newCharacter.strength,
                newCharacter.endurance,
                newCharacter.constitution,
                newCharacter.precision,
                newCharacter.agility,
                newCharacter.vigor,
                newCharacter.spirit,
                newCharacter.willpower,
                newCharacter.arcane,
                newCharacter.currentHealth,
                newCharacter.totalHealth,
                newCharacter.currentStamina,
                newCharacter.totalStamina,
                newCharacter.currentMana,
                newCharacter.totalMana,
                newCharacter.currentXp,
                newCharacter.totalXp,
                newCharacter.currentGold,
                newCharacter.totalGold,
                newCharacter.upgradePoints,
                newCharacter.lastFight || null, // Manejo del valor opcional
            ]);
            // Añade el `id` del personaje recién creado
            newCharacter.id = result.lastID;
            // Actualizar el caché (si lo usas)
            databaseService_1.default.updateCharacterInCache(newCharacter.id, newCharacter);
            console.log(`✅ Personaje creado para el usuario ${userId}`);
            return newCharacter;
        }
        catch (error) {
            console.error("❌ Error al crear personaje:", error);
            throw new Error("Error al crear personaje.");
        }
    }
    // Obtener un personaje por su ID de usuario
    static async getCharacterById(userId) {
        const character = databaseService_1.default.getCharacterFromCache(userId);
        return character;
    }
    // Mejorar un atributo del personaje
    // Restringimos el tipo del atributo dinámico
    static async upgradeCharacterAttribute(character, attribute, cost) {
        try {
            const currentValue = character[attribute];
            const updatedValue = currentValue + 1;
            const updatedXp = character.currentXp - cost;
            // Sincronizar con la base de datos
            await databaseService_1.default.run(`UPDATE characters SET ${attribute} = ?, currentXp = ? WHERE id = ?`, [updatedValue, updatedXp, character.id]);
            // Actualizar el objeto en caché
            character[attribute] = updatedValue;
            character.currentXp = updatedXp;
            databaseService_1.default.updateCharacterInCache(character.id, character);
            return character;
        }
        catch (error) {
            console.error("❌ Error en upgradeCharacterAttribute:", error);
            throw new Error("No se pudo actualizar el personaje. Inténtalo nuevamente.");
        }
    }
    static async updateCharacterRewards(character, rewards) {
        try {
            character.currentXp += rewards.xp ?? 0;
            character.currentGold += rewards.gold ?? 0;
            character.currentHealth = Math.min(character.totalHealth, character.currentHealth + (rewards.health ?? 0));
            character.currentStamina = Math.min(character.totalStamina, character.currentStamina + (rewards.stamina ?? 0));
            character.currentMana = Math.min(character.totalMana, character.currentMana + (rewards.mana ?? 0));
            await databaseService_1.default.run(`UPDATE characters SET currentXp = ?, currentGold = ?, currentHealth = ?, currentStamina = ?, currentMana = ? WHERE id = ?`, [character.currentXp, character.currentGold, character.currentHealth, character.currentStamina, character.currentMana, character.id]);
            databaseService_1.default.updateCharacterInCache(character.id, character);
        }
        catch (error) {
            console.error("Error al actualizar las recompensas del personaje:", error);
            throw new Error("No se pudo actualizar las recompensas del personaje.");
        }
    }
    static async getEquippedStats(id) {
        return databaseService_1.default.getCharacterFromCache(id);
    }
}
exports.default = CharacterService;
