//backend\src\services\webSocketService.ts
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { Inventory } from "../models/inventory.model";
import { isSessionValid } from "../sessionManager";
import { Character } from "../models/character.model";

const connectedUsers = new Map<number, Socket>();

class WebSocketService {
  private io: Server | null = null;
  initialize(io: Server) {
    this.io = io;
    this.io.use(async (socket, next) => {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      console.log(`🔍 [WS Middleware] Token recibido:`, token);
      
      if (!token) {
        console.warn("❌ Token de autenticación requerido.");
        return next(new Error("Token de autenticación requerido"));
      }
    
      try {
        const decoded = jwt.verify(token, process.env.ACCESS_SECRET!) as jwt.JwtPayload;
        console.log(`🔍 [WS Middleware] Token decodificado:`, decoded);
    
        if (typeof decoded === "object" && "id" in decoded) {
          const isValidSession = await isSessionValid(decoded.id, token);
          console.log(`🔍 [WS Middleware] ¿Sesión válida?`, isValidSession);
    
          if (!isValidSession) {
            console.warn("❌ Sesión no válida o expirada.");
            return next(new Error("Sesión no válida o expirada."));
          }
    
          socket.data.userId = decoded.id;
          console.log(`✅ Usuario autenticado en WebSocket: ${socket.data.userId}`);
          next();
        } else {
          console.warn("❌ Token inválido: no contiene un ID de usuario.");
          next(new Error("Token inválido: no contiene un ID de usuario"));
        }
      } catch (error) {
        console.error("❌ Error al verificar el token:", error);
        next(new Error("Token inválido o expirado"));
      }
    });
    
    
    this.io.on("connection", (socket: Socket) => {
      const userId = socket.data.userId;
      if (!userId) {
        console.warn("Conexión rechazada: el userId no está disponible en el socket.");
        socket.disconnect();
        return;
      }

      console.log(`✅ Usuario ${userId} conectado vía WebSocket con ID: ${socket.id}`);

      // 🔹 Registrar al usuario
      this.registerUser(socket, userId);

      // 🔹 Evento para actualizar token sin perder conexión
      socket.on("updateToken", async (newToken) => {
        try {
          const decoded = jwt.verify(newToken, process.env.ACCESS_SECRET!) as jwt.JwtPayload;
          if (typeof decoded === "object" && "id" in decoded) {
            const isValidSession = await isSessionValid(decoded.id, newToken);
            if (!isValidSession) {
              socket.emit("error", { message: "Sesión no válida" });
              socket.disconnect();
              return;
            }
            socket.data.userId = decoded.id;
            console.log(`🔄 Token actualizado para usuario ${decoded.id}`);
            socket.emit("tokenUpdated", { success: true });
          } else {
            socket.emit("error", { message: "Token inválido" });
          }
        } catch (error) {
          socket.emit("error", { message: "Error al verificar el token" });
        }
      });

      // 🔹 Manejar eventos del socket
      socket.on("disconnect", (reason: string) => {
        this.handleDisconnect(userId, reason);
      });

      socket.on("customEvent", (data: any) => {
        console.log(`📩 Evento personalizado recibido de usuario ${userId}:`, data);
      });

      // 🔹 Confirmar conexión exitosa al cliente
      socket.emit("userRegistered", { success: true, userId });
    });
    
  }
  private registerUser(socket: Socket, userId: number): void {
    const existingSocket = connectedUsers.get(userId);
    if (existingSocket && existingSocket.id === socket.id) {
      console.log(`⚠️ Usuario ${userId} ya está registrado con el mismo socket.`);
      return;
    }
    if (existingSocket && existingSocket.id !== socket.id) {
      existingSocket.disconnect(true);
      console.log(`🔄 Usuario ${userId} ya estaba conectado. Desconectando socket anterior.`);
    }
    connectedUsers.set(userId, socket);
    console.log(`✅ Usuario ${userId} registrado en WebSocket con ID: ${socket.id}`);
  }
  private async handleDisconnect(userId: number, reason: string) {
    console.log(`❌ Usuario ${userId} desconectado. Razón: ${reason}`);
    if (reason === "client disconnect") {
      connectedUsers.delete(userId);
      console.log(`🛑 Desconexión manual, usuario ${userId} eliminado.`);
      return;
    }
    setTimeout(() => {
      if (!connectedUsers.has(userId)) {
        console.log(`🔻 Usuario ${userId} sigue desconectado. Eliminando del sistema.`);
        connectedUsers.delete(userId);
      } else {
        console.log(`🔄 Usuario ${userId} reconectado exitosamente.`);
      }
    }, 5000);
  }
  notifyUser(userId: number, event: string, data: any) {
    console.log("🟢 Usuarios conectados actualmente:", Array.from(connectedUsers.keys()));
    const socket = connectedUsers.get(userId);
    if (socket) {
      socket.emit(event, data);
      console.log(`📢 Notificación enviada a usuario ${userId}:`, event, data);
    } else {
      console.warn(`⚠️ Usuario ${userId} no está conectado. No se pudo enviar:`, event, data);
    }
  }
  notifyAll(event: string, data: any) {
    if (this.io) {
      this.io.emit(event, data);
      console.log(`📢 Notificación enviada a todos los usuarios:`, event, data);
    }
  }

  characterRefresh(userId: number, characterData: any) {
    this.notifyUser(userId, "characterRefresh", characterData);
  }
  characterRefreshBuilder(character: Character, activity: any | null, inventory?: Inventory | null): any {
    return {
      ...character?.wsr(),
      ...(character ? character.wsrActivities() : { activity: null }),
      ...(inventory ? inventory.wsr() : {}),
    };
  }
  characterNewMessageSend(userId: number, characterData: any) {
    this.notifyUser(userId, "characterNewMessageSend", characterData);
  }
  characterNewMessageRecived(userId: number, characterData: any) {
    this.notifyUser(userId, "characterNewMessageRecived", characterData);
  }
}
const webSocketService = new WebSocketService();
export default webSocketService;
