import DatabaseService from "../database/databaseService";
import { Character } from "../../models/character.model";
import { ItemDefinition } from "../../models/itemDefinition.model";
import { Activity } from "../../models/activity.model";
import { ItemEffect } from "../../models/itemEffect.model";
import { ItemInstance } from "../../models/itemInstance.model";
import { Message } from "../../models/message.model";
import { User } from "../../models/user.model";
import { Friendship } from "../../models/friendship.model";
import { Item } from "../../utils/itemGenerators/item.model";

class CacheDataService {

  static cacheActivities: Map<number, Activity> = new Map();
  static cacheCharacters: Map<number, Character> = new Map();
  static cacheUserCharacter : Map<number, number> = new Map();
  static cacheFriendships: Map<number, Friendship> = new Map();
  static cacheItemDefinitions: Map<number, ItemDefinition> = new Map();
  static cacheItemInstances: Map<number, ItemInstance> = new Map();
  static cacheMessages: Map<number, Message> = new Map();
  static cacheUsers: Map<number, User> = new Map();

  static pendingActivities: Set<number> = new Set();
  static pendingCharacters: Set<number> = new Set();
  static pendingFriendships: Set<number> = new Set();
  static pendingItemInstances: Set<number> = new Set();
  static pendingMessages: Set<number> = new Set();
  static pendingUsers: Set<number> = new Set();

  static async initializeCache(): Promise<void> {
    try {
      console.log("🔄 Cargando caché...");

      const [
        dbItemsDefinitions,
        dbEffects,
        dbEffectsItems,
        dbUsers,
        dbCharacters,
        dbItemsInstances,
        dbActivities,
        dbFriendships,
        dbMessages,
      
      ] = await Promise.all([
        DatabaseService.getAllItemDefinitions(),
        DatabaseService.getAllEffects(),
        DatabaseService.getAllEffectsItem(),
        DatabaseService.getAllUsers(),
        DatabaseService.getAllCharacters(),
        DatabaseService.getAllItemInstances(),
        DatabaseService.getAllActivities(),
        DatabaseService.getAllFriendships(),
        DatabaseService.getAllMessages(),
        
      ]);

      if (!dbItemsDefinitions || !dbEffects || !dbEffectsItems || !dbUsers || !dbCharacters || !dbItemsInstances  || !dbActivities  || !dbFriendships || !dbMessages) {
        throw new Error("🚨 Error crítico: Datos incompletos en la carga inicial de la caché.");
      }
      console.log(`📦 Se encontraron ${dbItemsDefinitions.length} definiciones de ítems.`);
      console.log(`✨ Se encontraron ${dbEffects.length} efectos.`);
      console.log(`✨ Se encontraron ${dbEffectsItems.length} efectos de objetos.`);
      console.log(`🏷️ Se encontraron ${dbUsers.length} usuarios.`);
      console.log(`🏷️ Se encontraron ${dbCharacters.length} personajes.`);
      console.log(`📦 Se encontraron ${dbItemsInstances.length} instancias de items.`);
      console.log(`📦 Se encontraron ${dbActivities.length} actividades.`);
      console.log(`📦 Se encontraron ${dbFriendships.length} relaciones.`);
      console.log(`📨 Se encontraron ${dbMessages.length} mensajes.`);

      // Cargar datos en caché
      dbItemsDefinitions.forEach(definition=>{
        const itemEffects : ItemEffect[] = dbEffectsItems.filter(itemEffect=>itemEffect.itemId==definition.id);
        definition = new ItemDefinition({...definition , effects : itemEffects});
        this.cacheItemDefinitions.set(definition.id,definition);
      });
      dbUsers.forEach(user=>{
        this.cacheUsers.set(user.id,user);
      });
      dbCharacters.forEach(character=>{
        this.cacheCharacters.set(character.id,character);
        this.cacheUserCharacter.set(character.userId,character.id)
      });
      dbItemsInstances.forEach(instance=>{
        this.cacheItemInstances.set(instance.id,instance);
        this.cacheCharacters.get(instance.characterId)?.inventory.items.push(instance.id);
      });
      dbActivities.forEach(activity=>{
        this.cacheActivities.set(activity.id,activity);
        this.cacheCharacters.get(activity.characterId)?.activities.push(activity.id);
      });
      dbFriendships.forEach(friendship=>{
        this.cacheFriendships.set(friendship.id,friendship);
        this.cacheCharacters.get(friendship.idUser1)?.friendships.push(friendship.id);
        this.cacheCharacters.get(friendship.idUser2)?.friendships.push(friendship.id);
      });
      dbMessages.forEach(message => {
        this.cacheMessages.set(message.id,message);
        this.cacheCharacters.get(message.characterSenderId)?.messages.push(message.id);
        this.cacheCharacters.get(message.characterReciverId)?.friendships.push(message.id);
      });

      setInterval(() => this.syncPendingUpdates(), 5000); 

      console.log("✅ Caché cargada correctamente.");
    } catch (error) {
      console.error("❌ Error al inicializar la caché:", error);
      process.exit(1);
    }
  }

  // ACTIVITY CACHE MANAGEMENT ✅
  static async createActivity(newActivity: Activity): Promise<number> {
    //creamos la actividad, le asignamos el nuevo id y la añadimos a la cache de actividades y de character.
    const newActivityId = await DatabaseService.createActivity(newActivity);
    if (!newActivityId) {throw new Error("Error durante la creacion de Actividad")}
    const createdActivity = new Activity({ ...newActivity,id: newActivityId, });
    this.cacheActivities.set(createdActivity.id, createdActivity);
    const character = this.cacheCharacters.get(createdActivity.characterId);
    if (!character) {throw new Error("Error durante la creacion de Actividad")}
    character.activities.push(newActivityId);
    return newActivityId;
  }
  static updateActivity(updatedActivity: Activity): void {
    this.cacheActivities.set(updatedActivity.id, updatedActivity); 
    this.pendingActivities.add(updatedActivity.id);
  }
  static async deleteActivity(activity: Activity): Promise<boolean> {
    const character = this.cacheCharacters.get(activity.characterId);
    const result = await DatabaseService.deleteActivity(activity.id)
    if (!character || !result) {throw new Error("Error durante la eliminacion de Actividad")}
    this.cacheActivities.delete(activity.id);
    character.activities =  character.activities.filter(activityId=>activityId != activity.id);
    return result;
  }

  // CHARACTER CACHE MANAGEMENT ✅
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
  static async createCharacter(character: Character): Promise<boolean> {
    const newCharacterId = await DatabaseService.createCharacter(character);
    if(!newCharacterId){throw new Error("createCharacter: Error durante la creacion del personaje")}
    const newCharacter = new Character({...character,id:newCharacterId})
    if(!newCharacter){throw new Error("createCharacter: Error durante la creacion del personaje")}
    this.cacheCharacters.set(newCharacter.id, newCharacter);
    this.cacheUserCharacter.set(newCharacter.userId,newCharacter.id)
    return true;
    
  }
  static updateCharacter(updatedCharacter: Character): void {
    const existingCharacter = this.cacheCharacters.get(updatedCharacter.id);
    if(!existingCharacter){throw new Error("updateCharacter: Error al actualizar el character")}
    const updated = new Character({ ...existingCharacter, ...updatedCharacter });
    this.cacheCharacters.set(updated.id, updated);
    this.pendingCharacters.add(updated.id);
  }
  static async deleteCharacter(characterId: number): Promise<boolean> {
    const result = await DatabaseService.deleteCharacter(characterId);
    if(!result){throw new Error("Error durante la eliminacion del Character")}
    this.cacheCharacters.delete(characterId);
    return result
  }

  // FRIENDSHIP CACHE MANAGEMENT ✅
  static async createFriendship(friendship: Friendship): Promise<boolean> {
    const newFriendshipId = await DatabaseService.createFriendship(friendship);
    const newFriendship = new Friendship({ ...friendship,id: newFriendshipId, });
    if (!newFriendshipId) {throw new Error("Error durante la creacion de la solicitud de amistad")}
    this.cacheFriendships.set(newFriendship.id, newFriendship);
    this.cacheCharacters.get(newFriendship.idUser1)?.friendships.push(newFriendshipId);
    this.cacheCharacters.get(newFriendship.idUser2)?.friendships.push(newFriendshipId);
    return true;
  }
  static getFriendshipById(friendshipId: number): Friendship | null {
    return this.cacheFriendships.get(friendshipId) || null;
  }
  static getUserFriendships(userId: number): Friendship[] {
    const characterId = this.cacheUserCharacter.get(userId) || null;
    if(!characterId){throw new Error("getUserFriendships : No existe character asociado al user.")}
    const character = this.cacheCharacters.get(characterId) || null;
    if(!character){throw new Error("getUserFriendships :No existe character asociado al user.")}
    const friendshipList = this.cacheCharacters.get(characterId)?.friendships || [];
    return friendshipList
      .map(friendshipId => this.getFriendshipById(friendshipId))
      .filter((friendship): friendship is Friendship => friendship !== null); //filtramos el resultado del mapeo eliminando los valores null (no encontrados)
  }
  static getUserFriendsRequest(userId: number): Friendship[] {
    const characterId = this.cacheUserCharacter.get(userId) || null;
    if(!characterId){throw new Error("getUserFriendships : No existe character asociado al user.")}
    const character = this.cacheCharacters.get(characterId) || null;
    if(!character){throw new Error("getUserFriendships :No existe character asociado al user.")}
    const friendshipList = this.cacheCharacters.get(characterId)?.friendships || [];
    return friendshipList
      .map(friendshipId => this.getFriendshipById(friendshipId))
      .filter((friendship): friendship is Friendship => friendship !== null && friendship.active==false); //filtramos el resultado del mapeo eliminando los valores null (no encontrados)
  }
  static async updateFriendship(updatedFriendship: Friendship): Promise<boolean> {
    this.cacheFriendships.set(updatedFriendship.id,updatedFriendship);
    this.pendingFriendships.add(updatedFriendship.id);
    return true;
  }  
  static async deleteFriendship(deletedFriendship: Friendship): Promise<boolean> {
    const characterId1 = this.cacheUserCharacter.get(deletedFriendship.idUser1) || null;
    const characterId2 = this.cacheUserCharacter.get(deletedFriendship.idUser2) || null;
    if(!characterId1 || !characterId2 ){throw new Error("deleteFriendship : No existen todos los characterID asociado al user.")}
    const character1 = this.cacheCharacters.get(characterId1) || null;
    const character2 = this.cacheCharacters.get(characterId2) || null;
    if(!character1 || !character2 ){throw new Error("deleteFriendship : No existen todos los character asociado al user.")}

    const result = await DatabaseService.deleteFriendship(deletedFriendship);
    if(!result){throw new Error("deleteFriendship : Error al eliminar la solicitud de amistad.")}
    
    character1.friendships= character1.friendships.filter(friendshipID=> friendshipID != deletedFriendship.id);
    character2.friendships= character2.friendships.filter(friendshipID=> friendshipID != deletedFriendship.id);
    this.cacheFriendships.delete(deletedFriendship.id);
    
    return true;
  }

  // ITEM DEFINITIONS CACHE MANAGEMENT ✅
  static getItemDefinitionById(itemId: number): ItemDefinition | null {
    return this.cacheItemDefinitions.get(itemId) || null;
  }
  static getAllItemDefinitions(): ItemDefinition[] {
    return Array.from(this.cacheItemDefinitions.values());
  }

  // ITEM INSTANCES CACHE MANAGEMENT ✅
  static async createItemInstance(itemInstance: ItemInstance): Promise<boolean> {
    const newItemInstanceId = await DatabaseService.createItemInstance(itemInstance);
    if (!newItemInstanceId) {throw new Error("createItemInstance: Error durante la creacion de ItemInstance")}
    const newItemInstance = new ItemInstance({...itemInstance,id:newItemInstanceId})
    if (!newItemInstance) {throw new Error("createItemInstance: Error durante la creacion de ItemInstance")}

    this.cacheItemInstances.set(newItemInstance.id,newItemInstance);
    this.cacheCharacters.get(itemInstance.characterId)?.inventory.items.push(newItemInstanceId);
    return true;
  }
  static getItemInstancesByCharacter(character:Character){
    return character.inventory.items
    .map(itemInstanceId=>this.cacheItemInstances.get(itemInstanceId))
    .filter((itemInstance): itemInstance is ItemInstance => itemInstance !== null); //filtramos el resultado del mapeo eliminando los valores null (no encontrados)
  }
  static updateItemInstance(updatedInstance: ItemInstance): void {
    this.cacheItemInstances.set(updatedInstance.id,updatedInstance)
    this.pendingItemInstances.add(updatedInstance.id);
  }  
  static async deleteItemInstance(itemInstance: ItemInstance): Promise<boolean> {
    const character = this.cacheCharacters.get(itemInstance.characterId);
    if(!character){ throw new Error("deleteItemInstance: Error durante la eliminacion del itemInstance : No existe el personaje")}

    const result = await DatabaseService.deleteItemInstance(itemInstance.id);
    if(!result){throw new Error("deleteItemInstance: Error durante la eliminacion del ItemInstance")}

    this.cacheItemInstances.delete(itemInstance.id);
    character.inventory.items = character.inventory.items.filter(itemInstanceId=>itemInstanceId!=itemInstance.id);
    return true;
  }

  // MESSAGE CACHE MANAGEMENT ✅
  static getMessageById(messageId: number): Message | null {
    return this.cacheMessages.get(messageId) || null;
  }
  static getMessagesByCharacterId(characterId: number, page: number = 1, limit: number = 10): Message[] {
    const character = this.cacheCharacters.get(characterId);
    if(!character){ throw new Error("getMessagesByCharacterId: Error durante la eliminacion del itemInstance : No existe el personaje")}
    const messagesIds = character.messages;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const messageList = messagesIds.slice(startIndex, endIndex);
    return messageList
      .map(messageId => this.getMessageById(messageId))
      .filter((message): message is Message => message !== null); //filtramos el resultado del mapeo eliminando los valores null (no encontrados)
  }
  static getCharacterMessagesOutbox(characterId: number, page: number = 1, limit: number = 10): Message[] {
    const character = this.cacheCharacters.get(characterId);
    if(!character){ throw new Error("getMessagesByCharacterId: Error durante la eliminacion del itemInstance : No existe el personaje")}
    const messagesIds = character.messages;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const messageList = messagesIds.slice(startIndex, endIndex);
    return messageList
      .map(messageId => this.getMessageById(messageId))
      .filter((message): message is Message => message !== null && message.characterSenderId==characterId); //filtramos el resultado del mapeo eliminando los valores null (no encontrados)
  }
  static getCharacterMessagesInbox(characterId: number, page: number = 1, limit: number = 10): Message[] {
    const character = this.cacheCharacters.get(characterId);
    if(!character){ throw new Error("getMessagesByCharacterId: Error durante la eliminacion del itemInstance : No existe el personaje")}
    const messagesIds = character.messages;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const messageList = messagesIds.slice(startIndex, endIndex);
    return messageList
      .map(messageId => this.getMessageById(messageId))
      .filter((message): message is Message => message !== null && message.characterReciverId==characterId); //filtramos el resultado del mapeo eliminando los valores null (no encontrados)
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
    const newMessage = new Message({...message,id:newMessageId});
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
    const characterId1 = this.cacheUserCharacter.get(message.characterSenderId) || null;
    const characterId2 = this.cacheUserCharacter.get(message.characterReciverId) || null;
    if(!characterId1 || !characterId2 ){throw new Error("deleteFriendship : No existen todos los characterID asociado al user.")}
    const character1 = this.cacheCharacters.get(characterId1) || null;
    const character2 = this.cacheCharacters.get(characterId2) || null;
    if(!character1 || !character2 ){throw new Error("deleteFriendship : No existen todos los character asociado al user.")}

    const result = await DatabaseService.deleteMessage(message.id);
    if(!result){throw new Error("Error al eliminar el mensaje")}

    character1.messages= character1.messages.filter(messageId=> messageId != message.id);
    character2.messages= character2.messages.filter(messageId=> messageId != message.id);
    this.cacheMessages.delete(message.id);
    return result;
  }

  // USERS ✅ 
  static async createUser(user: User): Promise<User> {
    const newUserId = await DatabaseService.createUser(user);
    const newUser = new User({...user,id:newUserId})
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
      pendingActivities:this.pendingActivities.size,
      pendingCharacters: this.pendingCharacters.size,
      pendingFriendships: this.pendingFriendships.size,
      pendingItemInstances: this.pendingItemInstances.size,
      pendingMessages:this.pendingMessages.size,
      pendingUsers: this.pendingUsers.size,
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
      
      // Procesar Activities
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
      // Procesar Characters
      await Promise.all(
        Array.from(this.pendingCharacters.values()).map(async (pendingCharacterId) => {
          const pendingCharacter = this.cacheCharacters.get(pendingCharacterId);
          if (pendingCharacter) {
            try {
              await DatabaseService.updateCharacter(pendingCharacter);
            } catch (error) {
              console.error(`❌ Error al actualizar la personaje ID ${pendingCharacter.id}:`, error);
            }
          }
        })
      );
      // Procesar Friendships
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
      // Procesar ItemInstances
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
      this.pendingCharacters.clear();
      this.pendingFriendships.clear();
      this.pendingItemInstances.clear();
      this.pendingMessages.clear();
      this.pendingUsers.clear();

    } catch (error) {
      console.error("❌ Error en la sincronización con la base de datos:", error);
    }
  }

}

export default CacheDataService;
