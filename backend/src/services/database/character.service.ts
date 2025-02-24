import { db } from "../../../data/database";
import { Character } from "../../models/character.model";

export interface dbCharacter{
  user_id :number, 
  character_id:number,
  name:string, 
  faction:string, 
  class:number, 
  level:number, 
  strength:number, 
  endurance:number, 
  constitution:number,
  precision:number,
  agility:number, 
  vigor:number, 
  spirit:number, 
  willpower:number, 
  arcane:number, 
  current_health:number, 
  total_health:number, 
  current_stamina:number, 
  total_stamina:number, 
  current_mana:number, 
  total_mana:number, 
  current_xp:number, 
  total_xp:number, 
  current_gold:number, 
  total_gold:number, 
  upgrade_points:number, 
  gold_chest:number,
  warehouse:number,
  enviroment:number,
  traps:number,
  last_fight: string
}
class CharacterService {
  static async createCharacter(character: Partial<Character>): Promise<number> {
    return new Promise(async (resolve, reject) => {
      const query = `
        INSERT INTO characters (
          user_id, name, faction, class, level, strength, endurance, constitution, 
          precision, agility, vigor, spirit, willpower, arcane, 
          current_health, total_health, current_stamina, total_stamina, 
          current_mana, total_mana, current_xp, total_xp, 
          current_gold, total_gold, 
          gold_chest , warehouse , enviroment , traps , 
          upgrade_points, last_fight
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `;

      const params = [
        character.userId, character.name, character.faction, character.class, character.level,
        character.strength, character.endurance, character.constitution,
        character.precision, character.agility, character.vigor, character.spirit,
        character.willpower, character.arcane, character.currentHealth, character.totalHealth,
        character.currentStamina, character.totalStamina, character.currentMana, character.totalMana,
        character.currentXp, character.totalXp, character.currentGold, character.totalGold,
        character.goldChest, character.warehouse, character.enviroment, character.traps, 
        character.upgradePoints, character.lastFight || null
      ];

      db.run(query, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }
  static async getCharacterById(characterId: number): Promise<dbCharacter | null> {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM characters WHERE id = ?;`;
      db.get(query, [characterId], (err, row : dbCharacter) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? row : null);
        }
      });
    });
  }
  static async getAllCharacters(): Promise<dbCharacter[]> {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM characters;`;
      db.all(query, [], (err, rows:dbCharacter[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
  static async updateCharacter(updatedCharacter: Partial<Character>): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE characters SET
          user_id = ?, name = ?, faction = ?, class = ?, level = ?, strength = ?, endurance = ?, 
          constitution = ?, precision = ?, agility = ?, vigor = ?, spirit = ?, willpower = ?, arcane = ?, 
          current_health = ?, total_health = ?, current_stamina = ?, total_stamina = ?, 
          current_mana = ?, total_mana = ?, current_xp = ?, total_xp = ?, 
          current_gold = ?, total_gold = ?,
          gold_chest = ? , warehouse = ? , enviroment = ? , traps = ? , 
          upgrade_points = ?, last_fight = ?
        WHERE id = ?;
      `;

      const params = [
        updatedCharacter.userId, updatedCharacter.name, updatedCharacter.faction, updatedCharacter.class, updatedCharacter.level,
        updatedCharacter.strength, updatedCharacter.endurance, updatedCharacter.constitution,
        updatedCharacter.precision, updatedCharacter.agility, updatedCharacter.vigor, updatedCharacter.spirit,
        updatedCharacter.willpower, updatedCharacter.arcane, updatedCharacter.currentHealth, updatedCharacter.totalHealth,
        updatedCharacter.currentStamina, updatedCharacter.totalStamina, updatedCharacter.currentMana, updatedCharacter.totalMana,
        updatedCharacter.currentXp, updatedCharacter.totalXp, updatedCharacter.currentGold, updatedCharacter.totalGold,
        updatedCharacter.goldChest, updatedCharacter.warehouse, updatedCharacter.enviroment, updatedCharacter.traps, 
        updatedCharacter.upgradePoints, updatedCharacter.lastFight || null,
        updatedCharacter.id
      ];

      db.run(query, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }
  static async deleteCharacter(characterId: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM characters WHERE id = ?;`;
      db.run(query, [characterId], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }
}
export default CharacterService;
