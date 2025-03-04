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
import { EquipPositionType, EquipType, ItemType, WeaponType } from "../../constants/enums";
import { equal } from "assert";

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
  static async isCharacterNameAvailable(characterName:string):Promise<boolean>{
    return await CharacterService.isCharacterNameAvailable(characterName);
  }
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
      environment : character.environment,
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
      environment : updatedCharacter.environment,
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
      sender_id: message.senderId,
      sender_name: message.senderName,
      receiver_id: message.receiverId,
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
      id: dbCharacter.id,
      userId: dbCharacter.user_id,
      name: dbCharacter.name,
      faction: dbCharacter.faction,
      class: dbCharacter.class,
      level: dbCharacter.level,
  
      strength: dbCharacter.strength ?? 1,
      endurance: dbCharacter.endurance ?? 1,
      constitution: dbCharacter.constitution ?? 1,
      precision: dbCharacter.precision ?? 1,
      agility: dbCharacter.agility ?? 1,
      vigor: dbCharacter.vigor ?? 1,
      spirit: dbCharacter.spirit ?? 1,
      willpower: dbCharacter.willpower ?? 1,
      arcane: dbCharacter.arcane ?? 1,
  
      currentHealth: dbCharacter.current_health ?? 100,
      totalHealth: dbCharacter.total_health ?? 100,
      currentStamina: dbCharacter.current_stamina ?? 100,
      totalStamina: dbCharacter.total_stamina ?? 100,
      currentMana: dbCharacter.current_mana ?? 100,
      totalMana: dbCharacter.total_mana ?? 100,
  
      currentXp: dbCharacter.current_xp ?? 0,
      totalXp: dbCharacter.total_xp ?? 0,
      currentGold: dbCharacter.current_gold ?? 0,
      totalGold: dbCharacter.total_gold ?? 0,
      upgradePoints: dbCharacter.upgrade_points ?? 0,
  
      goldChest: dbCharacter.gold_chest,
      warehouse : dbCharacter.warehouse,
      enviroment : dbCharacter.enviroment,
      traps : dbCharacter.traps,
      
      lastFight: dbCharacter.last_fight ? new Date(dbCharacter.last_fight) : undefined
    });
  }
  private static mapDbFriendship(dbFriendship: dbFriendship): Friendship {
    return new Friendship({
      id : dbFriendship.id,
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
    let iconUrl = "";
    
    if(dbItem.itemType===ItemType.EQUIPMENT){
      if(dbItem.equipType && dbItem.equipType===EquipType.WEAPON){ 
        iconUrl+="weapon/";
        switch(dbItem.weaponType){

          case WeaponType.GLOVE:iconUrl+="fist";break;
          case WeaponType.CLAW:iconUrl+="fist";break;
          case WeaponType.TOOL:iconUrl+="fist";break;

          case WeaponType.DIRK:iconUrl+="dagger";break;
          case WeaponType.DAGGER:iconUrl+="dagger";break;
          case WeaponType.QAMA:iconUrl+="dagger";break;

          case WeaponType.GLADIUS:iconUrl+="sword";break;
          case WeaponType.SABER:iconUrl+="sword";break;
          case WeaponType.GREATSWORD:iconUrl+="sword";break;

          case WeaponType.HATCHET:iconUrl+="axe";break;
          case WeaponType.AXE:iconUrl+="axe";break;
          case WeaponType.BERDICHE:iconUrl+="axe";break;

          case WeaponType.HAMMER:iconUrl+="mace";break;
          case WeaponType.MACE:iconUrl+="mace";break;
          case WeaponType.SLEDGEHAMMER:iconUrl+="mace";break;

          case WeaponType.PILUM:iconUrl+="lance";break;
          case WeaponType.LANCE:iconUrl+="lance";break;
          case WeaponType.PIKE:iconUrl+="lance";break;

          case WeaponType.DART:iconUrl+="throwing";break;
          case WeaponType.VENABLO:iconUrl+="throwing";break;
          case WeaponType.HARPOON:iconUrl+="throwing";break;

          case WeaponType.SHORT_BOW:iconUrl+="bow";break;
          case WeaponType.BOW:iconUrl+="bow";break;
          case WeaponType.LONGBOW:iconUrl+="bow";break;

          case WeaponType.REPEATER:iconUrl+="crossbow";break;
          case WeaponType.CROSSBOW:iconUrl+="crossbow";break;
          case WeaponType.ARBALEST:iconUrl+="crossbow";break;

          case WeaponType.PISTOL:iconUrl+="gunpowder";break;
          case WeaponType.MUSKET:iconUrl+="gunpowder";break;
          case WeaponType.BOMBARD:iconUrl+="gunpowder";break;
          
          case WeaponType.RING:iconUrl+="relic";break;
          case WeaponType.TALISMAN:iconUrl+="relic";break;
          case WeaponType.SCEPTER:iconUrl+="relic";break;

          case WeaponType.WAND:iconUrl+="focus";break;
          case WeaponType.STAFF:iconUrl+="focus";break;
          case WeaponType.CROSIER:iconUrl+="focus";break;

          case WeaponType.SEAL:iconUrl+="grimoire";break;
          case WeaponType.SCROLL:iconUrl+="grimoire";break;
          case WeaponType.GRIMOIRE:iconUrl+="grimoire";break;
          
          default :iconUrl+="hand1";
        }
      }
      if(dbItem.equipType && dbItem.equipType===EquipType.ARMOR){ 
        iconUrl+="armor/"
        switch(dbItem.equipPositionType){
          case EquipPositionType.HEAD:iconUrl+="head";break;
          case EquipPositionType.CHEST:iconUrl+="chest";break;
          case EquipPositionType.SHOULDER:iconUrl+="shoulders";break;
          case EquipPositionType.WRIST:iconUrl+="wrist";break;
          case EquipPositionType.LEGS:iconUrl+="legs";break;
          default :iconUrl+="hand1";
        }
      }
      if(dbItem.equipType && dbItem.equipType===EquipType.ACCESSORY){ 
        iconUrl+="accesory/"
        switch(dbItem.equipPositionType){
          case EquipPositionType.HANDS:iconUrl+="hands";break;
          case EquipPositionType.WAIST:iconUrl+="waist";break;
          case EquipPositionType.FEET:iconUrl+="feets";break;
          case EquipPositionType.BACK:iconUrl+="back";break
          case EquipPositionType.TRINKET1:iconUrl+="trinket";break;
          case EquipPositionType.TRINKET2:iconUrl+="trinket";break;
          default :iconUrl+="hand1";
        }
      }
      if(dbItem.equipType && dbItem.equipType===EquipType.JEWEL){ 
        iconUrl+="jewel/"
        switch(dbItem.equipPositionType){
          case EquipPositionType.NECKLACE:iconUrl+="necklace";break;
          case EquipPositionType.RING1:iconUrl+="ring";break;
          case EquipPositionType.RING2:iconUrl+="ring";break;
          default :iconUrl+="hand1";
        }
      }
    }
    if(dbItem.itemType===ItemType.CONSUMABLE){ iconUrl += "consumable/";}
    if(dbItem.itemType===ItemType.TRADEGOODS){ iconUrl += "tradegoods/";}

    iconUrl+=".png"
    return new ItemDefinition({
      id: dbItem.id!,
      name: dbItem.name,
      itemType: dbItem.itemType,
      equipType: dbItem.equipType ?? undefined,
      equipPositionType: dbItem.equipPositionType ?? undefined,
      equipWeaponType: dbItem.weaponType ?? undefined,
      levelRequired: dbItem.levelRequired,
      price: dbItem.price,
      effects: [],
      imageUrl : iconUrl,
    });
  }
  private static mapDbItemInstance(dbInstance: dbItemInstance): ItemInstance {
    return new ItemInstance({
      id: dbInstance.id!,
      characterId: dbInstance.character_id,
      itemId: dbInstance.item_id,
      stock: dbInstance.stock,
      equipped: Boolean(dbInstance.equipped),
    });
  }
  
  private static mapDbMessage(dbMessage: dbMessage): Message {
    return new Message({
      id: dbMessage.id!,
      senderId: dbMessage.sender_id,
      senderName: dbMessage.sender_name,
      receiverId: dbMessage.receiver_id,
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
