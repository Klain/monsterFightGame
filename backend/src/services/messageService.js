// backend/src/services/messageService.js
const { db } = require("../database");

/**
 * Envía un mensaje de un jugador a otro.
 * @param {number} sender_id - ID del usuario que envía el mensaje.
 * @param {number} receiver_id - ID del usuario que recibe el mensaje.
 * @param {string} subject - Asunto del mensaje.
 * @param {string} body - Cuerpo del mensaje.
 */
async function sendMessage(sender_id, receiver_id, subject, body) {
  try {
    await db.run(
      `INSERT INTO messages (sender_id, receiver_id, subject, body) VALUES (?, ?, ?, ?)`,
      [sender_id, receiver_id, subject, body]
    );

    return { message: "Mensaje enviado con éxito." };
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
    throw new Error("Error interno al enviar mensaje.");
  }
}

/**
 * Obtiene los mensajes de un usuario específico.
 * @param {number} user_id - ID del usuario que recibe los mensajes.
 */
async function getMessages(user_id) {
  try {
    const messages = await db.all(
      `SELECT * FROM messages WHERE receiver_id = ? ORDER BY timestamp DESC`,
      [user_id]
    );
    return messages;
  } catch (error) {
    console.error("Error al obtener mensajes:", error);
    throw new Error("Error interno al obtener mensajes.");
  }
}

/**
 * Marca un mensaje como leído.
 * @param {number} message_id - ID del mensaje a marcar como leído.
 */
async function markMessageAsRead(message_id) {
  try {
    const message = await db.get(`SELECT * FROM messages WHERE id = ?`, [message_id]);

    if (!message) {
      return { error: "Mensaje no encontrado." };
    }

    await db.run(`UPDATE messages SET read = TRUE WHERE id = ?`, [message_id]);

    return { message: "Mensaje marcado como leído." };
  } catch (error) {
    console.error("Error al marcar mensaje como leído:", error);
    throw new Error("Error interno al marcar mensaje como leído.");
  }
}

module.exports = { sendMessage, getMessages, markMessageAsRead };
