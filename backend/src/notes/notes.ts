/*
DATABASE.TS
  db.run(`
        CREATE TABLE IF NOT EXISTS characters (
          ...
          gold_chest INTEGER DEFAULT 0,
          warehouse INTEGER DEFAULT 0,
          enviroment INTEGER DEFAULT 0,
          traps INTEGER DEFAULT 0,
          ...
          )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS friendship (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id_1 INTEGER NOT NULL,
    user_id_2 INTEGER NOT NULL,
    active INTEGER DEFAULT 0
    FOREIGN KEY (user_id_1) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id_2) REFERENCES users(id) ON DELETE CASCADE
    )
`);
*/
/*
      CHARACTER.SERVICE.TS
        createCharacter
          QUERY > gold_chest , warehouse , enviroment , traps , 
          PARAMS > character.goldChest, character.warehouse, character.enviroment, character.traps, 
        updateCharacter
          QUERY > gold_chest , warehouse , enviroment , traps , 
          PARAMS > character.goldChest, character.warehouse, character.enviroment, character.traps, 

*/
/*
DATABASESERVICE.TS

// CHARACTERS ✅ 
  createCharacter >
      goldChest: character.goldChest,
      warehouse : character.warehouse,
      enviroment : character.enviroment,
      traps : character.traps,
  updateCharacter > 
      goldChest: character.goldChest,
      warehouse : character.warehouse,
      enviroment : character.enviroment,
      traps : character.traps,
  mapDbCharacter > 
      goldChest: dbCharacter.gold_chest,
      warehouse : dbCharacter.warehouse,
      enviroment : dbCharacter.enviroment,
      traps : dbCharacter.traps,

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
  private static mapDbFriendship(dbFriendship: dbFriendship): Friendship {
    return new Friendship({
      idUser1: dbFriendship.user_id_1,
      idUser2: dbFriendship.user_id_2,
      active: dbFriendship.active,
    });
  }
*/
/*
  CHARACTER.MODEL.TS
    private _friendships: Friendship[] = [];
    private _goldChest: number = 0;
    private _warehouse: number = 0;
    private _enviroment: number = 0;
    private _traps: number = 0;

    constructor > 
      this._friendships = data.friendships ?? [];
      this._goldChest = data.goldChest ?? 0;
      this._warehouse = data.warehouse ?? 0;
      this._enviroment = data.enviroment ?? 0;
      this._traps = data.traps ?? 0;

    //Friends
    getFriends():{id:number,username:string}[]{
      const friendships = CacheDataService.getUserFriendships(this.id);
      let friends: User[] = [];
      friendships.forEach(friendship=>{
        const friendId = friendship.idUser1==this.id? friendship.idUser2: friendship.idUser1;
        const friend = CacheDataService.getUserById(friendId);
        if(friend){
          friends.push(friend);
        }
      });
      return friends.map(friend=> {return {id:friend.id,username:friend.username} });
    }
    async sendFriendRequest(userId:number): Promise<boolean>{
      const result = await CacheDataService.createFriendship({
        id:0,
        idUser1:this.id,
        idUser2:userId,
        active:false,
      });
      return result;
    }
    acceptFriendship(friendhip:Friendship){
      CacheDataService.updateFriendship(friendhip);
    }
    async deleteFriendship(friendhip:Friendship):Promise<boolean>{
      const result = await CacheDataService.deleteFriendship(friendhip);
      return result;
    }

    get goldChest() { return this._goldChest; }
    set goldChest(value: number) { this._goldChest = value; this.updateCharacter(); }

    get warehouse() { return this._warehouse; }
    set warehouse(value: number) { this._warehouse = value; this.updateCharacter(); }

    get enviroment() { return this._enviroment; }
    set enviroment(value: number) { this._enviroment = value; this.updateCharacter(); }

    get traps() { return this._traps; }
    set traps(value: number) { this._traps = value; this.updateCharacter(); }

    get friendships(): Friendship[] { return this._friendships; }
    set friendships(value: Friendship[]) { this._friendships = value; this.updateCharacter(); }
*/
/*
CacheDataService
  static cacheFriendships: Map<number, Friendship[]> = new Map();
  dbCharacters.forEach(async character =>{ 
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
  });
  
  // ✅ FRIENDSHIP CACHE MANAGEMENT
  static async createFriendship(friendship: Friendship): Promise<boolean> {
    const result = await DatabaseService.createFriendship(friendship);
    if (!result) {throw new Error("Error durante la creacion de la solicitud de amistad")}
    const user1Friendships = this.cacheFriendships.get(friendship.idUser1) ?? [];
    user1Friendships.push(friendship);
    this.cacheFriendships.set(friendship.idUser1, user1Friendships);
    const user2Friendships = this.cacheFriendships.get(friendship.idUser2) ?? [];
    user2Friendships.push(friendship);
    this.cacheFriendships.set(friendship.idUser2, user2Friendships);
    return true;
  }
  static getFriendshipById(userId:number, friendshipId: number): Friendship | null {
    return this.cacheFriendships.get(userId)?.filter(friendship=>friendship.id==friendshipId)[0] || null;
  }
  static getUserFriendships(userId: number): Friendship[] {
    return this.cacheFriendships.get(userId)?.filter(friendship=>friendship.active==true) || [];
  }
  static getUserFriendsRequest(userId: number): Friendship[] {
    return this.cacheFriendships.get(userId)?.filter(friendship=>friendship.active==false) || [];
  }
  static async updateFriendship(updatedFriendship: Friendship): Promise<void> {
      const user1Friendships = this.cacheFriendships.get(updatedFriendship.idUser1) ?? [];
      const user2Friendships = this.cacheFriendships.get(updatedFriendship.idUser2) ?? [];
      const indexFriendship12 = user1Friendships.findIndex(friendship => friendship.id == updatedFriendship.id );
      const indexFriendship21 = user2Friendships.findIndex(friendship => friendship.id == updatedFriendship.id );
      if(indexFriendship12==-1 || indexFriendship21==-1){ throw new Error("Error al actualizar la solicitud de amistad"); }
      user1Friendships[indexFriendship12].active=updatedFriendship.active;
      user1Friendships[indexFriendship12].active=updatedFriendship.active;
      this.cacheFriendships.set(updatedFriendship.idUser1, user1Friendships); 
      this.cacheFriendships.set(updatedFriendship.idUser2, user2Friendships); 
      const result = await DatabaseService.updateFriendship(updatedFriendship);
  }  
  static async deleteFriendship(deletedFriendship: Friendship): Promise<boolean> {
    const result = await DatabaseService.deleteFriendship(deletedFriendship);
    if(!result){throw new Error("Error durante la eliminacion de la solicitud de amistad")}
    const user1Friendships = this.cacheFriendships.get(deletedFriendship.idUser1)?.filter(friendship=>friendship.id != deletedFriendship.id) || [];
    const user2Friendships = this.cacheFriendships.get(deletedFriendship.idUser2)?.filter(friendship=>friendship.id != deletedFriendship.id) || [];
    this.cacheFriendships.set(deletedFriendship.idUser1, user1Friendships); 
    this.cacheFriendships.set(deletedFriendship.idUser2, user2Friendships); 
    return result;
  }

*/
/*
friendship.model
  export class Friendship {
    id:number=0;
    idUser1: number = 0;
    idUser2: number = 0;
    active : boolean = false;
  
    constructor(data: Partial<Friendship>) {
      Object.assign(this, data);
    }
  }
*/
/*
FRIENDSHIP.SERVICE.TS
  import { db } from "../../database";

  export interface dbFriendship {
    id:number,
    user_id_1: number,
    user_id_2: number,
    active: boolean
  }

  class FriendshipService {
    static async createFriendship(friendship: dbFriendship): Promise<number> {
      return new Promise((resolve, reject) => {
        const query = `
          INSERT INTO friendship (user_id_1, user_id_2)
          VALUES (?, ?);
        `;
        const params = [
          friendship.user_id_1,
          friendship.user_id_2
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
    static async getUserFriendships(idUser1: number): Promise<dbFriendship[]> {
      return new Promise((resolve, reject) => {
        const query = `
          SELECT * FROM friendship 
          WHERE (user_id_1 = ? OR user_id_2 = ?)
          AND active = 1
          ;`;
        db.all(query, [idUser1,idUser1], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows as dbFriendship[]);
          }
        });
      });
    }
    static async getUserFriendsRequest(idUser1: number): Promise<dbFriendship[]> {
      return new Promise((resolve, reject) => {
        const query = `
          SELECT * FROM friendship 
          WHERE (user_id_1 = ? OR user_id_2 = ?)
          AND active = 0
          ;`;
        db.all(query, [idUser1,idUser1], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows as dbFriendship[]);
          }
        });
      });
    }
    static async updateFriendship(updatedFriendship: dbFriendship): Promise<boolean> {
      return new Promise((resolve, reject) => {
        const query = `
          UPDATE friendship SET active = ?
          WHERE user_id_1 = ? AND user_id_2 = ?;
        `;

        const params = [
          updatedFriendship.active,
          updatedFriendship.user_id_1,
          updatedFriendship.user_id_2
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
    static async deleteFriendship(updatedFriendship: dbFriendship): Promise<boolean> {
      return new Promise((resolve, reject) => {
        const query = `
          DELETE FROM friendship 
          WHERE id = ?;
        `;
        const params = [ 
          updatedFriendship.id, 
        ];
        db.run(query, params , function (err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes > 0);
          }
        });
      });
    }
  }

  export default FriendshipService;
*/
/*
    friendshipRoutes.ts

    import express, { Request, response, Response } from "express";
    import authMiddleware from "../middleware/authMiddleware";
    import { validateCharacterMiddleware } from "../middleware/validateCharacterMiddleware";
    import { Character } from "../models/character.model";
    import CacheDataService from "../services/cache/CacheDataService";

    const router = express.Router();

    router.post( "/friends",  authMiddleware, validateCharacterMiddleware, async (req: Request, res: Response) => {
      try {
        const character : Character = req.locals.character;
        const friendships = character.getFriends();
        res.status(200).json(friendships);
      } catch (error) {
        console.error("Error al obtener listado amigos:", error);
        res.status(500).json({ error: "Error interno." });
      }
    });

    router.post( "/sendFriendRequest",  authMiddleware, validateCharacterMiddleware, async (req: Request, res: Response) => {
      try {
        const character : Character = req.locals.character;
        const friendId : number = req.body?.friendId;
        const newFriend = CacheDataService.getUserById(friendId);
        if(!newFriend){ 
          res.status(404).json({error:"Error al encontrar el destinatario de la solicitud de amistad."});
          return;
        }
        const result = character.sendFriendRequest(friendId);
        if(!result){
          res.status(404).json({error:"Error al enviar la solicitud de amistad"});
          return;
        }
        res.status(200).json(result);
      } catch (error) {
        console.error("Error al enviar la solicitud de amistad :", error);
        res.status(500).json({ error: "Error interno." });
      }
    });

    router.post( "/acceptFriendship",  authMiddleware, validateCharacterMiddleware, async (req: Request, res: Response) => {
      try {
        const character : Character = req.locals.character;
        const friendshipId : number = req.body?.friendshipId;
        const friendshipRequest = CacheDataService.getFriendshipById(character.userId, friendshipId);
        if(!friendshipRequest){ 
          res.status(404).json({error:"Error al encontrar la solicitud de amistad."});
          return;
        }
        character.acceptFriendship(friendshipRequest);
        res.status(200);
      } catch (error) {
        console.error("Error al al aceptar la solicitud de amistad :", error);
        res.status(500).json({ error: "Error interno." });
      }
    });

    router.post( "/deleteFriendship",  authMiddleware, validateCharacterMiddleware, async (req: Request, res: Response) => {
      try {
        const character : Character = req.locals.character;
        const friendshipId : number = req.body?.friendshipId;
        const friendshipRequest = CacheDataService.getFriendshipById(character.userId, friendshipId);
        if(!friendshipRequest){ 
          res.status(404).json({error:"Error al encontrar la solicitud de amistad."});
          return;
        }
        character.deleteFriendship(friendshipRequest);
        res.status(200);
      } catch (error) {
        console.error("Error al eliminar la amistad :", error);
        res.status(500).json({ error: "Error interno." });
      }
    });

    export default router;
*/
/*
    combatRoutes.ts
    router.get( "/leaderboard", authMiddleware, validateCharacterMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      if (page < 1 || limit < 1) {
        res.status(400).json({ error: "Los parámetros page y limit deben ser números positivos." });
        return;
      }
      const allCharacters = CacheDataService.getAllCharacters();
      const totalCharacters = allCharacters.length;
      const sortedCharacters = allCharacters.sort((a, b) => b.totalGold - a.totalGold);
      const startIndex = (page - 1) * limit;
      const paginatedCharacters = sortedCharacters.slice(startIndex, startIndex + limit);
      res.json({
        characters: paginatedCharacters,
        page,
        limit,
        total: totalCharacters,
        totalPages: Math.ceil(totalCharacters / limit)
      });
    } catch (error) {
      console.error("Error al obtener el leaderboard:", error);
      res.status(500).json({ error: "Error interno al obtener el leaderboard." });
    }
  }
);
*/
/*
REVISION:
    FRONT:
        PERFIL:
            LISTO:
                MOSTRAR DATOS PRINCIPALES
                MOSTRAR ATRIBUTOS
                MOSTRAR UPGRADE
                UPGRADE ATRIBUTOS
                MOSTRAR EQUIPO
                MOSTRAR INVENTARIO
            PENDIENTE:
                MOSTRAR ESTADISTICAS??
                MOSTRAR PARAMETROS EXTRA
                REVISAR EQUIPAR - DESEQUIPAR.
                MOSTRAR ATRIBUTOS COMBINADOS.
                AÑADIR TALENTOS??
                AÑADIR ORBES ("Modo historia mod parametros segun respuestas")

        ACTIVIDADES:
            LISTO:
                MOSTRAR LISTADO DE ACTIVIDADES
                MOSTRAR DURACION MAXIMA
                INICIAR ACTIVIDAD
                CONTROLAR NO INICIAR SI HAY ACTIVIDAD
                CONTROLAR DURACION MAXIMA
                COMPLETAR ACTIVIDAD
                    RECOMPENSA ACTIVIDAD
            REVISAR:
                CONTROLAR NO INICIAR ESTADO CHARACTER

        COMBATES:
            LISTO:
                MOSTRAR LISTADO DE OPONENTES
                CONTROLAR ESTADO CHARACTER
                INICIAR COMBATE
                MOSTRAR RESULTADO COMBATE
                ACTUALIZAR RECOMPENSAS
            REVISAR:
                MOSTRAR RANKING
            PENDIENTE:
                FILTROS RANKING??
                AMISTAD??

        TIENDA:
            LISTO:
                MOSTRAR OBJETOS TIENDA
                PERMITIR COMPRAR

            PENDIENTE:    
                CORREGIR MOSTRAR INVENTARIO.
                REVISAR COMPRA - VENTA.
                    REVISAR APILAMIENTO OBJETOS
                REVISAR ACTUALIZACION WEBSOCKET.

        MENSAJES:
            LISTO:
                MOSTRAR MENSAJES ENTRADA
                MOSTRAR MENSAJES SALIDA
                ENVIAR NUEVO MENSAJE

            PENDIENTE:
                REVSAR DUPLICADO ENTRANTES-SALIENTES
                REVISAR ELIMINACION.
        
        ATRIBUTOS:
            REVISAR ATRIBUTOS COMBINADOS PERFIL Y COMBATE

        TODO:
            
            AÑADIR GUARIDA
              cofre : minimo de oro que no te podran robar nunca
              almacen: aumenta los espacios del inventario
              entorno : reduce la posibilidad de recibir un ataque ( a la hora de que un 
              oponente busque enemigos tienes una posibilidad de no aparecer en su listado)
              trampas/alarmas :  reduce la posibilidad de recibir un robo.
              (a futuro añadire mesas de crafteo o cosas asi pero por ahora no)
              aguas termales?? : regeneracion de salud
              piedra de mana?? : regeneracion de mana ( no en este juego al menos...)
            AÑADIR EQUIPOS ( ARMADURAS ACCESORIOS)
            AÑADIR CONSUMIBLES
            AÑADIR CREACION PERSONAJE ( NOMBRE - CLASE)
            AÑADIR GREMIOS??
            AÑADIR ESTADOS?? 

        REVISAR: 
            AÑADIR AMISTAD













*/