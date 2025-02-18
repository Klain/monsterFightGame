import { db } from "../../database";
import { Character } from "../../models/character.model";
class CharacterService {
  static async createCharacter(character: Partial<Character>): Promise<number> {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO characters (
          user_id, name, faction, class, level, strength, endurance, constitution, 
          precision, agility, vigor, spirit, willpower, arcane, 
          current_health, total_health, current_stamina, total_stamina, 
          current_mana, total_mana, current_xp, total_xp, 
          current_gold, total_gold, upgrade_points, last_fight
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `;

      const params = [
        character.userId, character.name, character.faction, character.class, character.level,
        character.strength, character.endurance, character.constitution,
        character.precision, character.agility, character.vigor, character.spirit,
        character.willpower, character.arcane, character.currentHealth, character.totalHealth,
        character.currentStamina, character.totalStamina, character.currentMana, character.totalMana,
        character.currentXp, character.totalXp, character.currentGold, character.totalGold,
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
  static async getCharacterById(characterId: number): Promise<Character | null> {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM characters WHERE id = ?;`;
      db.get(query, [characterId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? new Character(row) : null);
        }
      });
    });
  }
  static async getAllCharacters(): Promise<Character[]> {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM characters;`;
      db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map((row:any) => new Character(row)));
        }
      });
    });
  }
  static async updateCharacter(characterId: number, updatedCharacter: Partial<Character>): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE characters SET
          user_id = ?, name = ?, faction = ?, class = ?, level = ?, strength = ?, endurance = ?, 
          constitution = ?, precision = ?, agility = ?, vigor = ?, spirit = ?, willpower = ?, arcane = ?, 
          current_health = ?, total_health = ?, current_stamina = ?, total_stamina = ?, 
          current_mana = ?, total_mana = ?, current_xp = ?, total_xp = ?, 
          current_gold = ?, total_gold = ?, upgrade_points = ?, last_fight = ?
        WHERE id = ?;
      `;

      const params = [
        updatedCharacter.userId, updatedCharacter.name, updatedCharacter.faction, updatedCharacter.class, updatedCharacter.level,
        updatedCharacter.strength, updatedCharacter.endurance, updatedCharacter.constitution,
        updatedCharacter.precision, updatedCharacter.agility, updatedCharacter.vigor, updatedCharacter.spirit,
        updatedCharacter.willpower, updatedCharacter.arcane, updatedCharacter.currentHealth, updatedCharacter.totalHealth,
        updatedCharacter.currentStamina, updatedCharacter.totalStamina, updatedCharacter.currentMana, updatedCharacter.totalMana,
        updatedCharacter.currentXp, updatedCharacter.totalXp, updatedCharacter.currentGold, updatedCharacter.totalGold,
        updatedCharacter.upgradePoints, updatedCharacter.lastFight || null,
        characterId
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
