//backend\src\sessionManager.js
import NodeCache from "node-cache";
import jwt from "jsonwebtoken";

export const SESSION_STDTTL = 604800;

const sessionCache = new NodeCache({
  stdTTL: SESSION_STDTTL, 
  checkperiod: 3600,
});
export const registerSession = (userId: number, refreshToken: string): void => {
  try {
    let sessions = sessionCache.get<string[]>(userId.toString()) || [];
    if (!sessions.includes(refreshToken)) {
      sessions.push(refreshToken);
      sessionCache.set(userId.toString(), sessions);
      console.log(`✅ Sesión registrada para usuario ${userId}:`, sessions);
    }
  } catch (error) {
    console.error("❌ Error al registrar la sesión:", error);
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

export const isRefreshTokenValid = async (userId: number, refreshToken: string): Promise<boolean> => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET!) as jwt.JwtPayload;
    return decoded.id === userId; 
  } catch (error) {
    console.error("❌ [SessionManager] Error al validar el refresh token:", error);
    return false;
  }
};

export const isSessionValid = async (userId: number, accessToken: string): Promise<boolean> => {
  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_SECRET!) as jwt.JwtPayload;
    return decoded.id === userId;
  } catch (error) {
    console.error("❌ [SessionManager] Error al validar la sesión:", error);
    return false;
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