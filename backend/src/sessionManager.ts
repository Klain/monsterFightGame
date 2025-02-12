//backend\src\sessionManager.js
import jwt from "jsonwebtoken";

// Map para almacenar sesiones activas: userId -> token
const activeSessions: Map<number, string> = new Map();

// Map para usuarios conectados por WebSocket: userId -> socket
const connectedUsers: Map<number, any> = new Map(); // El tipo del socket puede variar según la implementación de WebSockets (ej. Socket.IO).

/**
 * Registra una nueva sesión activa cuando un usuario inicia sesión.
 * @param userId - ID del usuario que inicia sesión
 * @param token - Token JWT del usuario
 */
 export function registerSession(userId: number, refreshToken: string): void {
  activeSessions.set(userId, refreshToken);
  console.log(`Sesión iniciada para el usuario ${userId}`);
}


/**
 * Cierra la sesión de un usuario, eliminándolo de sesiones activas y desconectándolo.
 * @param userId - ID del usuario que cierra sesión
 */
export function logoutUser(userId: number): void {
  activeSessions.delete(userId);

  // Desconecta al usuario si está conectado por WebSocket
  if (connectedUsers.has(userId)) {
    const socket = connectedUsers.get(userId);
    socket.disconnect(true);
    connectedUsers.delete(userId);
  }

  console.log(`Usuario ${userId} ha cerrado sesión.`);
}

/**
 * Verifica si un token sigue siendo válido y está registrado como una sesión activa.
 * @param userId - ID del usuario asociado al token
 * @param token - Token JWT a verificar
 * @returns {boolean} - `true` si el token es válido y está activo; de lo contrario, `false`.
 */
 export async function isSessionValid(userId: number, refreshToken: string): Promise<boolean> {
  try {
    const activeToken = activeSessions.get(userId);

    // Verifica que el token coincida con el registrado
    if (!activeToken || activeToken !== refreshToken) {
      return false;
    }

    // Verifica la validez del token
    jwt.verify(refreshToken, process.env.REFRESH_SECRET!);
    return true;
  } catch (error) {
    console.error(`Error verificando el refresh token para el usuario ${userId}:`, error);
    return false;
  }
}



/**
 * Envía notificaciones en tiempo real a un usuario si está conectado por WebSocket.
 * @param userId - ID del usuario al que se enviará la notificación
 * @param message - Mensaje a enviar
 */
export function sendRealTimeNotification(userId: number, message: string): void {
  if (connectedUsers.has(userId)) {
    const socket = connectedUsers.get(userId);
    socket.emit("notification", message);
  }
}

export { activeSessions, connectedUsers };
