import ActivityService, { dbActivity } from "./activity.service";
import BattleLogService, { dbBattleLog } from "./battleLog.service";
import CharacterService from "./character.service";
import EffectService,{dbEffect} from "./effect.service";
import ItemDefinitionService, { dbItemDefinition } from "./itemDefinition.service"; 
import ItemInstanceService, { dbItemInstance } from "./itemInstance.service";
import ItemEffectService, { dbItemEffect } from "./itemEffect.service";
import MessageService,{dbMessage} from "./message.service";

import { Activity } from "../../models/activity.model";
import { BattleLog } from "../../models/battleLog.model";
import { Character } from "../../models/character.model";
import { Effect } from "../../models/effect.model"; 
import { ItemDefinition } from "../../models/itemDefinition.model";
import { ItemInstance } from "../../models/itemInstance.model";
import { Message } from "../../models/message.model";

class DatabaseService {
  constructor() {
    console.log("📦 DatabaseService inicializado");
  }

  // ✅ ACTIVITYS
  static async createActivity(activity: Partial<Activity>): Promise<number> {
    return ActivityService.createActivity({
      character_id: activity.characterId!,
      type: activity.type!,
      start_time: activity.startTime!.toISOString(),
      duration: activity.duration!,
      completed: activity.completed!,
    });
  }
  static async getActivityById(activityId: number): Promise<Activity | null> {
    const dbActivity = await ActivityService.getActivityById(activityId);
    return dbActivity ? this.mapDbActivity(dbActivity) : null;
  }
  static async getActivitiesByCharacterId(characterId: number): Promise<Activity[]> {
    const dbActivities = await ActivityService.getActivitiesByCharacterId(characterId);
    return dbActivities.map(this.mapDbActivity);
  }
  static async updateActivity(activityId: number, updatedActivity: Partial<Activity>): Promise<boolean> {
    return ActivityService.updateActivity(activityId, {
      type: updatedActivity.type!,
      start_time: updatedActivity.startTime!.toISOString(),
      duration: updatedActivity.duration!,
      completed: updatedActivity.completed!,
    });
  }
  static async deleteActivity(activityId: number): Promise<boolean> {
    return ActivityService.deleteActivity(activityId);
  }

  // ✅ BATTLE LOGS
  static async createBattleLog(battle: Partial<BattleLog>): Promise<number> {
    return BattleLogService.createBattle({
      attacker_id: battle.attackerId!,
      defender_id: battle.defenderId!,
      winner_id: battle.winnerId!,
      gold_won: battle.goldWon!,
      xp_won: battle.xpWon!,
      last_attack: battle.lastAttack!.toISOString(),
    });
  }
  static async getBattleLogById(battleId: number): Promise<BattleLog | null> {
    const dbBattle = await BattleLogService.getBattleById(battleId);
    return dbBattle ? this.mapDbBattleLog(dbBattle) : null;
  }
  static async getBattleLogsByCharacterId(characterId: number): Promise<BattleLog[]> {
    const dbBattles = await BattleLogService.getBattlesByCharacterId(characterId);
    return dbBattles.map(this.mapDbBattleLog);
  }
  static async updateBattleLog(battleId: number, updatedBattle: Partial<BattleLog>): Promise<boolean> {
    return BattleLogService.updateBattle(battleId, {
      attacker_id: updatedBattle.attackerId!,
      defender_id: updatedBattle.defenderId!,
      winner_id: updatedBattle.winnerId!,
      gold_won: updatedBattle.goldWon!,
      xp_won: updatedBattle.xpWon!,
      last_attack: updatedBattle.lastAttack!.toISOString(),
    });
  }
  static async deleteBattleLog(battleId: number): Promise<boolean> {
    return BattleLogService.deleteBattle(battleId);
  }

  // ✅ CHARACTERS
  static async createCharacter(character: Partial<Character>): Promise<number> {
    return CharacterService.createCharacter({
      userId: character.userId!,
      name: character.name!,
      faction: character.faction!,
      class: character.class!,
      level: character.level!,
      strength: character.strength!,
      endurance: character.endurance!,
      constitution: character.constitution!,
      precision: character.precision!,
      agility: character.agility!,
      vigor: character.vigor!,
      spirit: character.spirit!,
      willpower: character.willpower!,
      arcane: character.arcane!,
      currentHealth: character.currentHealth!,
      totalHealth: character.totalHealth!,
      currentStamina: character.currentStamina!,
      totalStamina: character.totalStamina!,
      currentMana: character.currentMana!,
      totalMana: character.totalMana!,
      currentXp: character.currentXp!,
      totalXp: character.totalXp!,
      currentGold: character.currentGold!,
      totalGold: character.totalGold!,
      upgradePoints: character.upgradePoints!,
      lastFight: character.lastFight || undefined
    });
  }
  static async getCharacterById(characterId: number): Promise<Character | null> {
    const dbCharacter = await CharacterService.getCharacterById(characterId);
    return dbCharacter ? this.mapDbCharacter(dbCharacter) : null;
  }
  static async getAllCharacters(): Promise<Character[]> {
    const dbCharacters = await CharacterService.getAllCharacters();
    return dbCharacters.map(this.mapDbCharacter);
  }
  static async updateCharacter(characterId: number, updatedCharacter: Partial<Character>): Promise<boolean> {
    return CharacterService.updateCharacter(characterId, {
      userId: updatedCharacter.userId!,
      name: updatedCharacter.name!,
      faction: updatedCharacter.faction!,
      class: updatedCharacter.class!,
      level: updatedCharacter.level!,
      strength: updatedCharacter.strength!,
      endurance: updatedCharacter.endurance!,
      constitution: updatedCharacter.constitution!,
      precision: updatedCharacter.precision!,
      agility: updatedCharacter.agility!,
      vigor: updatedCharacter.vigor!,
      spirit: updatedCharacter.spirit!,
      willpower: updatedCharacter.willpower!,
      arcane: updatedCharacter.arcane!,
      currentHealth: updatedCharacter.currentHealth!,
      totalHealth: updatedCharacter.totalHealth!,
      currentStamina: updatedCharacter.currentStamina!,
      totalStamina: updatedCharacter.totalStamina!,
      currentMana: updatedCharacter.currentMana!,
      totalMana: updatedCharacter.totalMana!,
      currentXp: updatedCharacter.currentXp!,
      totalXp: updatedCharacter.totalXp!,
      currentGold: updatedCharacter.currentGold!,
      totalGold: updatedCharacter.totalGold!,
      upgradePoints: updatedCharacter.upgradePoints!,
      lastFight: updatedCharacter.lastFight || undefined
    });
  }
  static async deleteCharacter(characterId: number): Promise<boolean> {
    return CharacterService.deleteCharacter(characterId);
  }

  // ✅ EFFECTS
  static async createEffect(effect: Partial<Effect>): Promise<number> {
    return EffectService.createEffect({
      name: effect.name!,
    });
  }
  static async getEffectById(effectId: number): Promise<Effect | null> {
    const dbEffect = await EffectService.getEffectById(effectId);
    return dbEffect ? this.mapDbEffect(dbEffect) : null;
  }
  static async getAllEffects(): Promise<Effect[]> {
    const dbEffects = await EffectService.getAllEffects();
    return dbEffects.map(this.mapDbEffect);
  }
  static async updateEffect(effectId: number, updatedEffect: Partial<Effect>): Promise<boolean> {
    return EffectService.updateEffect(effectId, {
      name: updatedEffect.name!,
    });
  }
  static async deleteEffect(effectId: number): Promise<boolean> {
    return EffectService.deleteEffect(effectId);
  }

  // ✅ ITEM DEFINITIONS
  static async createItemDefinition(item: Partial<ItemDefinition>): Promise<number> {
    return ItemDefinitionService.createItem({
      name: item.name!,
      itemType: item.itemType!,
      equipType: item.equipType || null,
      equipPositionType: item.equipPositionType || null,
      levelRequired: item.levelRequired!,
      price: item.price!,
    });
  }
  static async getItemDefinitionById(itemId: number): Promise<ItemDefinition | null> {
    const dbItem = await ItemDefinitionService.getItemById(itemId);
    return dbItem ? this.mapDbItemDefinition(dbItem) : null;
  }
  static async getAllItemDefinitions(): Promise<ItemDefinition[]> {
    const dbItems = await ItemDefinitionService.getAllItems();
    return dbItems.map(this.mapDbItemDefinition);
  }
  static async updateItemDefinition(itemId: number, updatedItem: Partial<ItemDefinition>): Promise<boolean> {
    return ItemDefinitionService.updateItem(itemId, {
      name: updatedItem.name!,
      itemType: updatedItem.itemType!,
      equipType: updatedItem.equipType || null,
      equipPositionType: updatedItem.equipPositionType || null,
      levelRequired: updatedItem.levelRequired!,
      price: updatedItem.price!,
    });
  }
  static async deleteItemDefinition(itemId: number): Promise<boolean> {
    return ItemDefinitionService.deleteItem(itemId);
  }

  // ✅ ITEM INSTANCES
  static async createItemInstance(instance: Partial<ItemInstance>): Promise<number> {
    return ItemInstanceService.createItemInstance({
      character_id: instance.character_id!,
      item_id: instance.item_id!,
      stock: instance.stock!,
      equipped: instance.equipped!,
    });
  }
  static async getItemInstanceById(instanceId: number): Promise<ItemInstance | null> {
    const dbInstance = await ItemInstanceService.getItemInstanceById(instanceId);
    return dbInstance ? this.mapDbItemInstance(dbInstance) : null;
  }
  static async getInventoryByCharacterId(characterId: number): Promise<ItemInstance[]> {
    const dbInstances = await ItemInstanceService.getInventoryByCharacterId(characterId);
    return dbInstances.map(this.mapDbItemInstance);
  }
  static async updateItemInstance(instanceId: number, updatedInstance: Partial<ItemInstance>): Promise<boolean> {
    return ItemInstanceService.updateItemInstance(instanceId, {
      character_id: updatedInstance.character_id!,
      item_id: updatedInstance.item_id!,
      stock: updatedInstance.stock!,
      equipped: updatedInstance.equipped!,
    });
  }
  static async deleteItemInstance(instanceId: number): Promise<boolean> {
    return ItemInstanceService.deleteItemInstance(instanceId);
  }
  static async updateInventory(characterId: number, updatedItems: ItemInstance[]): Promise<boolean> {
    return ItemInstanceService.updateInventory(characterId,updatedItems);
  }
  static async deleteInventoryByCharacterId(characterId: number): Promise<boolean> {
    return ItemInstanceService.deleteInventoryByCharacterId(characterId);
  }

  // ✅ ITEM EFFECTS
  static async addEffectToItem(itemEffect: dbItemEffect): Promise<boolean> {
    return ItemEffectService.addEffectToItem({
      item_id: itemEffect.item_id,
      effect_id: itemEffect.effect_id,
      value: itemEffect.value,
    });
  }
  static async getEffectsByItemId(itemId: number): Promise<dbItemEffect[]> {
    return ItemEffectService.getEffectsByItemId(itemId);
  }
  static async removeEffectFromItem(itemId: number, effectId: number): Promise<boolean> {
    return ItemEffectService.removeEffectFromItem(itemId, effectId);
  }
  static async removeAllEffectsFromItem(itemId: number): Promise<boolean> {
    return ItemEffectService.removeAllEffectsFromItem(itemId);
  }

  // ✅ MESSAGES
  static async getAllMessages(): Promise<Message[]> {
    const dbMessages = await MessageService.getAllMessages();
    if(dbMessages){
      return dbMessages.map(this.mapDbMessage);
    }
    return [];
  }
  static async sendMessage(message: Partial<Message>): Promise<number> {
    return MessageService.sendMessage({
      sender_id: message.sender_id!,
      sender_name: message.sender_name!,
      receiver_id: message.receiver_id!,
      receiver_name: message.receiver_name!,
      subject: message.subject!,
      body: message.body!,
      timestamp: message.timestamp!.toISOString(),
      read: message.read!,
    });
  }
  static async getMessageById(messageId: number): Promise<Message | null> {
    const dbMessage = await MessageService.getMessageById(messageId);
    return dbMessage ? this.mapDbMessage(dbMessage) : null;
  }
  static async getMessagesByUserId(userId: number): Promise<Message[]> {
    const dbMessages = await MessageService.getMessagesByUserId(userId);
    return dbMessages.map(this.mapDbMessage);
  }
  static async markMessageAsRead(messageId: number): Promise<boolean> {
    return MessageService.markMessageAsRead(messageId);
  }
  static async deleteMessage(messageId: number): Promise<boolean> {
    return MessageService.deleteMessage(messageId);
  }

  // ✅ MAPPERS
  private static mapDbActivity(dbActivity: dbActivity): Activity {
    return new Activity({
      id: dbActivity.id,
      characterId: dbActivity.character_id,
      type: dbActivity.type,
      startTime: new Date(dbActivity.start_time),
      duration: dbActivity.duration,
      completed: dbActivity.completed,
    });
  }
  private static mapDbBattleLog(dbBattle: dbBattleLog): BattleLog {
    return new BattleLog({
      id: dbBattle.id!,
      attackerId: dbBattle.attacker_id,
      defenderId: dbBattle.defender_id,
      winnerId: dbBattle.winner_id,
      goldWon: dbBattle.gold_won,
      xpWon: dbBattle.xp_won,
      lastAttack: new Date(dbBattle.last_attack),
    });
  }
  private static mapDbCharacter(dbCharacter: Character): Character {
    return new Character({
      id: dbCharacter.id,
      userId: dbCharacter.userId,
      name: dbCharacter.name,
      faction: dbCharacter.faction,
      class: dbCharacter.class,
      level: dbCharacter.level,
      strength: dbCharacter.strength,
      endurance: dbCharacter.endurance,
      constitution: dbCharacter.constitution,
      precision: dbCharacter.precision,
      agility: dbCharacter.agility,
      vigor: dbCharacter.vigor,
      spirit: dbCharacter.spirit,
      willpower: dbCharacter.willpower,
      arcane: dbCharacter.arcane,
      currentHealth: dbCharacter.currentHealth,
      totalHealth: dbCharacter.totalHealth,
      currentStamina: dbCharacter.currentStamina,
      totalStamina: dbCharacter.totalStamina,
      currentMana: dbCharacter.currentMana,
      totalMana: dbCharacter.totalMana,
      currentXp: dbCharacter.currentXp,
      totalXp: dbCharacter.totalXp,
      currentGold: dbCharacter.currentGold,
      totalGold: dbCharacter.totalGold,
      upgradePoints: dbCharacter.upgradePoints,
      lastFight: dbCharacter.lastFight ? new Date(dbCharacter.lastFight) : undefined
    });
  }
  private static mapDbEffect(dbEffect: dbEffect): Effect {
    return new Effect({
      id: dbEffect.id!,
      name: dbEffect.name,
    });
  } 
  private static mapDbItemDefinition(dbItem: dbItemDefinition): ItemDefinition {
    return new ItemDefinition({
      id: dbItem.id!,
      name: dbItem.name,
      itemType: dbItem.itemType,
      equipType: dbItem.equipType ?? undefined,
      equipPositionType: dbItem.equipPositionType ?? undefined,
      levelRequired: dbItem.levelRequired,
      price: dbItem.price,
      effects: {}, // Se inicializa vacío, ya que los efectos provienen de otra tabla
    });
  }
  private static mapDbItemInstance(dbInstance: dbItemInstance): ItemInstance {
    return new ItemInstance({
      id: dbInstance.id!,
      character_id: dbInstance.character_id,
      item_id: dbInstance.item_id,
      stock: dbInstance.stock,
      equipped: dbInstance.equipped,
    });
  }
  private static mapDbMessage(dbMessage: dbMessage): Message {
    return new Message({
      id: dbMessage.id!,
      sender_id: dbMessage.sender_id,
      sender_name: dbMessage.sender_name,
      receiver_id: dbMessage.receiver_id,
      receiver_name: dbMessage.receiver_name,
      subject: dbMessage.subject,
      body: dbMessage.body,
      timestamp: new Date(dbMessage.timestamp),
      read: dbMessage.read,
    });
  }
}

export default DatabaseService;
