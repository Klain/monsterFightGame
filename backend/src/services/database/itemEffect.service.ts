import { db } from "../../database/database";

export interface dbItemEffect {
  item_id: number;
  effect_id: number;
  value: number;
}
class ItemEffectService {
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
