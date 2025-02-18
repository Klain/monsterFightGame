import { db } from "../../database";

export interface dbEffect {
  id?: number;
  name: string;
}

// 📌 Servicio para manejar los efectos en la base de datos
class EffectService {
  // ✅ Crear un nuevo efecto
  static async createEffect(effect: dbEffect): Promise<number> {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO effects (name)
        VALUES (?);
      `;

      db.run(query, [effect.name], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  // ✅ Obtener un efecto por ID
  static async getEffectById(effectId: number): Promise<dbEffect | null> {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM effects WHERE id = ?;`;
      db.get(query, [effectId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? row as dbEffect : null);
        }
      });
    });
  }

  // ✅ Obtener todos los efectos
  static async getAllEffects(): Promise<dbEffect[]> {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM effects;`;
      db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as dbEffect[]);
        }
      });
    });
  }

  // ✅ Actualizar un efecto
  static async updateEffect(effectId: number, updatedEffect: Partial<dbEffect>): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE effects SET name = ?
        WHERE id = ?;
      `;

      db.run(query, [updatedEffect.name, effectId], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  // ✅ Eliminar un efecto por ID
  static async deleteEffect(effectId: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM effects WHERE id = ?;`;
      db.run(query, [effectId], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }
}

export default EffectService;
