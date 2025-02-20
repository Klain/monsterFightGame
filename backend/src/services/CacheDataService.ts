import DatabaseService from "./database/databaseService";
import { Character } from "../models/character.model";
import { ItemDefinition } from "../models/itemDefinition.model";
import { Activity } from "../models/activity.model";
import { BattleLog } from "../models/battleLog.model";
import { ItemEffect } from "../models/itemEffect.model";
import { Effect } from "../models/effect.model";
import { ItemInstance } from "../models/itemInstance.model";
import { Message } from "../models/message.model";

class CacheDataService {

  static activities: Map<number, Activity[]> = new Map();
  static battleLogs: Map<number, BattleLog[]> = new Map();
  static characters: Map<number, Character> = new Map();
  static effects: Map<number, Effect> = new Map();
  static itemDefinitions: Map<number, ItemDefinition> = new Map();
  static inventories: Map<number, ItemInstance[]> = new Map();
  static itemEffects: Map<number, ItemEffect[]> = new Map();
  static messages: Map<number, Message[]> = new Map();

  static pendingActivities: Set<number> = new Set();
  static pendingBattleLogs: Set<number> = new Set();
  static pendingCharacters: Set<number> = new Set();
  static pendingEffects: Set<number> = new Set();
  static pendingItemDefinitions: Set<number> = new Set();
  static pendingInventories: Set<number> = new Set();
  static pendingItemEffects: Set<number> = new Set();
  static pendingMessages: Set<number> = new Set();

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
        if (!this.messages.has(message.receiverId)) {
          this.messages.set(message.receiverId, []);
        }
        this.messages.get(message.receiverId)!.push(message);
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

  static async initializeInventories(): Promise<void> {
    const characters = Array.from(this.characters.keys());
    await Promise.all(
      characters.map(async characterId => {
        const inventoryItems = await DatabaseService.getInventoryByCharacterId(characterId);
        this.characters.get(characterId)!.inventory.items = inventoryItems;
      })
    );
  }
  static async initializeActivities(): Promise<void> {
    const characters = Array.from(this.characters.keys());
    await Promise.all(
      characters.map(async characterId => {
        const activities = await DatabaseService.getActivitiesByCharacterId(characterId);
        this.activities.set(characterId, activities);
      })
    );
  }
  static async initializeBattleLogs(): Promise<void> {
    const characters = Array.from(this.characters.keys());
    await Promise.all(
      characters.map(async characterId => {
        const battles = await DatabaseService.getBattleLogsByCharacterId(characterId);
        this.battleLogs.set(characterId, battles);
      })
    );
  }
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
  static createActivity(activity: Activity): void {
    if (!this.activities.has(activity.characterId)) {
      this.activities.set(activity.characterId, []);
    }
    this.activities.get(activity.characterId)!.push(activity);
    this.pendingActivities.add(activity.characterId);
  }
  static updateActivity(updatedActivity: Activity): void {
    for (const [characterId, activities] of this.activities.entries()) {
      const index = activities.findIndex(a => a.id === updatedActivity.id);
      if (index !== -1) {
        const updated = new Activity({ ...activities[index], ...updatedActivity });
        activities[index] = updated;
        this.activities.set(characterId, activities);
        this.pendingActivities.add(characterId);
        return;
      }
    }
  }
  static deleteActivity(activityId: number): void {
    for (const [characterId, activities] of this.activities.entries()) {
      this.activities.set(characterId, activities.filter(a => a.id !== activityId));
      this.pendingActivities.add(characterId);
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
  static createBattleLog(battle: BattleLog): void {
    if (!this.battleLogs.has(battle.attackerId)) {
      this.battleLogs.set(battle.attackerId, []);
    }
    this.battleLogs.get(battle.attackerId)!.push(battle);
    this.pendingBattleLogs.add(battle.attackerId);
  }
  static updateBattleLog(updatedBattle: Partial<BattleLog>): void {
    for (const [characterId, battles] of this.battleLogs.entries()) {
      const index = battles.findIndex(b => b.id === updatedBattle.id);
      if (index !== -1) {
        this.battleLogs.get(characterId)![index] = { ...battles[index], ...updatedBattle };
        this.pendingBattleLogs.add(characterId);
        return;
      }
    }
  }
  static deleteBattleLog(battleId: number): void {
    for (const [characterId, battles] of this.battleLogs.entries()) {
      this.battleLogs.set(characterId, battles.filter(b => b.id !== battleId));
      this.pendingBattleLogs.add(characterId);
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
    this.pendingCharacters.add(character.id);
  }
  static updateCharacter(updatedCharacter: Character): void {
    if (this.characters.has(updatedCharacter.id)) {
      const existingCharacter = this.characters.get(updatedCharacter.id)!;
      const updated = new Character({ ...existingCharacter, ...updatedCharacter });
      this.characters.set(updatedCharacter.id, updated);
      this.pendingCharacters.add(updatedCharacter.id);
    }
  }
  static deleteCharacter(characterId: number): void {
    this.characters.delete(characterId);
    this.pendingCharacters.add(characterId);
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
    this.pendingEffects.add(effect.id!);
  }
  static updateEffect(updatedEffect: Effect): void {
    if (this.effects.has(updatedEffect.id)) {
      this.effects.set(updatedEffect.id, { ...this.effects.get(updatedEffect.id)!, ...updatedEffect });
      this.pendingEffects.add(updatedEffect.id);
    }
  }
  static deleteEffect(effectId: number): void {
    this.effects.delete(effectId);
    this.pendingEffects.add(effectId);
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
    this.pendingItemDefinitions.add(item.id!);
  }
  static updateItemDefinition(updatedItem: ItemDefinition): void {
    if (this.itemDefinitions.has(updatedItem.id)) {
      const existingItem = this.itemDefinitions.get(updatedItem.id)!;
      const updated = new ItemDefinition({ ...existingItem, ...updatedItem });
      this.itemDefinitions.set(updatedItem.id, updated);
      this.pendingItemDefinitions.add(updatedItem.id);
    }
  }
  static deleteItemDefinition(itemId: number): void {
    this.itemDefinitions.delete(itemId);
    this.pendingItemDefinitions.add(itemId);
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
  static createItemInstance(instance: ItemInstance): void {
    if (!this.inventories.has(instance.character_id)) {
      this.inventories.set(instance.character_id, []);
    }
    this.inventories.get(instance.character_id)!.push(instance);
    this.pendingInventories.add(instance.character_id);
  }
  static updateItemInstance(updatedInstance: ItemInstance): void {
    for (const [characterId, inventory] of this.inventories.entries()) {
      const index = inventory.findIndex(i => i.id === updatedInstance.id);
      if (index !== -1) {
        // Mantener la instancia de ItemInstance
        const updated = new ItemInstance({ ...inventory[index], ...updatedInstance });
  
        // Reemplazar el objeto en la lista correctamente
        this.inventories.get(characterId)![index] = updated;
        
        this.pendingInventories.add(characterId);
        return;
      }
    }
  }  
  static deleteItemInstance(instanceId: number): void {
    for (const [characterId, inventory] of this.inventories.entries()) {
      this.inventories.set(characterId, inventory.filter(i => i.id !== instanceId));
      this.pendingInventories.add(characterId);
    }
  }
  static updateInventory(characterId: number, updatedItems: ItemInstance[]): void {
    this.inventories.set(characterId, updatedItems);
    this.pendingInventories.add(characterId);
  }
  static deleteInventoryByCharacterId(characterId: number): void {
    this.inventories.delete(characterId);
    this.pendingInventories.add(characterId);
  }

  // ✅ ITEM EFFECTS CACHE MANAGEMENT
  static getEffectsByItemId(itemId: number): ItemEffect[] {
    return this.itemEffects.get(itemId) || [];
  }
  static addEffectToItem(itemEffect: ItemEffect): void {
    if (!this.itemEffects.has(itemEffect.itemId)) {
      this.itemEffects.set(itemEffect.itemId, []);
    }
    this.itemEffects.get(itemEffect.itemId)!.push(itemEffect);
    this.pendingItemEffects.add(itemEffect.itemId);
  }
  static removeEffectFromItem(itemEffect:ItemEffect): void {
    if (this.itemEffects.has(itemEffect.itemId)) {
      this.itemEffects.set(
        itemEffect.itemId,
        this.itemEffects.get(itemEffect.itemId)!.filter(effect => effect.effectId !== itemEffect.effectId)
      );
      this.pendingItemEffects.add(itemEffect.itemId);
    }
  }
  static removeAllEffectsFromItem(itemId: number): void {
    this.itemEffects.delete(itemId);
    this.pendingItemEffects.add(itemId);
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
  static sendMessage(message: Message): void {
    if (!this.messages.has(message.receiverId)) {
      this.messages.set(message.receiverId, []);
    }
    this.messages.get(message.receiverId)!.push(message);
    this.pendingMessages.add(message.receiverId);
  }
  static markMessageAsRead(messageId: number): void {
    for (const [userId, messageList] of this.messages.entries()) {
      const index = messageList.findIndex(m => m.id === messageId);
      if (index !== -1) {
        this.messages.get(userId)![index].read = true;
        this.pendingMessages.add(userId);
        return;
      }
    }
  }
  static deleteMessage(messageId: number): void {
    for (const [userId, messageList] of this.messages.entries()) {
      this.messages.set(userId, messageList.filter(m => m.id !== messageId));
      this.pendingMessages.add(userId);
    }
  }

  // ✅ SINCRONIZACIÓN DIFERIDA CON BASE DE DATOS 
  static async syncPendingUpdates(): Promise<void> {
    console.log(`🔄 Sincronizando cambios con la base de datos...`);

    const batchSize = 10;

    try {
      // 📌 1️⃣ Definir las categorías y funciones de sincronización
      const pendingUpdates = [
        {
          name: "Characters",
          set: this.pendingCharacters,
          getMap: this.characters,
          create: DatabaseService.createCharacter,
          update: DatabaseService.updateCharacter,
          delete: DatabaseService.deleteCharacter,
        },
        {
          name: "ItemInstances",
          set: this.pendingInventories, 
          getMap: this.inventories,
          create: async (id:number) => {
            const inventory = this.characters.get(id)?.inventory.items || [];
            await Promise.all(inventory.map(item => DatabaseService.createItemInstance(item)));
          },
          update: async (id:number) => {
            const inventory = this.characters.get(id)?.inventory.items || [];
            await Promise.all(inventory.map(item => DatabaseService.updateItemInstance(item)));
          },
          delete: DatabaseService.deleteInventoryByCharacterId,
        },
        {
          name: "Activities",
          set: this.pendingActivities,
          getMap: this.activities,
          create: DatabaseService.createActivity,
          update: (id:number) => Promise.all(this.activities.get(id)!.map(activity => DatabaseService.updateActivity(activity))),
          delete: (id:number) => Promise.all(this.activities.get(id)!.map(activity => DatabaseService.deleteActivity(activity.id!))),
        },
        {
          name: "BattleLogs",
          set: this.pendingBattleLogs,
          getMap: this.battleLogs,
          create: DatabaseService.createBattleLog,
          update: (id:number) => Promise.all(this.battleLogs.get(id)!.map(battle => DatabaseService.updateBattleLog(battle))),
          delete: (id:number) => Promise.all(this.battleLogs.get(id)!.map(battle => DatabaseService.deleteBattleLog(battle.id!))),
        },
        {
          name: "Effects",
          set: this.pendingEffects,
          getMap: this.effects,
          create: DatabaseService.createEffect,
          update: DatabaseService.updateEffect,
          delete: DatabaseService.deleteEffect,
        },
        {
          name: "ItemDefinitions",
          set: this.pendingItemDefinitions,
          getMap: this.itemDefinitions,
          create: DatabaseService.createItemDefinition,
          update: DatabaseService.updateItemDefinition,
          delete: DatabaseService.deleteItemDefinition,
        },
        {
          name: "ItemEffects",
          set: this.pendingItemEffects,
          getMap: this.itemEffects,
          create: DatabaseService.addEffectToItem,
          update: (id:number) => Promise.all(this.itemEffects.get(id)!.map(effect => DatabaseService.addEffectToItem(effect))),
          delete: DatabaseService.removeAllEffectsFromItem,
        },
        {
          name: "Messages",
          set: this.pendingMessages,
          getMap: this.messages,
          create: DatabaseService.sendMessage,
          update: (id:number) => Promise.all(this.messages.get(id)!.map(message => {
            if (message.read) return DatabaseService.markMessageAsRead(message.id!);
          })),
          delete: DatabaseService.deleteMessage,
        },
      ];

      // 📌 2️⃣ Iterar sobre cada tipo de dato y procesar los cambios
      for (const { name, set, getMap, create, update, delete: del } of pendingUpdates) {
        if (set.size === 0) continue; // Si no hay cambios, pasamos a la siguiente categoría

        const batch = Array.from(set).splice(0, batchSize);
        console.log(`🔄 Procesando ${batch.length} cambios en ${name}...`);

        await Promise.all(
          batch.map(async (id) => {
            try {
              if (getMap.has(id)) {
                const entity = getMap.get(id);
                if(entity){
                  if ( entity.isNew) {
                    await create(entity); // Si es nuevo, crearlo en la BD
                  } else {
                    await update(entity); // Si ya existe, actualizarlo
                  }
                }

              } else {
                await del(id); // Si ya no está en la caché, eliminarlo
              }
            } catch (error) {
              console.error(`❌ Error al sincronizar ${name} con ID ${id}:`, error);
            }
          })
        );

        batch.forEach(id => set.delete(id)); // Limpiar los IDs procesados
      }

      console.log("✅ Sincronización completada.");
    } catch (error) {
      console.error("❌ Error en la sincronización con la base de datos:", error);
    }
  }

}

export default CacheDataService;
