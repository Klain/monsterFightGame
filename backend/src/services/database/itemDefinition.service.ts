import { db } from "../../database";
import { ItemDefinition } from "../../models/itemDefinition.model";

export interface dbItemDefinition {
  id?: number;
  name: string;
  itemType: number;
  equipType?: number | null;
  equipPositionType?: number | null;
  levelRequired: number;
  price: number;
}
class ItemDefinitionService {
  static async createItem(item: dbItemDefinition): Promise<number> {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO item_definitions (name, itemType, equipType, equipPositionType, levelRequired, price)
        VALUES (?, ?, ?, ?, ?, ?);
      `;

      const params = [
        item.name,
        item.itemType,
        item.equipType || null,
        item.equipPositionType || null,
        item.levelRequired,
        item.price
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
  static async getItemById(itemId: number): Promise<dbItemDefinition | null> {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM item_definitions WHERE id = ?;`;
      db.get(query, [itemId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? row as dbItemDefinition : null);
        }
      });
    });
  }
  static async getAllItems(): Promise<dbItemDefinition[]> {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM item_definitions;`;
      db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as dbItemDefinition[]);
        }
      });
    });
  }
  static async updateItem(updatedItem: Partial<dbItemDefinition>): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE item_definitions SET
          name = ?, itemType = ?, equipType = ?, equipPositionType = ?, 
          levelRequired = ?, price = ?
        WHERE id = ?;
      `;

      const params = [
        updatedItem.name,
        updatedItem.itemType,
        updatedItem.equipType || null,
        updatedItem.equipPositionType || null,
        updatedItem.levelRequired,
        updatedItem.price,
        updatedItem.id
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
  static async deleteItem(itemId: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM item_definitions WHERE id = ?;`;
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
export default ItemDefinitionService;
