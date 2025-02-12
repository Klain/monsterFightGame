//backend\src\sessionManager.js
import NodeCache from "node-cache";

const sessionCache = new NodeCache({
  stdTTL: 604800, // 7 días (en segundos)
  checkperiod: 3600, // Verificar sesiones inactivas cada 1 hora
});

export const registerSession = (userId: number, refreshToken: string): void => {
  try {
    const sessions = sessionCache.get<string[]>(userId.toString()) || [];
    
    // Guardar el nuevo token de forma única
    const updatedSessions = [...sessions, refreshToken];
    sessionCache.set(userId.toString(), updatedSessions);
    console.log(`Sesión registrada para usuario ${userId}`);
  } catch (error) {
    console.error("Error al registrar la sesión:", error);
    throw new Error("No se pudo registrar la sesión.");
  }
};

export const logoutUser = (userId: number): void => {
  try {
    sessionCache.del(userId.toString());
    console.log(`Sesión eliminada para usuario ${userId}`);
  } catch (error) {
    console.error("Error al cerrar la sesión:", error);
    throw new Error("No se pudo cerrar la sesión.");
  }
};

export const isSessionValid = async (userId: number, refreshToken: string): Promise<boolean> => {
  try {
    const sessions = sessionCache.get<string[]>(userId.toString()) || [];
    return sessions.includes(refreshToken);
  } catch (error) {
    console.error("Error al validar la sesión:", error);
    throw new Error("Error al comprobar la validez de la sesión.");
  }
};

export const revokeSession = async (userId: number, refreshToken: string): Promise<void> => {
  try {
    const sessions = sessionCache.get<string[]>(userId.toString()) || [];
    const updatedSessions = sessions.filter((token:any) => token !== refreshToken);

    if (updatedSessions.length === 0) {
      sessionCache.del(userId.toString()); // Eliminar la entrada si no quedan tokens
    } else {
      sessionCache.set(userId.toString(), updatedSessions);
    }
    console.log(`Refresh token revocado para usuario ${userId}`);
  } catch (error) {
    console.error("Error al revocar la sesión:", error);
    throw new Error("No se pudo revocar la sesión.");
  }
};

export const getActiveSessions = (userId: number): string[] => {
  try {
    return sessionCache.get<string[]>(userId.toString()) || [];
  } catch (error) {
    console.error("Error al obtener sesiones activas:", error);
    return [];
  }
};
