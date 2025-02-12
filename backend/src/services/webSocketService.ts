//backend\src\services\webSocketService.ts
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { Activity } from "../models/activity.model";
import { Character } from "../models/character.model";
import { connectedUsers } from "../sessionManager";

class WebSocketService {
  private io: Server | null = null;

  // Inicializar WebSocketService con la instancia de Socket.IO
  initialize(io: Server) {
    this.io = io;

    // Configurar eventos de conexión
    this.io.on("connection", (socket: Socket) => {
      console.log("Un usuario ha intentado conectar vía WebSockets:", socket.id);

      // Evento de registro del usuario
      socket.on("register", (token: string) => {
        this.handleRegister(socket, token);
      });

      // Evento de desconexión
      socket.on("disconnect", () => {
        this.handleDisconnect(socket);
      });
    });
  }

  // Manejar el registro de usuarios
  private handleRegister(socket: Socket, token: string) {
    try {
      // Decodificar el token usando ACCESS_SECRET
      const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.ACCESS_SECRET!) as jwt.JwtPayload;
  
      if (typeof decoded === "object" && "id" in decoded) {
        const userId = decoded.id as number;
  
        // Verificar si el usuario ya estaba conectado y desconectar el socket previo
        if (connectedUsers.has(userId)) {
          const oldSocket = connectedUsers.get(userId);
          oldSocket?.disconnect(true);
          console.log(`Usuario ${userId} ya estaba conectado. Desconectando el socket anterior.`);
        }
  
        // Registrar el nuevo socket
        connectedUsers.set(userId, socket);
        console.log(`Usuario ${userId} registrado en WebSockets.`);
  
        // Confirmar al cliente que el registro fue exitoso
        socket.emit("registered", { success: true, userId });
      } else {
        throw new Error("El token no contiene un ID de usuario válido.");
      }
    } catch (error) {
      console.error("Error en autenticación WebSockets:", (error as Error).message);
      socket.emit("error", { message: "Autenticación fallida" });
      socket.disconnect();
    }
  }
  

  // Manejar la desconexión de usuarios
  private handleDisconnect(socket: Socket) {
    let disconnectedUserId: number | null = null;
  
    connectedUsers.forEach((value: Socket, key: number) => {
      if (value === socket) {
        disconnectedUserId = key;
        connectedUsers.delete(key);
      }
    });
  
    if (disconnectedUserId !== null) {
      console.log(`Usuario ${disconnectedUserId} desconectado.`);
    } else {
      console.log("Socket desconectado pero no estaba asociado a ningún usuario registrado.");
    }
  }
  

  // Notificar a un usuario específico
  notifyUser(userId: number, event: string, data: any) {
    const socket = connectedUsers.get(userId);
    if (socket) {
      socket.emit(event, data);
      console.log(`Notificación enviada a usuario ${userId}:`, event, data);
    } else {
      console.warn(`Usuario ${userId} no está conectado. Intento fallido de enviar:`, event, data);
      // Opcional: Enviar a una cola de mensajes o guardar la notificación para reintento posterior
    }
  }
  

  // Notificar a todos los usuarios conectados
  notifyAll(event: string, data: any) {
    if (this.io) {
      this.io.emit(event, data);
      console.log(`Notificación enviada a todos los usuarios:`, event, data);
    }
  }

  // Notificar un cambio en el character de un usuario
  characterRefresh(userId: number, characterData: any) {
    this.notifyUser(userId, "characterRefresh", characterData);
  }

  // Constructor para enviar datos relacionados con el personaje y la actividad
  characterRefreshBuilder(character: Character, activity: Activity | null): any {
    return {
      ...character?.wsr(),
      ...(activity ? activity.wsr() : { activity: null }),
    };
  }
}

const webSocketService = new WebSocketService();
export default webSocketService;
