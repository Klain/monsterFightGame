import { db } from "../../database";

export interface dbBattleLog {
  id?: number;
  attacker_id: number;
  defender_id: number;
  winner_id: number;
  gold_won: number;
  xp_won: number;
  last_attack: string; 
}

class BattleLogService {
  static async createBattle(battle: dbBattleLog): Promise<number> {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO battle_logs (attacker_id, defender_id, winner_id, gold_won, xp_won, last_attack)
        VALUES (?, ?, ?, ?, ?, ?);
      `;

      const params = [
        battle.attacker_id,
        battle.defender_id,
        battle.winner_id,
        battle.gold_won,
        battle.xp_won,
        battle.last_attack
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
  static async getBattleById(battleId: number): Promise<dbBattleLog | null> {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM battle_logs WHERE id = ?;`;
      db.get(query, [battleId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? row as dbBattleLog : null);
        }
      });
    });
  }
  /**
   * Obtiene todos los dbBattleLogs relacionados con un character.
   *  @param {number} characterId - ID atacante Ó defensor
   *  @returns {Promise<dbBattleLog[]>} - Promesa de los dbBattleLogs
   */
  static async getBattlesByCharacterId(characterId: number): Promise<dbBattleLog[]> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM battle_logs WHERE attacker_id = ? OR defender_id = ?;
      `;
      db.all(query, [characterId, characterId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as dbBattleLog[]);
        }
      });
    });
  }
  static async updateBattle(updatedBattle: dbBattleLog): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE battle_logs SET
          attacker_id = ?, defender_id = ?, winner_id = ?, 
          gold_won = ?, xp_won = ?, last_attack = ?
        WHERE id = ?;
      `;

      const params = [
        updatedBattle.attacker_id,
        updatedBattle.defender_id,
        updatedBattle.winner_id,
        updatedBattle.gold_won,
        updatedBattle.xp_won,
        updatedBattle.last_attack,
        updatedBattle.id
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
  static async deleteBattle(battleId: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM battle_logs WHERE id = ?;`;
      db.run(query, [battleId], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }
}

export default BattleLogService;
