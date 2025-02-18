// backend/src/services/messageService.js
import { Message } from "../models/message.model";
import CacheDataService from "./CacheDataService";

/**
 * Envía un mensaje de un jugador a otro.
 * @param message - objeto message del usuario que envía el mensaje.
 */
async function sendMessage( message : Message ):Promise<Message>{
  try {
    const result = await CacheDataService.run(
      `INSERT INTO messages (sender_id, receiver_id, sender_name, receiver_name, subject, body, timestamp) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [message.sender_id, message.receiver_id, message.sender_name, message.receiver_name, message.subject, message.body, message.timestamp]
    );
    const insertedMessage = await CacheDataService.get<Partial<Message>>(
      `SELECT * FROM messages WHERE id = ?`,
      [result.lastID]
    );
    if(insertedMessage){
      return Message.parseDb(insertedMessage);
    }else{
      throw new Error("No se encuentra el mensaje recien insertado.");
    }
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
    throw new Error("Error interno al enviar mensaje.");
  }
}
/**
 * Obtiene los mensajes de un personaje específico.
 * @param character_id - ID del personaje que recibe los mensajes.
 * @param page - ID del personaje que recibe los mensajes.
 * @param limit - ID del personaje que recibe los mensajes.

 */
 async function getMessages(character_id: number, page: number = 1, limit: number = 20, recived:boolean=true): Promise<Message[]> {
  try {
    const offset = (page - 1) * limit; 
    const query = recived?
     `SELECT * FROM messages WHERE receiver_id = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?`
    :`SELECT * FROM messages WHERE sender_id = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?`;
    
    const messages = await CacheDataService.all<Message>(
      query,
      [character_id, limit, offset]
    );

    return messages;
  } catch (error) {
    console.error("❌ Error al obtener mensajes:", error);
    throw new Error("Error interno al obtener mensajes.");
  }
}

async function getCountMessages(character_id: number): Promise<number> {
  try {
    const totalMessages = await CacheDataService.get<number>(
      `SELECT COUNT(*) as total FROM messages WHERE receiver_id = ?`,
      [character_id]
    );

    return totalMessages || 0;
  } catch (error) {
    console.error("❌ Error al obtener el numero de mensajes:", error);
    throw new Error("Error interno al obtener mensajes.");
  }
}
/**
 * Marca un mensaje como leído.
 * @param message - objeto message del usuario que envía el mensaje.
 */
async function markMessageAsRead( message : Message): Promise<{ message: string } | { error: string }> {
  try {
    await CacheDataService.run(`UPDATE messages SET read = TRUE WHERE id = ?`, [message.id]);
    return { message: "Mensaje marcado como leído." };

  } catch (error) {
    console.error("Error al marcar mensaje como leído:", error);
    throw new Error("Error interno al marcar mensaje como leído.");
  }
}

/**
 * Elimina un mensaje específico por su ID.
 * @param message_id - ID del mensaje que se desea eliminar.
 */
 async function deleteMessage(message_id: number): Promise<{ message: string }> {
  try {
    const result = await CacheDataService.run(
      `DELETE FROM messages WHERE id = ?`,
      [message_id]
    );

    if (result.changes === 0) {
      return { message: "El mensaje no existe o ya fue eliminado." };
    }

    return { message: "Mensaje eliminado exitosamente." };
  } catch (error) {
    console.error("Error al eliminar el mensaje:", error);
    throw new Error("Error interno al eliminar el mensaje.");
  }
}


async function getMessageById(message_id:number):Promise<Message>{
  const message = await CacheDataService.get<any>(
    `SELECT * FROM messages WHERE id = ?`,
    [message_id]
  );
  return Message.parseDb(message);
}

export { sendMessage, getMessages, markMessageAsRead,getMessageById,getCountMessages,deleteMessage };
