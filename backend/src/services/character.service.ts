import CacheDataService from "./cache/CacheDataService";
import { Character } from "../models/character.model";
import { Message } from "../models/message.model";
import ServerConfig from "../constants/serverConfig";
import { ActivityType, EquipPositionType, ItemType } from "../constants/enums";
import { Activity } from "../models/activity.model";
import { ActivityReward } from "../models/activityReward.model";
import { Friendship } from "../models/friendship.model";
import { ItemDefinition } from "../models/itemDefinition.model";
import { ItemInstance } from "../models/itemInstance.model";

export class CharacterService {
  // GETTERS Y SETTERS
  static updateCharacter(character:Character): void { CacheDataService.updateCharacter(character); }
  static updateInventory(character:Character):void { CacheDataService.updateInventory(character.id, character.inventory.items); }
  static updateFriendship(character:Character):void { CacheDataService.updateInventory(character.id, character.inventory.items); }
  
  //Actividades
  static async startActivity(character:Character , activityType: ActivityType, duration: number): Promise<boolean> {
    //El cacheDataService se encarga de actualizar los datos de character en la cache (las actividades)
    const newActivity = new Activity({
      characterId: character.id,
      type: activityType,
      startTime: new Date(),
      duration: duration,
    });
    const newActivityId = await CacheDataService.createActivity(newActivity);
    if(newActivityId){ return true; }
    return false;
  }
  static async claimActivityReward(character:Character): Promise <boolean> {
    const rewards: ActivityReward = Activity.calculateActivityReward(character.activities[0].type, character.activities[0].duration);
    character.currentXp += rewards.xp ?? 0;
    character.currentGold += rewards.gold ?? 0;
    character.currentHealth = Math.min(character.totalHealth, character.currentHealth + (rewards.health ?? 0) - (rewards.costHealth ?? 0));
    character.currentStamina = Math.min(character.totalStamina, character.currentStamina + (rewards.stamina ?? 0) - (rewards.costStamina ?? 0));
    character.currentMana = Math.min(character.totalMana, character.currentMana + (rewards.mana ?? 0) - (rewards.costMana ?? 0));
    const result = await CacheDataService.deleteActivity(character.activities[0]);
    if(result){
      character.activities = [];
      return true;
    }else{
      return false;
    }
  }
  //Friends
  static getFriends(character:Character):{id:number,username:string}[]{
    const friendList : {id:number,username:string}[] = [];
    character.friendships.forEach(friendship=>{
      const friendId = friendship.idUser1==character.id? friendship.idUser2: friendship.idUser1;
      const friend = CacheDataService.getUserById(friendId);
      if(friend){
        friendList.push({id:friendId,username:friend.username});
      }
    });
    return friendList;
  }
  static async sendFriendRequest(character : Character, userId : number): Promise<boolean>{
    const result = await CacheDataService.createFriendship({
      id:0,
      idUser1:character.id,
      idUser2:userId,
      active:false,
    });
    return result;
  }
  static acceptFriendship(friendship:Friendship):void{
    friendship.active=true;
    CacheDataService.updateFriendship(friendship);
  }
  static async deleteFriendship(friendhip:Friendship):Promise<boolean>{
    const result = await CacheDataService.deleteFriendship(friendhip);
    return result;
  }
  //Shop
  static async buyItem(character:Character, item: ItemDefinition): Promise<void> {
    const existingItem = character.inventory.items.find(i => i.itemId === item.id);
    if (existingItem && item.itemType!=ItemType.EQUIPMENT) {
      existingItem.stock += 1;
    } else {
      const newItem = await CacheDataService.createItemInstance(new ItemInstance({
        characterId: character.id,
        itemId: item.id,
        equipped: false,
        stock: 1,
      }));
      character.inventory.items.push(newItem);
    }
    character.currentGold -= item.price;
    CacheDataService.updateCharacter(character);
    CacheDataService.updateInventory(character.id, character.inventory.items);
  }
  static async sellItem(character:Character, itemToSell: ItemInstance): Promise<void> {
    const itemDefinition = CacheDataService.getItemDefinitionById(itemToSell.itemId);
    if(!itemDefinition){throw new Error("sellItem: No se encontro la definicion del item")}
    if(itemToSell.stock>1){
      itemToSell.stock-=1;
      CacheDataService.updateItemInstance(itemToSell);
    }else{
      const deletedItem = await CacheDataService.deleteItemInstance(itemToSell);
      if(!deletedItem){throw new Error("sellItem: Error al eliminar el item")}
    }
    
    character.currentGold += itemDefinition.price/2;
  }
  

  //Equipo
  static equipItem(character : Character, item: ItemInstance,itemDefinition:ItemDefinition): boolean {
    // Buscar si hay un ítem ya equipado en la misma posición
    const equippedItemsOnPosition = character.inventory.items.filter(i => i.equipped && i.itemId !== item.itemId && i.itemId !== 0 &&
      CacheDataService.getItemDefinitionById(i.itemId)?.equipPositionType === itemDefinition.equipPositionType);
    let alternativePosition: EquipPositionType | null = null;
    switch (itemDefinition.equipPositionType) {
      case EquipPositionType.RING1:
        alternativePosition = EquipPositionType.RING2;
        break;
      case EquipPositionType.TRINKET1:
        alternativePosition = EquipPositionType.TRINKET2;
        break;
      case EquipPositionType.MAINHAND:
        alternativePosition = EquipPositionType.OFFHAND;
        break;
    }
    if(equippedItemsOnPosition){
      if (!alternativePosition) { 
        //Si no hay secundaria, desequipamos la principal si existe
        if (equippedItemsOnPosition[0]) { equippedItemsOnPosition[0].equipped = false; } 
      } else { //Si hay dos posiciones
        const alternativeEquipped = equippedItemsOnPosition.at(-1) || null;
        if (alternativeEquipped) { // comprobamos si la segunda esta ocupada y la desequipamos
          alternativeEquipped.equipped = false; 
        }else{ } // Si esta libre no es necesario hacer nada 
      }
    }
    // En ambos casos equipamos el nuevo item.
    item.equipped = true;
    CacheDataService.updateInventory(character.id, character.inventory.items);
    return true;
  }
  static unequipItem(character : Character, item: ItemInstance){
    item.equipped = false;
    CacheDataService.updateInventory(character.id, character.inventory.items);
  }



 

}