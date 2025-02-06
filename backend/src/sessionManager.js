const jwt = require("jsonwebtoken");
require("dotenv").config();

const activeSessions = new Map();
const connectedUsers = new Map(); // Mapa de usuarios conectados a WebSockets

/**
 * Registra una nueva sesión activa cuando un usuario inicia sesión.
 */
function registerSession(userId, token) {
  activeSessions.set(userId, token);
  console.log(`Sesión iniciada para el usuario ${userId}`);
}

/**
 * Cierra la sesión de un usuario, eliminándolo de sesiones activas y desconectándolo.
 */
function logoutUser(userId) {
  activeSessions.delete(userId);
  if (connectedUsers.has(userId)) {
    connectedUsers.get(userId).disconnect(true);
    connectedUsers.delete(userId);
  }
  console.log(`Usuario ${userId} ha cerrado sesión.`);
}

/**
 * Envía notificaciones en tiempo real a un usuario si está conectado.
 */
function sendRealTimeNotification(userId, message) {
  if (connectedUsers.has(userId)) {
    connectedUsers.get(userId).emit("notification", message);
  }
}

module.exports = {
  registerSession,
  logoutUser,
  sendRealTimeNotification,
  connectedUsers,
};
