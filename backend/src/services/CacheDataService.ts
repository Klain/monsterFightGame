import DatabaseService from "./database/databaseService";
import { Character } from "../models/character.model";
import { ItemDefinition } from "../models/itemDefinition.model";
import { Activity } from "../models/activity.model";
import { BattleLog } from "../models/battleLog.model";
import { Effect } from "../models/effect.model";
import { dbItemEffect } from "./database/itemEffect.service";
import { ItemInstance } from "../models/itemInstance.model";
import { Message } from "../models/message.model";

class CacheDataService {

  static activities: Map<number, Activity[]> = new Map();
  static battleLogs: Map<number, BattleLog[]> = new Map();
  static characters: Map<number, Character> = new Map();
  static effects: Map<number, Effect> = new Map();
  static itemDefinitions: Map<number, ItemDefinition> = new Map();
  static inventories: Map<number, ItemInstance[]> = new Map();
  static itemEffects: Map<number, dbItemEffect[]> = new Map();
  static messages: Map<number, Message[]> = new Map();

  static pendingUpdates: Set<number> = new Set(); 

  // ✅ Inicializar caché cargando todos los datos desde `DatabaseService`
  static async initializeCache(): Promise<void> {
    try {
      console.log("🔄 Cargando caché...");

      // Ejecutar todas las consultas en paralelo para mejorar el rendimiento
      const [
        dbCharacters,
        dbItems,
        dbEffects,
        dbMessages
      ] = await Promise.all([
        DatabaseService.getAllCharacters(),
        DatabaseService.getAllItemDefinitions(),
        DatabaseService.getAllEffects(),
        DatabaseService.getAllMessages(),
      ]);

      if (!dbCharacters || !dbItems || !dbEffects || !dbMessages) {
        throw new Error("🚨 Error crítico: Datos incompletos en la carga inicial de la caché.");
      }

      console.log(`🏷️ Se encontraron ${dbCharacters.length} personajes.`);
      console.log(`📦 Se encontraron ${dbItems.length} ítems.`);
      console.log(`✨ Se encontraron ${dbEffects.length} efectos.`);
      console.log(`📨 Se encontraron ${dbMessages.length} mensajes.`);

      // Cargar datos en caché
      dbCharacters.forEach(character => this.characters.set(character.id, character));
      dbItems.forEach(item => this.itemDefinitions.set(item.id!, item));
      dbEffects.forEach(effect => this.effects.set(effect.id!, effect));
      dbMessages.forEach(message => {
        if (!this.messages.has(message.receiver_id)) {
          this.messages.set(message.receiver_id, []);
        }
        this.messages.get(message.receiver_id)!.push(message);
      });

      // Cargar dependencias como inventarios, actividades y batallas
      await Promise.all([
        this.initializeInventories(),
        this.initializeActivities(),
        this.initializeBattleLogs(),
        this.initializeItemEffects()
      ]);

      setInterval(() => this.syncPendingUpdates(), 5000); 

      console.log("✅ Caché cargada correctamente.");
    } catch (error) {
      console.error("❌ Error al inicializar la caché:", error);
      process.exit(1);
    }
  }
  // ✅ Cargar inventarios en caché
  static async initializeInventories(): Promise<void> {
    const characters = Array.from(this.characters.keys());
    await Promise.all(
      characters.map(async characterId => {
        const inventoryItems = await DatabaseService.getInventoryByCharacterId(characterId);
        this.characters.get(characterId)!.inventory.items = inventoryItems;
      })
    );
  }
  // ✅ Cargar actividades en caché
  static async initializeActivities(): Promise<void> {
    const characters = Array.from(this.characters.keys());
    await Promise.all(
      characters.map(async characterId => {
        const activities = await DatabaseService.getActivitiesByCharacterId(characterId);
        this.activities.set(characterId, activities);
      })
    );
  }
  // ✅ Cargar batallas en caché
  static async initializeBattleLogs(): Promise<void> {
    const characters = Array.from(this.characters.keys());
    await Promise.all(
      characters.map(async characterId => {
        const battles = await DatabaseService.getBattleLogsByCharacterId(characterId);
        this.battleLogs.set(characterId, battles);
      })
    );
  }
  // ✅ Cargar efectos de ítems en caché
  static async initializeItemEffects(): Promise<void> {
    const itemDefinitions = Array.from(this.itemDefinitions.keys());
    await Promise.all(
      itemDefinitions.map(async itemId => {
        const effects = await DatabaseService.getEffectsByItemId(itemId);
        this.itemEffects.set(itemId, effects);
      })
    );
  }


  // ✅ ACTIVITY CACHE MANAGEMENT
  static getActivityById(activityId: number): Activity | null {
    for (const activities of this.activities.values()) {
      const activity = activities.find(a => a.id === activityId);
      if (activity) return activity;
    }
    return null;
  }
  static getActivitiesByCharacterId(characterId: number): Activity[] {
    return this.activities.get(characterId) || [];
  }
  static createActivity(characterId: number, activity: Activity): void {
    if (!this.activities.has(characterId)) {
      this.activities.set(characterId, []);
    }
    this.activities.get(characterId)!.push(activity);
    this.pendingUpdates.add(characterId);
  }
  static updateActivity(activityId: number, updatedActivity: Partial<Activity>): void {
    for (const [characterId, activities] of this.activities.entries()) {
      const index = activities.findIndex(a => a.id === activityId);
      if (index !== -1) {
        const updated = new Activity({ ...activities[index], ...updatedActivity });
        activities[index] = updated;
        this.activities.set(characterId, activities);
        this.pendingUpdates.add(characterId);
        return;
      }
    }
  }
  static deleteActivity(activityId: number): void {
    for (const [characterId, activities] of this.activities.entries()) {
      this.activities.set(characterId, activities.filter(a => a.id !== activityId));
      this.pendingUpdates.add(characterId);
    }
  }

  // ✅ BATTLE LOG CACHE MANAGEMENT
  static getBattleLogById(battleId: number): BattleLog | null {
    for (const battles of this.battleLogs.values()) {
      const battle = battles.find(b => b.id === battleId);
      if (battle) return battle;
    }
    return null;
  }
  static getBattleLogsByCharacterId(characterId: number): BattleLog[] {
    return this.battleLogs.get(characterId) || [];
  }
  static createBattleLog(characterId: number, battle: BattleLog): void {
    if (!this.battleLogs.has(characterId)) {
      this.battleLogs.set(characterId, []);
    }
    this.battleLogs.get(characterId)!.push(battle);
    this.pendingUpdates.add(characterId);
  }
  static updateBattleLog(battleId: number, updatedBattle: Partial<BattleLog>): void {
    for (const [characterId, battles] of this.battleLogs.entries()) {
      const index = battles.findIndex(b => b.id === battleId);
      if (index !== -1) {
        this.battleLogs.get(characterId)![index] = { ...battles[index], ...updatedBattle };
        this.pendingUpdates.add(characterId);
        return;
      }
    }
  }
  static deleteBattleLog(battleId: number): void {
    for (const [characterId, battles] of this.battleLogs.entries()) {
      this.battleLogs.set(characterId, battles.filter(b => b.id !== battleId));
      this.pendingUpdates.add(characterId);
    }
  }
 
  // ✅ CHARACTER CACHE MANAGEMENT
  static getCharacterById(characterId: number): Character | null {
    return this.characters.get(characterId) || null;
  }
  static getAllCharacters(): Character[] {
    return Array.from(this.characters.values());
  }
  static createCharacter(character: Character): void {
    this.characters.set(character.id, character);
    this.pendingUpdates.add(character.id);
  }
  static updateCharacter(characterId: number, updatedCharacter: Partial<Character>): void {
    if (this.characters.has(characterId)) {
      const existingCharacter = this.characters.get(characterId)!;
      const updated = new Character({ ...existingCharacter, ...updatedCharacter });
      this.characters.set(characterId, updated);
      this.pendingUpdates.add(characterId);
    }
  }
  static deleteCharacter(characterId: number): void {
    this.characters.delete(characterId);
    this.pendingUpdates.add(characterId);
  }

  // ✅ EFFECTS CACHE MANAGEMENT
  static getEffectById(effectId: number): Effect | null {
    return this.effects.get(effectId) || null;
  }
  static getAllEffects(): Effect[] {
    return Array.from(this.effects.values());
  }
  static createEffect(effect: Effect): void {
    this.effects.set(effect.id!, effect);
    this.pendingUpdates.add(effect.id!);
  }
  static updateEffect(effectId: number, updatedEffect: Partial<Effect>): void {
    if (this.effects.has(effectId)) {
      this.effects.set(effectId, { ...this.effects.get(effectId)!, ...updatedEffect });
      this.pendingUpdates.add(effectId);
    }
  }
  static deleteEffect(effectId: number): void {
    this.effects.delete(effectId);
    this.pendingUpdates.add(effectId);
  }

  // ✅ ITEM DEFINITIONS CACHE MANAGEMENT
  static getItemDefinitionById(itemId: number): ItemDefinition | null {
    return this.itemDefinitions.get(itemId) || null;
  }
  static getAllItemDefinitions(): ItemDefinition[] {
    return Array.from(this.itemDefinitions.values());
  }
  static createItemDefinition(item: ItemDefinition): void {
    this.itemDefinitions.set(item.id!, item);
    this.pendingUpdates.add(item.id!);
  }
  static updateItemDefinition(itemId: number, updatedItem: Partial<ItemDefinition>): void {
    if (this.itemDefinitions.has(itemId)) {
      const existingItem = this.itemDefinitions.get(itemId)!;
      const updated = new ItemDefinition({ ...existingItem, ...updatedItem });
      this.itemDefinitions.set(itemId, updated);
      this.pendingUpdates.add(itemId);
    }
  }
  static deleteItemDefinition(itemId: number): void {
    this.itemDefinitions.delete(itemId);
    this.pendingUpdates.add(itemId);
  }

  // ✅ ITEM INSTANCES CACHE MANAGEMENT
  static getItemInstanceById(instanceId: number): ItemInstance | null {
    for (const inventory of this.inventories.values()) {
      const instance = inventory.find(i => i.id === instanceId);
      if (instance) return instance;
    }
    return null;
  }
  static getInventoryByCharacterId(characterId: number): ItemInstance[] {
    return this.inventories.get(characterId) || [];
  }
  static createItemInstance(characterId: number, instance: ItemInstance): void {
    if (!this.inventories.has(characterId)) {
      this.inventories.set(characterId, []);
    }
    this.inventories.get(characterId)!.push(instance);
    this.pendingUpdates.add(characterId);
  }
  static updateItemInstance(instanceId: number, updatedInstance: Partial<ItemInstance>): void {
    for (const [characterId, inventory] of this.inventories.entries()) {
      const index = inventory.findIndex(i => i.id === instanceId);
      if (index !== -1) {
        // Mantener la instancia de ItemInstance
        const updated = new ItemInstance({ ...inventory[index], ...updatedInstance });
  
        // Reemplazar el objeto en la lista correctamente
        this.inventories.get(characterId)![index] = updated;
        
        this.pendingUpdates.add(characterId);
        return;
      }
    }
  }  
  static deleteItemInstance(instanceId: number): void {
    for (const [characterId, inventory] of this.inventories.entries()) {
      this.inventories.set(characterId, inventory.filter(i => i.id !== instanceId));
      this.pendingUpdates.add(characterId);
    }
  }
  static updateInventory(characterId: number, updatedItems: ItemInstance[]): void {
    this.inventories.set(characterId, updatedItems);
    this.pendingUpdates.add(characterId);
  }
  static deleteInventoryByCharacterId(characterId: number): void {
    this.inventories.delete(characterId);
    this.pendingUpdates.add(characterId);
  }

  // ✅ ITEM EFFECTS CACHE MANAGEMENT
  static getEffectsByItemId(itemId: number): dbItemEffect[] {
    return this.itemEffects.get(itemId) || [];
  }
  static addEffectToItem(itemEffect: dbItemEffect): void {
    if (!this.itemEffects.has(itemEffect.item_id)) {
      this.itemEffects.set(itemEffect.item_id, []);
    }
    this.itemEffects.get(itemEffect.item_id)!.push(itemEffect);
    this.pendingUpdates.add(itemEffect.item_id);
  }
  static removeEffectFromItem(itemId: number, effectId: number): void {
    if (this.itemEffects.has(itemId)) {
      this.itemEffects.set(
        itemId,
        this.itemEffects.get(itemId)!.filter(effect => effect.effect_id !== effectId)
      );
      this.pendingUpdates.add(itemId);
    }
  }
  static removeAllEffectsFromItem(itemId: number): void {
    this.itemEffects.delete(itemId);
    this.pendingUpdates.add(itemId);
  }

  // ✅ MESSAGE CACHE MANAGEMENT
  static getMessageById(messageId: number): Message | null {
    for (const messageList of this.messages.values()) {
      const message = messageList.find(m => m.id === messageId);
      if (message) return message;
    }
    return null;
  }
  static getMessagesByUserId(userId: number): Message[] {
    return this.messages.get(userId) || [];
  }
  static sendMessage(userId: number, message: Message): void {
    if (!this.messages.has(userId)) {
      this.messages.set(userId, []);
    }
    this.messages.get(userId)!.push(message);
    this.pendingUpdates.add(userId);
  }
  static markMessageAsRead(messageId: number): void {
    for (const [userId, messageList] of this.messages.entries()) {
      const index = messageList.findIndex(m => m.id === messageId);
      if (index !== -1) {
        this.messages.get(userId)![index].read = true;
        this.pendingUpdates.add(userId);
        return;
      }
    }
  }
  static deleteMessage(messageId: number): void {
    for (const [userId, messageList] of this.messages.entries()) {
      this.messages.set(userId, messageList.filter(m => m.id !== messageId));
      this.pendingUpdates.add(userId);
    }
  }

  // ✅ SINCRONIZACIÓN DIFERIDA CON BASE DE DATOS (Optimizada)
  static async syncPendingUpdates(): Promise<void> {
    if (this.pendingUpdates.size === 0) return; // Nada que actualizar

    console.log(`🔄 Sincronizando ${this.pendingUpdates.size} cambios con la base de datos...`);

    const batchSize = 10; // Tamaño del lote para procesamiento por partes
    const pendingArray = Array.from(this.pendingUpdates);

    while (pendingArray.length > 0) {
      const batch = pendingArray.splice(0, batchSize);

      await Promise.all(
        batch.map(async (id) => {
          try {
            // 📌 1️⃣ Sincronización del Personaje y su Inventario (Unificados en Caché)
            if (this.characters.has(id)) {
              const character = this.characters.get(id)!;
              await DatabaseService.updateCharacter(id, character);

              // Inventario ahora forma parte de Character
              if (character.inventory) {
                await DatabaseService.updateInventory(id, character.inventory.items);
              }
            } else {
              await DatabaseService.deleteCharacter(id);
              await DatabaseService.deleteInventoryByCharacterId(id);
            }

            // 📌 2️⃣ Sincronización de Actividades
            if (this.activities.has(id)) {
              await Promise.all(
                this.activities.get(id)!.map(async (activity) =>
                  DatabaseService.updateActivity(activity.id!, activity)
                )
              );
            }

            // 📌 3️⃣ Sincronización de Logs de Batalla
            if (this.battleLogs.has(id)) {
              await Promise.all(
                this.battleLogs.get(id)!.map(async (battle) =>
                  DatabaseService.updateBattleLog(battle.id!, battle)
                )
              );
            }

            // 📌 4️⃣ Sincronización de Efectos
            if (this.effects.has(id)) {
              await DatabaseService.updateEffect(id, this.effects.get(id)!);
            } else {
              await DatabaseService.deleteEffect(id);
            }

            // 📌 5️⃣ Sincronización de Definiciones de Ítems
            if (this.itemDefinitions.has(id)) {
              await DatabaseService.updateItemDefinition(id, this.itemDefinitions.get(id)!);
            } else {
              await DatabaseService.deleteItemDefinition(id);
            }

            // 📌 6️⃣ Sincronización de Efectos de Ítems
            if (this.itemEffects.has(id)) {
              await Promise.all(
                this.itemEffects.get(id)!.map(async (effect) =>
                  DatabaseService.addEffectToItem(effect)
                )
              );
            } else {
              await DatabaseService.removeAllEffectsFromItem(id);
            }

            // 📌 7️⃣ Sincronización de Mensajes
            if (this.messages.has(id)) {
              await Promise.all(
                this.messages.get(id)!.map(async (message) => {
                  if (message.read) {
                    await DatabaseService.markMessageAsRead(message.id!);
                  }
                })
              );
            }
          } catch (error) {
            console.error(`❌ Error al sincronizar ID ${id}:`, error);
          }
        })
      );
    }

    // ✅ Limpiar cambios pendientes después de la sincronización exitosa
    this.pendingUpdates.clear();
    console.log("✅ Sincronización completada.");
  }


}

export default CacheDataService;
