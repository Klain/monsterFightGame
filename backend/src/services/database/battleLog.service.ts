import { db } from "../../database";

export interface dbBattleLog {
  id?: number;
  attacker_id: number;
  defender_id: number;
  winner_id: number;
  gold_won: number;
  xp_won: number;
  last_attack: string; // Timestamp en formato ISO
}

// 📌 Servicio para manejar los combates en la base de datos
class BattleLogService {
  // ✅ Registrar un nuevo combate
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

  // ✅ Obtener un combate por ID
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

  // ✅ Obtener todos los combates de un personaje (como atacante o defensor)
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

  // ✅ Actualizar los datos de un combate
  static async updateBattle(battleId: number, updatedBattle: Partial<dbBattleLog>): Promise<boolean> {
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
        battleId
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

  // ✅ Eliminar un combate por ID
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
