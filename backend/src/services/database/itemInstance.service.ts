import { db } from "../../../data/database";
import { ItemInstance } from "../../models/itemInstance.model";
export interface dbItemInstance {
  id: number;
  character_id: number;
  item_id: number;
  stock: number;
  equipped: boolean;
}
class ItemInstanceService {
  static async createItemInstance(instance: dbItemInstance): Promise<number> {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO item_instances (character_id, item_id, stock, equipped)
        VALUES (?, ?, ?, ?);
      `;

      const params = [
        instance.character_id,
        instance.item_id,
        instance.stock,
        instance.equipped ? 1 : 0,
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
  static async getItemInstanceById(instanceId: number): Promise<dbItemInstance | null> {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM item_instances WHERE id = ?;`;
      db.get(query, [instanceId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? row as dbItemInstance : null);
        }
      });
    });
  }
  static async getInventoryByCharacterId(characterId: number): Promise<dbItemInstance[]> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM item_instances WHERE character_id = ?;
      `;
      db.all(query, [characterId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as dbItemInstance[]);
        }
      });
    });
  }
  static async updateItemInstance(updatedInstance: dbItemInstance): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE item_instances SET
          character_id = ?, item_id = ?, stock = ?, equipped = ?
        WHERE id = ?;
      `;

      const params = [
        updatedInstance.character_id,
        updatedInstance.item_id,
        updatedInstance.stock,
        updatedInstance.equipped ? 1 : 0,
        updatedInstance.id
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
  static async deleteItemInstance(instanceId: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM item_instances WHERE id = ?;`;
      db.run(query, [instanceId], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }
  static async updateInventory(characterId: number, updatedItems: ItemInstance[]): Promise<boolean> {
    try {
      await this.deleteInventoryByCharacterId(characterId);
      for (const item of updatedItems) {
        await ItemInstanceService.createItemInstance({
          id:item.id,
          character_id: characterId,
          item_id: item.itemId,
          stock: item.stock,
          equipped: item.equipped,
        });
      }
      return true;
    } catch (error) {
      console.error(`❌ Error al actualizar inventario para el personaje ${characterId}:`, error);
      return false;
    }
  }
  static async deleteInventoryByCharacterId(characterId: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM item_instances WHERE character_id = ?;`;
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
export default ItemInstanceService;
