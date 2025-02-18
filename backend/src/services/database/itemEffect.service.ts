import { db } from "../../database";

export interface dbItemEffect {
  item_id: number;
  effect_id: number;
  value: number;
}

// 📌 Servicio para manejar la relación entre ítems y efectos en la base de datos
class ItemEffectService {
  // ✅ Asignar un efecto a un ítem
  static async addEffectToItem(itemEffect: dbItemEffect): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO items_effects (item_id, effect_id, value)
        VALUES (?, ?, ?);
      `;

      db.run(query, [itemEffect.item_id, itemEffect.effect_id, itemEffect.value], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  // ✅ Obtener los efectos de un ítem por su ID
  static async getEffectsByItemId(itemId: number): Promise<dbItemEffect[]> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT ie.item_id, ie.effect_id, ie.value, e.name AS effect_name
        FROM items_effects ie
        INNER JOIN effects e ON ie.effect_id = e.id
        WHERE ie.item_id = ?;
      `;

      db.all(query, [itemId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as dbItemEffect[]);
        }
      });
    });
  }

  // ✅ Eliminar un efecto específico de un ítem
  static async removeEffectFromItem(itemId: number, effectId: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const query = `
        DELETE FROM items_effects WHERE item_id = ? AND effect_id = ?;
      `;

      db.run(query, [itemId, effectId], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  // ✅ Eliminar todos los efectos de un ítem
  static async removeAllEffectsFromItem(itemId: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const query = `
        DELETE FROM items_effects WHERE item_id = ?;
      `;

      db.run(query, [itemId], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }
}

export default ItemEffectService;
