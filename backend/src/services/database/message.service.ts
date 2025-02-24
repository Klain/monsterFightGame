import { db } from "../../../data/database";

export interface dbMessage {
  id: number;
  sender_id: number;
  sender_name: string;
  receiver_id: number;
  receiver_name: string;
  subject: string;
  body: string;
  timestamp: string; 
  read: boolean;
}

class MessageService {
  static async getAllMessages(): Promise<dbMessage[] | null> {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM messages;`;
      db.all(query, [], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? row as dbMessage[] : null);
        }
      });
    });
  }
  static async createMessage(message: dbMessage): Promise<number> {
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
  static async getMessagesByUserId(characterId: number): Promise<dbMessage[]> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM messages WHERE sender_id = ? OR receiver_id = ? ORDER BY timestamp DESC;
      `;
      db.all(query, [characterId, characterId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as dbMessage[]);
        }
      });
    });
  }
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
