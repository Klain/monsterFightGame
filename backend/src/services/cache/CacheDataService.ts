import DatabaseService from "../database/databaseService";
import { Character } from "../../models/character.model";
import { ItemDefinition } from "../../models/itemDefinition.model";
import { Activity } from "../../models/activity.model";
import { ItemEffect } from "../../models/itemEffect.model";
import { Effect } from "../../models/effect.model";
import { ItemInstance } from "../../models/itemInstance.model";
import { Message } from "../../models/message.model";
import { Inventory } from "../../models/inventory.model";
import { User } from "../../models/user.model";
import { Friendship } from "../../models/friendship.model";

class CacheDataService {

  static cacheActivities: Map<number, Activity> = new Map();
  static cacheCharacters: Map<number, Character> = new Map();
  static cacheUserCharacter : Map<number, number> = new Map();
  static cacheFriendships: Map<number, Friendship> = new Map();
  static cacheEffects: Map<number, Effect> = new Map();
  static cacheItemDefinitions: Map<number, ItemDefinition> = new Map();
  static cacheInventories: Map<number, ItemInstance[]> = new Map();
  static cacheItemEffects: Map<number, ItemEffect[]> = new Map();
  static cacheMessages: Map<number, Message> = new Map();
  static cacheUsers: Map<number, User> = new Map();

  static pendingActivities: Set<number> = new Set();
  static pendingCharacters: Set<number> = new Set();
  static pendingEffects: Set<number> = new Set();
  static pendingFriendships: Set<number> = new Set();
  static pendingItemDefinitions: Set<number> = new Set();
  static pendingInventories: Set<number> = new Set();
  static pendingItemEffects: Set<number> = new Set();
  static pendingMessages: Set<number> = new Set();
  static pendingUsers: Set<number> = new Set();

  static async initializeCache(): Promise<void> {
    try {
      console.log("🔄 Cargando caché...");
      const [
        dbItemsDefinitions,
        dbUsers,
        dbCharacters,
        dbMessages
      ] = await Promise.all([
        DatabaseService.getAllItemDefinitions(),
        DatabaseService.getAllUsers(),
        DatabaseService.getAllCharacters(),
        DatabaseService.getAllMessages(),
      ]);

      if (!dbItemsDefinitions || !dbUsers || !dbCharacters || !dbMessages) {
        throw new Error("🚨 Error crítico: Datos incompletos en la carga inicial de la caché.");
      }
      console.log(`📦 Se encontraron ${dbItemsDefinitions.length} ítems.`);
      console.log(`✨ Se encontraron ${dbUsers.length} usuarios.`);
      console.log(`🏷️ Se encontraron ${dbCharacters.length} personajes.`);
      console.log(`📨 Se encontraron ${dbMessages.length} mensajes.`);

      // Cargar datos en caché
      for ( const itemDefinition of dbItemsDefinitions){
        const effects = await DatabaseService.getEffectsByItemId(itemDefinition.id);
        itemDefinition.effects = effects.map(effect => ({ effectId: effect.effectId, value: effect.value }));
        this.cacheItemDefinitions.set(itemDefinition.id,itemDefinition);
      }
      dbUsers.forEach(user=>{
        this.cacheUsers.set(user.id,user);
      });
      for (const character of dbCharacters) { 
        try {
          const itemInstances = await DatabaseService.getInventoryByCharacterId(character.id);
          const activities = await DatabaseService.getActivitiesByCharacterId(character.id);
          const friendships = await DatabaseService.getUserFriendships(character.userId);
          const friendshipsRequest = await DatabaseService.getUserFriendsRequest(character.userId);
      
          const loadedCharacter = new Character({
            ...character,
            inventory:new Inventory(itemInstances),
            activities: activities,
            friendships: [...friendships,...friendshipsRequest]
          });
          this.cacheCharacters.set(character.id, loadedCharacter)
          this.cacheUserCharacter.set(character.userId, character.id);
      
        } catch (error) {
          console.error(`Error cargando personaje ID ${character.id}:`, error);
        }
      }
      dbMessages.forEach(message => {
        this.cacheMessages.set(message.id,message );
      });


      setInterval(() => this.syncPendingUpdates(), 5000); 

      console.log("✅ Caché cargada correctamente.");
    } catch (error) {
      console.error("❌ Error al inicializar la caché:", error);
      process.exit(1);
    }
  }

  // ✅ ACTIVITY CACHE MANAGEMENT
  static getActivityById(activityId: number): Activity | null {
    const activity =  this.cacheActivities.get(activityId) || null;
    if(activity){
      return activity
    }
    return null;
  }
  static getActivitiesByCharacterId(characterId: number): Activity[] {
    const character = this.cacheCharacters.get(characterId) || null;
    if(character){
      return character.activities;
    }
    return [];
  }
  static async createActivity(newActivity: Activity): Promise<number> {
    //creamos la actividad, le asignamos el nuevo id y la añadimos a la cache de actividades y de character.
    const newActivityId = await DatabaseService.createActivity(newActivity);
    if (!newActivityId) {throw new Error("Error durante la creacion de Actividad")}
    const createdActivity = new Activity({ ...newActivity,id: newActivityId, });
    this.cacheActivities.set(createdActivity.id, createdActivity);
    const character = this.cacheCharacters.get(createdActivity.characterId);
    if (!character) {throw new Error("Error durante la creacion de Actividad")}
    character.activities.push(createdActivity);
    return newActivityId;
  }
  static updateActivity(updatedActivity: Activity): void {
    const character = this.cacheCharacters.get(updatedActivity.characterId);
    if (!character) {throw new Error("Error durante la actualizacion de Actividad")}
    const index = character.activities.findIndex(a => a.id === updatedActivity.id);
    if (index === -1) {throw new Error("Error durante la actualizacion de Actividad")}
    character.activities[index] = updatedActivity;
    this.cacheActivities.set(updatedActivity.id, updatedActivity); 
    this.pendingActivities.add(updatedActivity.id);
  }
  static async deleteActivity(activity: Activity): Promise<boolean> {
    const character = this.cacheCharacters.get(activity.characterId);
    if (!character) {throw new Error("Error durante la eliminacion de Actividad")}
    const result = await DatabaseService.deleteActivity(activity.id)
    if(!result){throw new Error("Error durante la eliminacion de la Actividad")}
    this.cacheActivities.delete(activity.id);
    character.activities =  character.activities.filter(a=>a.id!=activity.id);
    return result;
  }

  // ✅ CHARACTER CACHE MANAGEMENT
  static getCharacterById(characterId: number): Character | null {
    return this.cacheCharacters.get(characterId) || null;
  }
  static getCharacterByUserId(userId: number): Character | null {
    const characterId = this.cacheUserCharacter.get(userId);
    if(!characterId){return null}
    return this.cacheCharacters.get(characterId)||null;
  }
  static getAllCharacters(): Character[] {
    return Array.from(this.cacheCharacters.values());
  }
  static async createCharacter(character: Character): Promise<void> {
    const newCharacterId = await DatabaseService.createCharacter(character);
    character.id = newCharacterId;
    const newCharacterItems = character.inventory?.items || [];
    for(let item of newCharacterItems){
      await DatabaseService.createItemInstance(item);
      
    }
    const newCharacterActivities = character.activities || [];
    for(let activity of newCharacterActivities){
      await DatabaseService.createActivity(activity);
    }
    const newCharacterFriendships = character.friendships || [];
    for(let friendship of newCharacterFriendships){
      await DatabaseService.createFriendship(friendship);
    }
    if(newCharacterId){
      this.cacheCharacters.set(character.id, character);
      this.cacheUserCharacter.set(character.userId,character.id)
    }
  }
  static updateCharacter(updatedCharacter: Character): void {
    if (this.cacheCharacters.has(updatedCharacter.id)) {
      const existingCharacter = this.cacheCharacters.get(updatedCharacter.id)!;
      const updated = new Character({ ...existingCharacter, ...updatedCharacter });
      this.cacheCharacters.set(updatedCharacter.id, updated);
      this.pendingCharacters.add(updatedCharacter.id);
    }
  }
  static async deleteCharacter(characterId: number): Promise<boolean> {
    const result = await DatabaseService.deleteCharacter(characterId);
    if(!result){throw new Error("Error durante la eliminacion del Character")}
    this.cacheCharacters.delete(characterId);
    return result
  }

  // ✅ EFFECTS CACHE MANAGEMENT
  static getEffectById(effectId: number): Effect | null {
    return this.cacheEffects.get(effectId) || null;
  }
  static getAllEffects(): Effect[] {
    return Array.from(this.cacheEffects.values());
  }

  // ✅ FRIENDSHIP CACHE MANAGEMENT
  static async createFriendship(friendship: Friendship): Promise<boolean> {
    const newFriendshipId = await DatabaseService.createFriendship(friendship);
    const newFriendship = new Friendship({ ...friendship,id: newFriendshipId, });
    if (!newFriendshipId) {throw new Error("Error durante la creacion de la solicitud de amistad")}
    this.cacheFriendships.set(newFriendship.id, newFriendship);
    this.cacheCharacters.get(newFriendship.idUser1)?.friendships.push(newFriendship);
    this.cacheCharacters.get(newFriendship.idUser2)?.friendships.push(newFriendship);
    return true;
  }
  static getFriendshipById(friendshipId: number): Friendship | null {
    return this.cacheFriendships.get(friendshipId) || null;
  }
  static getUserFriendships(userId: number): Friendship[] {
    const characterId = this.cacheUserCharacter.get(userId) || null;
    if(!characterId){throw new Error("No existe character asociado al user.")}
    return this.cacheCharacters.get(characterId)?.friendships || [];
  }
  static getUserFriendsRequest(userId: number): Friendship[] {
    const characterId = this.cacheUserCharacter.get(userId) || null;
    if(!characterId){throw new Error("No existe character asociado al user.")}
    return this.cacheCharacters.get(characterId)?.friendships.filter(friendship=>friendship.active==false) || [];
  }
  static async updateFriendship(updatedFriendship: Friendship): Promise<boolean> {
    const characterId1 = this.cacheUserCharacter.get(updatedFriendship.idUser1) || null;
    const characterId2 = this.cacheUserCharacter.get(updatedFriendship.idUser2) || null;
    if (!characterId1 || !characterId2) {
        throw new Error("updateFriendship: No existe uno de los user asociado a la solicitud.");
    }
    const character1 = this.cacheCharacters.get(characterId1);
    const character2 = this.cacheCharacters.get(characterId2);
    if ((character1 && character1.friendships) && (character2 && character2.friendships)) {
        character1.friendships = character1.friendships.map(friendship => 
            friendship.id === updatedFriendship.id ? updatedFriendship : friendship
        );
        character2.friendships = character2.friendships.map(friendship => 
          friendship.id === updatedFriendship.id ? updatedFriendship : friendship
        );
        this.cacheFriendships.set(updatedFriendship.id, updatedFriendship);
        this.pendingFriendships.add(updatedFriendship.id);
    }else{
      throw new Error("updateFriendship: Uno de los friendship no existe");
    }
    return true;
  }  
  static async deleteFriendship(deletedFriendship: Friendship): Promise<boolean> {
    const result = await DatabaseService.deleteFriendship(deletedFriendship);
    if(!result){throw new Error("Error durante la eliminacion de la solicitud de amistad")}
    const characterId1 = this.cacheUserCharacter.get(deletedFriendship.idUser1) || null;
    const characterId2 = this.cacheUserCharacter.get(deletedFriendship.idUser2) || null;
    if (!characterId1 || !characterId2) {
        throw new Error("updateFriendship: No existe uno de los user asociado a la solicitud.");
    }
    const character1 = this.cacheCharacters.get(characterId1);
    const character2 = this.cacheCharacters.get(characterId2);
    if ((character1 && character1.friendships) && (character2 && character2.friendships)) {
        character1.friendships = character1.friendships.filter(friendship => friendship.id != deletedFriendship.id );
        character2.friendships = character2.friendships.filter(friendship => friendship.id != deletedFriendship.id );
        this.cacheFriendships.delete(deletedFriendship.id);
    }else{
      throw new Error("updateFriendship: Uno de los friendship no existe");
    }
    return true;
  }

  // ✅ ITEM DEFINITIONS CACHE MANAGEMENT
  static getItemDefinitionById(itemId: number): ItemDefinition | null {
    return this.cacheItemDefinitions.get(itemId) || null;
  }
  static getAllItemDefinitions(): ItemDefinition[] {
    return Array.from(this.cacheItemDefinitions.values());
  }

  // ✅ ITEM INSTANCES CACHE MANAGEMENT
  static getItemInstanceById(instanceId: number): ItemInstance | null {
    for (const inventory of this.cacheInventories.values()) {
      const instance = inventory.find(i => i.id === instanceId);
      if (instance) return instance;
    }
    return null;
  }
  static getInventoryByCharacterId(characterId: number): ItemInstance[] {
    return this.cacheInventories.get(characterId) || [];
  }
  static async createItemInstance(itemInstance: ItemInstance): Promise<ItemInstance> {
    const newItemInstanceId = await DatabaseService.createItemInstance(itemInstance);
    const newItemInstance = await DatabaseService.getItemInstanceById(newItemInstanceId);
    if (!newItemInstance) {throw new Error("Error durante la creacion del ItemInstance")}
    this.cacheCharacters.get(itemInstance.characterId)?.inventory.items.push(newItemInstance);
    return newItemInstance;
  }
  static updateItemInstance(updatedInstance: ItemInstance): void {
    const itemInstances = this.cacheCharacters.get(updatedInstance.characterId)?.inventory.items;
    if (!itemInstances) return;
    const index = itemInstances.findIndex(a => a.id === updatedInstance.id);
    if (index === -1) return;
    itemInstances[index] = updatedInstance;
    this.pendingActivities.add(updatedInstance.characterId);
  }  
  static async deleteItemInstance(itemInstance: ItemInstance): Promise<boolean> {
    const character = this.cacheCharacters.get(itemInstance.characterId);
    if(!character){ throw new Error("Error durante la eliminacion del itemInstance : No existe el personaje")}
    const result = await DatabaseService.deleteItemInstance(itemInstance.id);
    if(!result){throw new Error("Error durante la eliminacion del ItemInstance")}
    character.inventory.items = character.inventory.items.filter(item=>item.id!=itemInstance.id);
    return result;
  }
  static updateInventory(characterId: number, updatedItems: ItemInstance[]): void {
    this.cacheInventories.set(characterId, updatedItems);
    this.pendingInventories.add(characterId);
  }
  static deleteInventoryByCharacterId(characterId: number): void {
    this.cacheInventories.delete(characterId);
    this.pendingInventories.add(characterId);
  }

  // ITEM EFFECTS CACHE MANAGEMENT
  static getEffectsByItemId(itemId: number): ItemEffect[] {
    return this.cacheItemEffects.get(itemId) || [];
  }

  // ✅ MESSAGE CACHE MANAGEMENT
  static getMessageById(messageId: number): Message | null {
    return this.cacheMessages.get(messageId) || null;
  }
  static getMessagesByCharacterId(characterId: number, page: number = 1, limit: number = 10): Message[] {
    const messages = [...this.cacheMessages.values()].filter(message=>message.senderId==characterId || message.receiverId == characterId);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return messages.slice(startIndex, endIndex);
  }
  static getCharacterMessagesOutbox(characterId: number, page: number = 1, limit: number = 10): Message[] {
    const messages = [...this.cacheMessages.values()].filter(message=>message.senderId==characterId);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return messages.slice(startIndex, endIndex);
  }
  static getCharacterMessagesInbox(characterId: number, page: number = 1, limit: number = 10): Message[] {
    const messages = [...this.cacheMessages.values()].filter(message=>message.receiverId==characterId);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return messages.slice(startIndex, endIndex);
  }
  static getCharacterMessagesOutboxCount(characterId: number){
    return this.getCharacterMessagesOutbox(characterId).length || 0;
  }
  static getCharacterMessagesInboxCount(characterId: number){
    return this.getCharacterMessagesInbox(characterId).length || 0;
  }
  static async createMessage(message: Message): Promise<boolean> {
    const newMessageId = await DatabaseService.createMessage(message);
    if(!newMessageId){throw new Error("createMessage: Error al crear el mensaje ")}
    const newMessage = await DatabaseService.getMessageById(newMessageId);
    if(!newMessage){throw new Error("createMessage: Error al obtener el nuevo mensaje ")}
    if(newMessage){
      this.cacheMessages.set(newMessage.id, newMessage);
      return true;
    }
    return false;
  }
  static markMessageAsRead(messageId: number): void {
    const message = this.getMessageById(messageId);
    if(message){
      message.read = true;
      this.pendingMessages.add(message.id);
    }
  }
  static async deleteMessage(message: Message): Promise<boolean> {
    const result = await DatabaseService.deleteMessage(message.id);
    if(!result){throw new Error("Error al eliminar el mensaje")}
    this.cacheMessages.delete(message.id);
    return result;
  }

  // USERS ✅ 
  static async createUser(user: User): Promise<User> {
    const newUserId = await DatabaseService.createUser(user);
    const newUser = await DatabaseService.getUserById(newUserId);
    if(!newUser){throw new Error("Error al crear el usuario")}
    this.cacheUsers.set(newUser.id, newUser);
    return newUser;
  }
  static getUserById(userId: number): User | null {
    return this.cacheUsers.get(userId) || null;
  }
  static getUserByUsername(username: string): User | null {
    return [...this.cacheUsers.values()].find(user => user.username === username) || null;
  }
  static getAllUsers(): User[] {
    return Array.from(this.cacheUsers.values());

  }
  static updateUser(updatedUser: User):void {
    if (this.cacheUsers.has(updatedUser.id)) {
      const existingUser = this.cacheUsers.get(updatedUser.id)!;
      const updated = new User({ ...existingUser, ...updatedUser });
      this.cacheUsers.set(updatedUser.id, updated);
      this.pendingUsers.add(updatedUser.id);
    }
  }
  static async deleteUser(userId: number):Promise<boolean> {
    const result = await DatabaseService.deleteUser(userId);
    if(!result){throw new Error("Error al eliminar el usuario")} 
    this.cacheUsers.delete(userId);
    return result;
  }


  static syncLog():boolean{
    let changes = {
      pendingCharacters: this.pendingCharacters.size,
      pendingMessages: this.pendingMessages.size,
      pendingUsers: this.pendingUsers.size
    };
    
    // Filtrar solo los elementos con cambios
    let filteredChanges = Object.entries(changes)
      .filter(([_, value]) => value > 0)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");
    
    let totalChanges = Object.values(changes).reduce((sum, val) => sum + val, 0);
    
    if (!(totalChanges > 0)) {
      return false;
    }else{
      console.log(`Sincronizando ${totalChanges} cambios pendientes:\n${filteredChanges}`);
      return true;
    }
  }
  // SINCRONIZACIÓN DIFERIDA CON BASE DE DATOS ✅ 
  static async syncPendingUpdates(): Promise<void> {
    try {
      if (!this.syncLog()) return;
      // Procesar personajes
      await Promise.all(
        Array.from(this.pendingCharacters.values()).map(async (pendingCharacterId) => {
          const pendingCharacter = this.cacheCharacters.get(pendingCharacterId);
          if (pendingCharacter) {
            try {
              await DatabaseService.updateCharacter(pendingCharacter);
              await Promise.all([
                ...pendingCharacter.inventory.items.map(item => DatabaseService.updateItemInstance(item)),
              ]);
            } catch (error) {
              console.error(`❌ Error al actualizar personaje ID ${pendingCharacterId}:`, error);
            }
          }
        })
      );
      // Procesar actividades
      await Promise.all(
        Array.from(this.pendingActivities.values()).map(async (pendingActivityId) => {
          const pendingActivity = this.cacheActivities.get(pendingActivityId);
          if (pendingActivity) {
            try {
              await DatabaseService.updateActivity(pendingActivity);
            } catch (error) {
              console.error(`❌ Error al actualizar la actividad ID ${pendingActivity.id}:`, error);
            }
          }
        })
      );
      // Procesar amistades
      await Promise.all(
        Array.from(this.pendingFriendships.values()).map(async (pendingFriendshipId) => {
          const pendingFriendship = this.cacheFriendships.get(pendingFriendshipId);
          if (pendingFriendship) {
            try {
              await DatabaseService.updateFriendship(pendingFriendship);
            } catch (error) {
              console.error(`❌ Error al actualizar la amistad ID ${pendingFriendship.id}:`, error);
            }
          }
        })
      );
      // Procesar mensajes
      await Promise.all(
        Array.from(this.pendingMessages.values()).map(async (pendingMessageId) => {
          const pendingMessage = this.cacheMessages.get(pendingMessageId);
          if (pendingMessage) {
            try {
              await DatabaseService.markMessageAsRead(pendingMessage.id);
            } catch (error) {
              console.error(`❌ Error al actualizar mensaje ID ${pendingMessageId}:`, error);
            }
          }
        })
      );
      // Procesar usuarios
      await Promise.all(
        Array.from(this.pendingUsers.values()).map(async (pendingUserId) => {
          const pendingUser = this.cacheUsers.get(pendingUserId);
          if (pendingUser) {
            try {
              await DatabaseService.updateUser(pendingUser);
            } catch (error) {
              console.error(`❌ Error al actualizar usuario ID ${pendingUserId}:`, error);
            }
          }
        })
      );

      // Limpiar listas de pendientes
      this.pendingActivities.clear();
      this.pendingFriendships.clear();

      this.pendingCharacters.clear();
      this.pendingMessages.clear();
      this.pendingUsers.clear();

    } catch (error) {
      console.error("❌ Error en la sincronización con la base de datos:", error);
    }
  }

}

export default CacheDataService;
