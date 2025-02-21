//backend\src\services\webSocketService.ts
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { Inventory } from "../models/inventory.model";

// Map para rastrear usuarios conectados
const connectedUsers = new Map<number, Socket>();

class WebSocketService {
  private io: Server | null = null;

  // Inicializar el servicio WebSocket
  initialize(io: Server) {
    this.io = io;

    // Middleware para autenticar conexiones WebSocket
    this.io.use((socket, next) => {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        return next(new Error("Token de autenticación requerido"));
      }
      try {
        const decoded = jwt.verify(token, process.env.ACCESS_SECRET!) as jwt.JwtPayload;
        if (typeof decoded === "object" && "id" in decoded) {
          socket.data.userId = decoded.id; // Almacenar userId en los datos del socket
          next();
        } else {
          next(new Error("Token inválido: no contiene un ID de usuario"));
        }
      } catch (error) {
        next(new Error("Token inválido o expirado"));
      }
    });

    // Configurar eventos de conexión
    this.io.on("connection", (socket: Socket) => {
      const userId = socket.data.userId;
      if (!userId) {
        console.warn("Conexión rechazada: el userId no está disponible en el socket.");
        socket.disconnect();
        return;
      }
    
      console.log(`Usuario ${userId} intentando conectar vía WebSocket con ID: ${socket.id}`);
    
      // Registrar al usuario
      this.registerUser(socket, userId);
    
      // Manejar eventos del socket
      socket.on("disconnect", (reason: string) => {
        this.handleDisconnect(userId, reason);
      });
    
      socket.on("customEvent", (data: any) => {
        console.log(`Evento personalizado recibido de usuario ${userId}:`, data);
      });
    
      // Confirmar al cliente que la conexión fue exitosa
      socket.emit("connected", { success: true, userId });
    });    
  }

  private registerUser(socket: Socket, userId: number): void {
    // Desconectar cualquier socket previo
    if (connectedUsers.has(userId)) {
      const oldSocket = connectedUsers.get(userId);
      oldSocket?.disconnect(true);
      console.log(`Usuario ${userId} ya estaba conectado. Desconectando socket anterior.`);
    }
  
    // Registrar el nuevo socket
    connectedUsers.set(userId, socket);
    console.log(`Usuario ${userId} registrado en WebSocket con ID: ${socket.id}`);
  }
  
  // Manejar desconexión de usuarios
  private handleDisconnect(userId: number, reason: string) {
    if (connectedUsers.has(userId)) {
      connectedUsers.delete(userId);
      console.log(`Usuario ${userId} desconectado. Razón: ${reason}`);
    } else {
      console.log(`Desconexión de socket no registrado. Razón: ${reason}`);
    }
  }

  // Notificar a un usuario específico
  notifyUser(userId: number, event: string, data: any) {
    console.log("Usuarios conectados actualmente:", Array.from(connectedUsers.keys())); // DEPURAR
  
    const socket = connectedUsers.get(userId);
    if (socket) {
      socket.emit(event, data);
      console.log(`Notificación enviada a usuario ${userId}:`, event, data);
    } else {
      console.warn(`Usuario ${userId} no está conectado. No se pudo enviar:`, event, data);
    }
  }
  

  // Notificar a todos los usuarios conectados
  notifyAll(event: string, data: any) {
    if (this.io) {
      this.io.emit(event, data);
      console.log(`Notificación enviada a todos los usuarios:`, event, data);
    }
  }

  // Notificar un cambio en el personaje de un usuario
  characterRefresh(userId: number, characterData: any) {
    this.notifyUser(userId, "characterRefresh", characterData);
  }
  // Construir los datos para la notificación de refresh
  characterRefreshBuilder(character: any, activity: any | null, inventory?:Inventory | null): any {
    return {
      ...character?.wsr(),
      ...(activity ? activity.wsr() : { activity: null }),
      ...(inventory ? inventory.wsr() : {} ),
    };
  }

  // Notificar un cambio en el personaje de un usuario
  characterNewMessageSend(userId: number, characterData: any) {
    this.notifyUser(userId, "characterNewMessageSend", characterData);
  }
  characterNewMessageRecived(userId: number, characterData: any) {
    this.notifyUser(userId, "characterNewMessageRecived", characterData);
  }
}

const webSocketService = new WebSocketService();
export default webSocketService;
