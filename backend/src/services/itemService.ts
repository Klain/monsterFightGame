import DatabaseService from "./databaseService";
import { Item } from "../models/item.model";

class ItemService {
  /**
   * Crear un nuevo ítem en la base de datos.
   * @param item - El ítem a insertar.
   * @returns El ID del ítem creado.
   */
  static async createItem(item: Item): Promise<number> {
    try {
      const result = await DatabaseService.run(
        `
        INSERT INTO items (name, itemType, equipType, equipPositionType, weaponFamily, armorMaterialType, rarity, levelRequired, price, bonuses, effects)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          item.name,
          item.itemType,
          item.equipType || null,
          item.equipPositionType || null,
          item.weaponFamily || null,
          item.armorMaterialType || null,
          item.rarity,
          item.levelRequired,
          item.price,
          JSON.stringify(item.bonuses), // Serializar bonificaciones como JSON
          JSON.stringify(item.effects), // Serializar efectos como JSON
        ]
      );
      console.log(`✅ Ítem creado: ${item.name}`);
      return result.lastID;
    } catch (error) {
      console.error("❌ Error al crear ítem:", error);
      throw new Error("Error al crear ítem.");
    }
  }
  /**
   * Obtener un ítem por ID.
   * @param id - ID del ítem.
   * @returns El ítem encontrado.
   */
static async getItemById(id: number): Promise<Item | null> {
    try {
      const row = await DatabaseService.get<{
        id: number;
        name: string;
        itemType: number;
        equipType?: number | null;
        equipPositionType?: number | null;
        weaponFamily?: number | null;
        armorMaterialType?: number | null;
        rarity: number;
        levelRequired: number;
        price: number;
        bonuses: string;
        effects: string;
      }>(`SELECT * FROM items WHERE id = ?`, [id]);
  
      if (!row) return null;
  
      return Item.parseDB(row);
    } catch (error) {
      console.error("❌ Error al obtener ítem:", error);
      throw new Error("Error al obtener ítem.");
    }
  }
  
  /**
   * Obtener todos los ítems.
   * @returns Una lista de ítems.
   */
   static async getAllItems(): Promise<Item[]> {
    try {
      const rows = await DatabaseService.all<{
        id: number;
        name: string;
        itemType: number;
        equipType?: number | null;
        equipPositionType?: number | null;
        weaponFamily?: number | null;
        armorMaterialType?: number | null;
        rarity: number;
        levelRequired: number;
        price: number;
        bonuses: string;
        effects: string;
      }>(`SELECT * FROM items`);
  
      return rows.map(Item.parseDB); // Usar la función estática para cada fila
    } catch (error) {
      console.error("❌ Error al obtener ítems:", error);
      throw new Error("Error al obtener ítems.");
    }
  }
  
  /**
   * Actualizar un ítem en la base de datos.
   * @param item - El ítem con los datos actualizados.
   */
  static async updateItem(item: Item): Promise<void> {
    try {
      await DatabaseService.run(
        `
        UPDATE items SET
          name = ?, itemType = ?, equipType = ?, equipPositionType = ?, weaponFamily = ?, armorMaterialType = ?, rarity = ?, levelRequired = ?, price = ?, bonuses = ?, effects = ?
        WHERE id = ?
        `,
        [
          item.name,
          item.itemType,
          item.equipType || null,
          item.equipPositionType || null,
          item.weaponFamily || null,
          item.armorMaterialType || null,
          item.rarity,
          item.levelRequired,
          item.price,
          JSON.stringify(item.bonuses),
          JSON.stringify(item.effects),
          item.id,
        ]
      );
      console.log(`✅ Ítem actualizado: ${item.name}`);
    } catch (error) {
      console.error("❌ Error al actualizar ítem:", error);
      throw new Error("Error al actualizar ítem.");
    }
  }
  /**
   * Eliminar un ítem de la base de datos.
   * @param id - ID del ítem a eliminar.
   */
  static async deleteItem(id: number): Promise<void> {
    try {
      await DatabaseService.run(`DELETE FROM items WHERE id = ?`, [id]);
      console.log(`✅ Ítem eliminado con ID: ${id}`);
    } catch (error) {
      console.error("❌ Error al eliminar ítem:", error);
      throw new Error("Error al eliminar ítem.");
    }
  }
  static async addItemToCharacter(characterId: number, itemId: number): Promise<void> {
    await DatabaseService.run(
      `INSERT INTO character_items (character_id, item_id, equipped) VALUES (?, ?, ?)`,
      [characterId, itemId, false]
    );
  }
  static async getCharacterItems(characterId: number): Promise<Item[]> {
    const rows = await DatabaseService.all<{
        id: number;
        name: string;
        itemType: number;
        equipType?: number | null;
        equipPositionType?: number | null;
        weaponFamily?: number | null;
        armorMaterialType?: number | null;
        rarity: number;
        levelRequired: number;
        price: number;
        bonuses: string;
        effects: string;
      }>(`SELECT i.* FROM items i 
       JOIN character_items ci ON i.id = ci.item_id 
       WHERE ci.character_id = ?`,
      [characterId]
    );

    return rows.map(Item.parseDB); 

  }
  static async toggleEquipItem(characterId: number, itemId: number, equipped: boolean): Promise<void> {
    await DatabaseService.run(
      `UPDATE character_items SET equipped = ? WHERE character_id = ? AND item_id = ?`,
      [equipped, characterId, itemId]
    );
  }
}

export default ItemService;
