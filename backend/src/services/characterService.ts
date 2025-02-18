import CacheDataService from "./CacheDataService";
import { Character } from "../models/character.model";
import { AttributeType } from "../constants/attributes";
import { ActivityReward } from "../models/activityReward.model";
import webSocketService from "./webSocketService";
import ServerConfig from "../constants/serverConfig";

class CharacterService {
  // Crear un personaje para un usuario
  static async createCharacterForUser(userId: number, username: string): Promise<Character> {
    try {
      const defaultFaction = "Neutral";
      const defaultClass = 1;

      // Crea una instancia inicial del personaje con valores predeterminados
      const newCharacter = new Character({
        userId,
        name: username,
        faction: defaultFaction,
        class: defaultClass,
      });

      // Inserta el personaje en la base de datos usando sus propiedades
      const result = await CacheDataService.run(
        `INSERT INTO characters (
          user_id, name, faction, class, level, strength, endurance, constitution, precision, agility, vigor, spirit, willpower, arcane, 
          current_health, total_health, current_stamina, total_stamina, current_mana, total_mana, 
          current_xp, total_xp, current_gold, total_gold, upgrade_points, last_fight
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
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
        ]
      );

      // Añade el `id` del personaje recién creado
      newCharacter.id = result.lastID;

      // Actualizar el caché (si lo usas)
      CacheDataService.updateCharacter(newCharacter.id, newCharacter);

      console.log(`✅ Personaje creado para el usuario ${userId}`);
      return newCharacter;
    } catch (error) {
      console.error("❌ Error al crear personaje:", error);
      throw new Error("Error al crear personaje.");
    }
  }
  // Obtener un personaje por su ID de usuario
  static async getCharacterById(userId: number): Promise<Character|null> {
    const character = CacheDataService.getCharacter(userId);
    return character;
  }
  // Mejorar un atributo del personaje
  // Restringimos el tipo del atributo dinámico
  static async upgradeCharacterAttribute(
    character: Character,
    attribute: AttributeType,
    cost : number,
  ): Promise<Character> {
    try {
      const currentValue = character[attribute];
      const updatedValue = currentValue + 1;
      const updatedXp = character.currentXp - cost;
  
      // Sincronizar con la base de datos
      await CacheDataService.run(
        `UPDATE characters SET ${attribute} = ?, current_xp = ? WHERE id = ?`,
        [updatedValue, updatedXp, character.id]
      );
  
      // Actualizar el objeto en caché
      character[attribute] = updatedValue;
      character.currentXp = updatedXp;
  
      CacheDataService.updateCharacter(character.id, character);
      return character;
    } catch (error) {
      console.error("❌ Error en upgradeCharacterAttribute:", error);
      throw new Error("No se pudo actualizar el personaje. Inténtalo nuevamente.");
    }
  }
  static async updateCharacterRewards(character: Character, rewards: ActivityReward): Promise<void> {
    try {
      character.currentXp += rewards.xp ?? 0;
      character.currentGold += rewards.gold ?? 0;
      character.currentHealth = Math.ceil(Math.min(character.totalHealth, (character.currentHealth + (rewards.health ?? 0) - (rewards.costHealth ?? 0) )));
      character.currentStamina = Math.ceil(Math.min(character.totalStamina, character.currentStamina + (rewards.stamina ?? 0) - (rewards.costStamina ?? 0) ));
      character.currentMana = Math.ceil(Math.min(character.totalMana, character.currentMana + (rewards.mana ?? 0) - (rewards.costMana ?? 0)));
  
      await CacheDataService.run(
        `UPDATE characters SET current_xp = ?, current_gold = ?, current_health = ?, current_stamina = ?, current_mana = ? WHERE id = ?`,
        [character.currentXp, character.currentGold, character.currentHealth, character.currentStamina, character.currentMana, character.id]
      );
  
      CacheDataService.updateCharacter(character.id, character);
    } catch (error) {
      console.error("Error al actualizar las recompensas del personaje:", error);
      throw new Error("No se pudo actualizar las recompensas del personaje.");
    }
  }
  static async getEquippedStats(id:number){
    return CacheDataService.getCharacter(id);
  }
  static async updateCharacterStatus(character: Character): Promise<void> {
    try {
      await CacheDataService.run(
        `UPDATE characters 
          SET current_health = ?, total_health = ?, 
              current_stamina = ?, total_stamina = ?, 
              current_mana = ?, total_mana = ? 
          WHERE id = ?`,
        [
          character.currentHealth,
          character.totalHealth,
          character.currentStamina,
          character.totalStamina,
          character.currentMana,
          character.totalMana,
          character.id,
        ]
      );
      webSocketService.characterRefresh(character.userId,{
        ...character.wsrStatus(),
      });

      console.log(`✅ Estado actualizado para el personaje ${character.name}`);
    } catch (error) {
      console.error("❌ Error al actualizar el estado del personaje:", error);
      throw new Error("Error al actualizar el estado del personaje.");
    }
  }
  static async updateCharacterCurrencies(character: Character): Promise<void> {
    try {
      await CacheDataService.run(
        `UPDATE characters 
          SET current_gold = ?, total_gold = ?, 
              current_xp = ?, total_xp = ? 
          WHERE id = ?`,
        [
          character.currentGold,
          character.totalGold,
          character.currentXp,
          character.totalXp,
          character.id,
        ]
      );
      webSocketService.characterRefresh(character.userId,{
        ...character.wsrCurrencies(),
      });

      console.log(`✅ Monedas y experiencia actualizadas para el personaje ${character.name}`);
    } catch (error) {
      console.error("❌ Error al actualizar monedas/experiencia del personaje:", error);
      throw new Error("Error al actualizar monedas y experiencia del personaje.");
    }
  }
  static async applyCombatRewards(
    winner: Character,
    loser: Character,
    xpGained: number,
    goldLooted: number,
    isDraw:boolean=false,
  ): Promise<void> {
    try {
      winner.currentXp += xpGained * (!isDraw?ServerConfig.assault.winnerXpBonus:1);
      winner.totalXp += xpGained * (!isDraw?ServerConfig.assault.winnerXpBonus:1);
      loser.currentXp += xpGained;
      loser.totalXp += xpGained;
      if(!isDraw){
        // Aplicar recompensas al ganador
        winner.currentGold += goldLooted;
        winner.totalGold += goldLooted;
        // Penalizar al perdedor
        loser.currentGold = Math.max(0, loser.currentGold - goldLooted);
      }
        // Actualizar ambos personajes en la base de datos
        await this.updateCharacterCurrencies(winner);
        await this.updateCharacterCurrencies(loser);

        console.log(`✅ Recompensas aplicadas: ${winner.name} ganó ${xpGained} XP y ${goldLooted} oro.`);
        console.log(`✅ Penalizaciones aplicadas: ${loser.name} perdió ${goldLooted} oro.`);
    } catch (error) {
      console.error("❌ Error al aplicar recompensas de combate:", error);
      throw new Error("Error al aplicar recompensas de combate.");
    }
  }
  static async getOpponentList(character: Character, range: number = 5): Promise<Character[]> {
    try {
      const minLevel = Math.max(1, character.level - range);
      const maxLevel = character.level + range;
      const results = await CacheDataService.all<Character>(
        `SELECT * FROM characters 
          WHERE id != ? AND level BETWEEN ? AND ? 
          AND (last_fight IS NULL OR last_fight <= datetime('now', '-1 hour'))
          ORDER BY RANDOM() LIMIT 30`,
        [character.id, minLevel, maxLevel]
      );
      const shuffled = results.sort(() => 0.5 - Math.random()).slice(0, 5);
      return shuffled.map((result) => new Character(result));
    } catch (error) {
      console.error("Error al obtener posibles oponentes:", error);
      throw new Error("Error al buscar posibles oponentes.");
    }
  }
  /**
   * Genera un personaje "dummy" para usarse como oponente.
   * @param referenceCharacter - El personaje de referencia (nivel parejo, facción, etc.).
   * @returns Una instancia de Character con valores predeterminados.
   */
  static createDummy(referenceCharacter: Character): Character {
    // Crear atributos con valores aleatorios basados en el nivel del personaje de referencia
    const level = referenceCharacter.level;
    const randomStat = () => Math.max(1, Math.floor(Math.random() * level + 5));

    return new Character({
      name: `Dummy Lv${level}`,
      level: level,
      faction: "Neutral",
      strength: randomStat(),
      endurance: randomStat(),
      precision: randomStat(),
      agility: randomStat(),
      vigor: randomStat(),
      spirit: randomStat(),
      willpower: randomStat(),
      arcane: randomStat(),
      currentHealth: 100 + level * 5,
      totalHealth: 100 + level * 5,
      currentStamina: 100,
      totalStamina: 100,
      currentMana: 100,
      totalMana: 100,
    });
  }

}

export default CharacterService;