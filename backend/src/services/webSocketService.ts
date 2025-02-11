//backend\src\services\webSocketService.ts
import { Server, Socket } from "socket.io";
import { Activity } from "../models/activity.model";
import { Character } from "../models/character.model";
import { connectedUsers } from "../sessionManager";

class WebSocketService {
  private io: Server | null = null;

  // Inicializar WebSocketService
  initialize(io: Server) {
    this.io = io;
  }

  // Notificar a un usuario específico
  notifyUser(userId: number, event: string, data: any) {
    const socket = connectedUsers.get(userId);
    if (socket) {
      socket.emit(event, data);
      console.log(`Notificación enviada a usuario ${userId}:`, event, data);
    } else {
      console.warn(`Usuario ${userId} no está conectado. No se pudo enviar:`, event);
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

  characterRefreshBuilder(character: Character, activity: Activity | null): any {
    return {
      ...character?.wsr(),
      ...(activity ? activity.wsr() : { activity: null }),
    };
  }
}

const webSocketService = new WebSocketService();
export default webSocketService;

