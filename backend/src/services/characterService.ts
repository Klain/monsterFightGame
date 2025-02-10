import DatabaseService from "./databaseService";
import { Character } from "../models/character.model";

class CharacterService {
  // Crear un personaje para un usuario
  static async createCharacterForUser(userId: number, username: string): Promise<Character> {
    try {
      const defaultFaction = "Neutral";
      const defaultClass = 1;

      const result = await DatabaseService.run(
        `INSERT INTO characters (user_id, name, faction, class, level, strength, endurance, constitution, precision, agility, vigor, spirit, willpower, arcane, upgrade_points) 
         VALUES (?, ?, ?, ?, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0)`,
        [userId, username, defaultFaction, defaultClass]
      );

      const character = new Character({
        id: result.lastID, // lastID proviene del resultado de DatabaseService.run
        userId,
        name: username,
        faction: defaultFaction,
        class: defaultClass,
        level: 1,
        strength: 1,
        endurance: 1,
        constitution: 1,
        precision: 1,
        agility: 1,
        vigor: 1,
        spirit: 1,
        willpower: 1,
        arcane: 1,
        upgradePoints: 0,
      });

      // Actualizar el caché
      DatabaseService.updateCharacterInCache(character.id, character);

      console.log(`✅ Personaje creado para el usuario ${userId}`);
      return character;
    } catch (error) {
      console.error("❌ Error al crear personaje:", error);
      throw new Error("Error al crear personaje.");
    }
  }

  // Obtener un personaje por su ID de usuario
  static async getCharacterById(userId: number): Promise<Character|null> {
    const character = DatabaseService.getCharacterFromCache(userId);
    return character;
  }

  // Mejorar un atributo del personaje
  // Restringimos el tipo del atributo dinámico
  
  
  static async upgradeCharacterAttribute< K extends keyof Character >(userId: number,  
    attribute: "strength" | "endurance" | "constitution" | "precision" | "agility" | "vigor" | "spirit" | "willpower" | "arcane"): Promise<Character> {
    try {
      const character = await this.getCharacterById(userId);

      // Validar si el atributo es un atributo válido y de tipo `number`
      if (!character.isValidAttribute(attribute)) {
        throw new Error(`El atributo '${attribute}' no es válido.`);
      }

      const currentValue = character[attribute];
      if (typeof currentValue !== "number") {
        throw new Error(`El atributo '${attribute}' no es un número válido.`);
      }

      const cost = character.calculateUpgradeCost(currentValue);

      // Obtener monedas del caché
      const currencies = DatabaseService.getCurrenciesFromCache(character.id);
      if (!currencies || currencies.currentXp < cost) {
        throw new Error("No tienes suficiente experiencia para mejorar este atributo.");
      }

      // Actualizar valores
      character[attribute] = currentValue + 1; // Aseguramos que solo atributos numéricos son modificados
      currencies.currentXp -= cost;

      // Sincronizar con la base de datos
      await DatabaseService.run(
        `UPDATE characters SET ${attribute} = ?, currentXp = ? WHERE id = ?`,
        [character[attribute], currencies.currentXp, character.id]
      );

      // Actualizar el caché
      DatabaseService.updateCharacterInCache(character.id, character);

      return character;
    } catch (error) {
      console.error("Error en upgradeCharacterAttribute:", error);
      throw new Error("No se pudo actualizar el personaje. Inténtalo nuevamente.");
    }
  }


  static async getEquippedStats(id:number){
    return DatabaseService.getCharacterFromCache(id);
  }

}

export default CharacterService;