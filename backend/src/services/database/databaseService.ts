import ActivityService, { dbActivity } from "./activity.service";
import CharacterService, { dbCharacter } from "./character.service";
import FriendshipService, { dbFriendship } from "./friendhip.service";
import EffectService,{dbEffect} from "./effect.service";
import ItemDefinitionService, { dbItemDefinition } from "./itemDefinition.service"; 
import ItemInstanceService, { dbItemInstance } from "./itemInstance.service";
import ItemEffectService, { dbItemEffect } from "./itemEffect.service";
import MessageService,{dbMessage} from "./message.service";
import UserService, {dbUser} from "./user.services";

import { Activity } from "../../models/activity.model";
import { Character } from "../../models/character.model";
import { ItemEffect } from "../../models/itemEffect.model"; 
import { Effect } from "../../models/effect.model"; 
import { ItemDefinition } from "../../models/itemDefinition.model";
import { ItemInstance } from "../../models/itemInstance.model";
import { Message } from "../../models/message.model";
import { User } from "../../models/user.model";
import { Friendship } from "../../models/friendship.model";
import { Inventory } from "../../models/inventory.model";

class DatabaseService {
  constructor() {
    console.log("📦 DatabaseService inicializado");
  }

  // ACTIVITYS ✅ 
  static async createActivity(activity: Activity): Promise<number> {
    return ActivityService.createActivity({
      id:0,
      character_id: activity.characterId!,
      type: activity.type!,
      start_time: activity.startTime!.toISOString(),
      duration: activity.duration!,
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
  static async getAllActivities(): Promise<Activity[]> {
    const dbActivities = await ActivityService.getAllActivities();
    return dbActivities.map(this.mapDbActivity);
  }
  static async updateActivity(updatedActivity: Activity): Promise<boolean> {
    return ActivityService.updateActivity({
      id : updatedActivity.id,
      character_id: updatedActivity.characterId,
      type : updatedActivity.type,
      start_time : updatedActivity.startTime.toISOString(),
      duration : updatedActivity.duration,
    }); 
  }
  static async deleteActivity(activityId: number): Promise<boolean> {
    return ActivityService.deleteActivity(activityId);
  }
  // ✅ CHARACTERS
  static async createCharacter(character: Character): Promise<number> {
    return CharacterService.createCharacter({
      id : character.id,
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
      goldChest: character.goldChest,
      warehouse : character.warehouse,
      enviroment : character.enviroment,
      traps : character.traps,
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
  static async updateCharacter(updatedCharacter: Character): Promise<boolean> {
    return CharacterService.updateCharacter({
      userId: updatedCharacter.userId!,
      id : updatedCharacter.id!,
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
      goldChest: updatedCharacter.goldChest,
      warehouse : updatedCharacter.warehouse,
      enviroment : updatedCharacter.enviroment,
      traps : updatedCharacter.traps,
      upgradePoints: updatedCharacter.upgradePoints!,
      lastFight: updatedCharacter.lastFight || undefined
    });
  }
  static async deleteCharacter(characterId: number): Promise<boolean> {
    return CharacterService.deleteCharacter(characterId);
  }

  // EFFECTS ✅ 
  static async createEffect(effect: Effect): Promise<number> {
    return EffectService.createEffect({
      id:0,
      name: effect.name,
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
  static async updateEffect(updatedEffect: Effect): Promise<boolean> {
    return EffectService.updateEffect({
      name: updatedEffect.name,
      id:updatedEffect.id
    });
  }
  static async deleteEffect(effectId: number): Promise<boolean> {
    return EffectService.deleteEffect(effectId);
  }

  // FRIENDSHIP ✅ 
  static async createFriendship(friendship: Friendship): Promise<number> {
    return FriendshipService.createFriendship({
      id:0,
      user_id_1: friendship.idUser1,
      user_id_2: friendship.idUser2,
      active: friendship.active
    });
  }
  static async getUserFriendships(userId: number): Promise<Friendship[]> {
    const dbFriendships = await FriendshipService.getUserFriendships(userId);
    return dbFriendships.map(this.mapDbFriendship);
  }
  static async getUserFriendsRequest(userId: number): Promise<Friendship[]> {
    const dbFriendships = await FriendshipService.getUserFriendsRequest(userId);
    return dbFriendships.map(this.mapDbFriendship);
  }
  static async getAllFriendships(): Promise<Friendship[]> {
    const dbFriendships = await FriendshipService.getAllFriendships();
    return dbFriendships.map(this.mapDbFriendship);
  }
  static async updateFriendship(updatedFriendship: Friendship): Promise<boolean> {
    return FriendshipService.updateFriendship({
      id: updatedFriendship.id,
      user_id_1 : updatedFriendship.idUser1,
      user_id_2: updatedFriendship.idUser2,
      active : updatedFriendship.active,
    }); 
  }
  static async deleteFriendship(updatedFriendship: Friendship): Promise<boolean> {
    return FriendshipService.deleteFriendship({
      id:updatedFriendship.id,
      user_id_1:updatedFriendship.idUser1,
      user_id_2:updatedFriendship.idUser2,
      active:updatedFriendship.active
    });
  }

  // ITEM DEFINITIONS ✅
  static async createItemDefinition(item: ItemDefinition): Promise<number> {
    return ItemDefinitionService.createItem({
      id:0,
      name: item.name,
      itemType: item.itemType,
      equipType: item.equipType || null,
      equipPositionType: item.equipPositionType || null,
      weaponType: item.equipWeaponType || null,
      levelRequired: item.levelRequired,
      price: item.price,
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
  static async updateItemDefinition(updatedItem: ItemDefinition): Promise<boolean> {
    return ItemDefinitionService.updateItem({
      name: updatedItem.name!,
      id:updatedItem.id,
      itemType: updatedItem.itemType!,
      equipType: updatedItem.equipType || null,
      equipPositionType: updatedItem.equipPositionType || null,
      weaponType: updatedItem.equipWeaponType || null,
      levelRequired: updatedItem.levelRequired!,
      price: updatedItem.price!,
    });
  }
  static async deleteItemDefinition(itemId: number): Promise<boolean> {
    return ItemDefinitionService.deleteItem(itemId);
  }

  // ITEM EFFECTS ✅

  static async addEffectToItem(itemEffect: ItemEffect): Promise<boolean> {
    return ItemEffectService.addEffectToItem({
      item_id: itemEffect.effectId,
      effect_id: itemEffect.effectId,
      value: itemEffect.value,
    });
  }
  static async getEffectsByItemId(itemId: number): Promise<ItemEffect[]> {
    const dbItemEffects = await ItemEffectService.getEffectsByItemId(itemId);
    return dbItemEffects.map(dbitemEffect => this.mapDbItemEffect(dbitemEffect));
  }
  static async getAllEffectsItem(): Promise<ItemEffect[]> {
    const dbItemEffects = await ItemEffectService.getAllEffectsItem();
    return dbItemEffects.map(this.mapDbItemEffect);
  }
  static async removeEffectFromItem(itemEffect:ItemEffect): Promise<boolean> {
    return ItemEffectService.removeEffectFromItem(itemEffect.itemId, itemEffect.effectId);
  }
  static async removeAllEffectsFromItem(itemId: number): Promise<boolean> {
    return ItemEffectService.removeAllEffectsFromItem(itemId);
  }

  // ITEM INSTANCES ✅
  static async createItemInstance(instance: ItemInstance): Promise<number> {
    return ItemInstanceService.createItemInstance({
      id:0,
      character_id: instance.characterId,
      item_id: instance.itemId,
      stock: instance.stock,
      equipped: instance.equipped,
    });
  }
  static async getAllItemInstances(): Promise<ItemInstance[]> {
    const dbItems = await ItemInstanceService.getAllItems()
    return dbItems.map(this.mapDbItemInstance);
  }
  static async getItemInstanceById(instanceId: number): Promise<ItemInstance | null> {
    const dbInstance = await ItemInstanceService.getItemInstanceById(instanceId);
    return dbInstance ? this.mapDbItemInstance(dbInstance) : null;
  }
  static async getInventoryByCharacterId(characterId: number): Promise<ItemInstance[]> {
    const dbInstances = await ItemInstanceService.getInventoryByCharacterId(characterId);
    return dbInstances.map(this.mapDbItemInstance);
  }
  static async updateItemInstance(updatedInstance: ItemInstance): Promise<boolean> {
    return ItemInstanceService.updateItemInstance({
      id:updatedInstance.id,
      character_id: updatedInstance.characterId,
      item_id: updatedInstance.itemId,
      stock: updatedInstance.stock,
      equipped: updatedInstance.equipped,
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

  // MESSAGES ✅ 
  static async getAllMessages(): Promise<Message[]> {
    const dbMessages = await MessageService.getAllMessages();
    if(dbMessages){
      return dbMessages.map(this.mapDbMessage);
    }
    return [];
  }
  static async createMessage(message: Message): Promise<number|null> {
    const lastId = await MessageService.createMessage({
      id: message.id,
      sender_id: message.characterSenderId,
      sender_name: message.senderName,
      receiver_id: message.characterReciverId,
      receiver_name: message.receiverName,
      subject: message.subject,
      body: message.body,
      timestamp: message.timestamp.toISOString(),
      read: message.read,
    })|| null;
    return lastId;
  }
  static async getMessageById(messageId: number): Promise<Message | null> {
    const dbMessage = await MessageService.getMessageById(messageId);
    return dbMessage ? this.mapDbMessage(dbMessage) : null;
  }
  static async getMessagesByCharacterId(characterId: number): Promise<Message[]> {
    const dbMessages = await MessageService.getMessagesByUserId(characterId);
    return dbMessages.map(this.mapDbMessage);
  }
  static async markMessageAsRead(messageId: number): Promise<boolean> {
    return MessageService.markMessageAsRead(messageId);
  }
  static async deleteMessage(messageId: number): Promise<boolean> {
    return MessageService.deleteMessage(messageId);
  }

  // USERS ✅ 
  static async createUser(user: User): Promise<number> {
    return UserService.createUser({
      id:0,
      username:user.username,
      password:user.password,
      last_online:user.last_online.toISOString()
    });
  }
  static async getUserById(userId: number): Promise<User | null> {
    const dbUser = await UserService.getUserById(userId);
    return dbUser ? this.mapDbUser(dbUser) : null;
  }
  static async getAllUsers(): Promise<User[]> {
    const dbUsers = await UserService.getAllUsers();
    return dbUsers.map(this.mapDbUser);
  }
  static async updateUser(updatedUser: User): Promise<boolean> {
    return UserService.updateUser({
      id:updatedUser.id,
      username:updatedUser.username,
      password:updatedUser.password,
      last_online:updatedUser.last_online.toISOString(),
    }); 
  }
  static async deleteUser(userId: number): Promise<boolean> {
    return UserService.deleteUser(userId);
  }

  // MAPPERS ✅ 
  private static mapDbActivity(dbActivity: dbActivity): Activity {
    return new Activity({
      id: dbActivity.id,
      characterId: dbActivity.character_id,
      type: dbActivity.type,
      startTime: new Date(dbActivity.start_time),
      duration: dbActivity.duration,
    });
  }
  private static mapDbCharacter(dbCharacter: dbCharacter): Character {
    return new Character({
      _id: dbCharacter.id,
      _userId: dbCharacter.user_id,
      _name: dbCharacter.name,
      _faction: dbCharacter.faction,
      _class: dbCharacter.class,
      _level: dbCharacter.level,
  
      _strength: dbCharacter.strength ?? 1,
      _endurance: dbCharacter.endurance ?? 1,
      _constitution: dbCharacter.constitution ?? 1,
      _precision: dbCharacter.precision ?? 1,
      _agility: dbCharacter.agility ?? 1,
      _vigor: dbCharacter.vigor ?? 1,
      _spirit: dbCharacter.spirit ?? 1,
      _willpower: dbCharacter.willpower ?? 1,
      _arcane: dbCharacter.arcane ?? 1,
  
      _currentHealth: dbCharacter.current_health ?? 100,
      _totalHealth: dbCharacter.total_health ?? 100,
      _currentStamina: dbCharacter.current_stamina ?? 100,
      _totalStamina: dbCharacter.total_stamina ?? 100,
      _currentMana: dbCharacter.current_mana ?? 100,
      _totalMana: dbCharacter.total_mana ?? 100,
  
      _currentXp: dbCharacter.current_xp ?? 0,
      _totalXp: dbCharacter.total_xp ?? 0,
      _currentGold: dbCharacter.current_gold ?? 0,
      _totalGold: dbCharacter.total_gold ?? 0,
      _upgradePoints: dbCharacter.upgrade_points ?? 0,
  
      _goldChest: dbCharacter.gold_chest,
      _warehouse : dbCharacter.warehouse,
      _enviroment : dbCharacter.enviroment,
      _traps : dbCharacter.traps,
      
      _lastFight: dbCharacter.last_fight ? new Date(dbCharacter.last_fight) : undefined
    });
  }
  private static mapDbFriendship(dbFriendship: dbFriendship): Friendship {
    return new Friendship({
      idUser1: dbFriendship.user_id_1,
      idUser2: dbFriendship.user_id_2,
      active: dbFriendship.active,
    });
  }
  private static mapDbEffect(dbEffect: dbEffect): Effect {
    return new Effect({
      id: dbEffect.id!,
      name: dbEffect.name,
    });
  } 
  private static mapDbItemEffect(dbItemEffect: dbItemEffect): ItemEffect {
    return new ItemEffect({
      effectId: dbItemEffect.effect_id!,
      itemId: dbItemEffect.item_id,
      value: dbItemEffect.value,
    });
  } 
  private static mapDbItemDefinition(dbItem: dbItemDefinition): ItemDefinition {
    return new ItemDefinition({
      id: dbItem.id!,
      name: dbItem.name,
      itemType: dbItem.itemType,
      equipType: dbItem.equipType ?? undefined,
      equipPositionType: dbItem.equipPositionType ?? undefined,
      equipWeaponType: dbItem.weaponType ?? undefined,
      levelRequired: dbItem.levelRequired,
      price: dbItem.price,
      effects: [], // Se inicializa vacío, ya que los efectos provienen de otra tabla
    });
  }
  private static mapDbItemInstance(dbInstance: dbItemInstance): ItemInstance {
    return new ItemInstance({
      id: dbInstance.id!,
      characterId: dbInstance.character_id,
      itemId: dbInstance.item_id,
      stock: dbInstance.stock,
      equipped: dbInstance.equipped,
    });
  }
  private static mapDbMessage(dbMessage: dbMessage): Message {
    return new Message({
      id: dbMessage.id!,
      characterSenderId: dbMessage.sender_id,
      senderName: dbMessage.sender_name,
      characterReciverId: dbMessage.receiver_id,
      receiverName: dbMessage.receiver_name,
      subject: dbMessage.subject,
      body: dbMessage.body,
      timestamp: new Date(dbMessage.timestamp),
      read: dbMessage.read,
    });
  }
  private static mapDbUser(dbUser: dbUser): User {
    return new User({
      id: dbUser.id,
      username:dbUser.username,
      password:dbUser.password,
      last_online:new Date(dbUser.last_online),
    });
  } 
}

export default DatabaseService;
