/*
DATABASE.TS
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
DATABASESERVICE.TS
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
*/
/*
  CHARACTER.MODEL.TS
    private _friendships: Friendship[] = [];
    constructor > this._friendships = data.friendships ?? [];
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
    get friendships(): Friendship[] { return this._friendships; }
    set friendships(value: Friendship[]) { this._friendships = value; this.updateCharacter(); }
*/
/*
CacheDataService
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
            PENDIENTE:
                MOSTRAR RANKING
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
            AÑADIR AMISTAD
            AÑADIR GUARIDA
            AÑADIR EQUIPOS ( ARMADURAS ACCESORIOS)
            AÑADIR CONSUMIBLES
            AÑADIR CREACION PERSONAJE ( NOMBRE - CLASE)
            AÑADIR GREMIOS??
            AÑADIR ESTADOS?? 













*/