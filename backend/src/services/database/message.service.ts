import { db } from "../../database";

export interface dbMessage {
  id?: number;
  sender_id: number;
  sender_name: string;
  receiver_id: number;
  receiver_name: string;
  subject: string;
  body: string;
  timestamp: string; // Fecha en formato ISO
  read: boolean;
}

// 📌 Servicio para manejar los mensajes en la base de datos
class MessageService {
  // ✅ Enviar un nuevo mensaje
  static async sendMessage(message: dbMessage): Promise<number> {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO messages (sender_id, sender_name, receiver_id, receiver_name, subject, body, timestamp, read)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
      `;

      const params = [
        message.sender_id,
        message.sender_name,
        message.receiver_id,
        message.receiver_name,
        message.subject,
        message.body,
        message.timestamp,
        message.read ? 1 : 0
      ];

      db.run(query, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  // ✅ Obtener un mensaje por ID
  static async getMessageById(messageId: number): Promise<dbMessage | null> {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM messages WHERE id = ?;`;
      db.get(query, [messageId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? row as dbMessage : null);
        }
      });
    });
  }

  // ✅ Obtener todos los mensajes de un usuario (enviados y recibidos)
  static async getMessagesByUserId(userId: number): Promise<dbMessage[]> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM messages WHERE sender_id = ? OR receiver_id = ? ORDER BY timestamp DESC;
      `;
      db.all(query, [userId, userId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as dbMessage[]);
        }
      });
    });
  }

  // ✅ Marcar un mensaje como leído
  static async markMessageAsRead(messageId: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE messages SET read = 1 WHERE id = ?;
      `;

      db.run(query, [messageId], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  // ✅ Eliminar un mensaje por ID
  static async deleteMessage(messageId: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM messages WHERE id = ?;`;
      db.run(query, [messageId], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }
}

export default MessageService;
