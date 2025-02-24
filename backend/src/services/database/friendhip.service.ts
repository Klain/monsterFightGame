import { db } from "../../database";

export interface dbFriendship {
  id:number,
  user_id_1: number,
  user_id_2: number,
  active: boolean
}

class FriendshipService {
  static async createFriendship(friendship: dbFriendship): Promise<number> {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO friendship (user_id_1, user_id_2)
        VALUES (?, ?);
      `;
      const params = [
        friendship.user_id_1,
        friendship.user_id_2
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
  static async getUserFriendships(idUser1: number): Promise<dbFriendship[]> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM friendship 
        WHERE (user_id_1 = ? OR user_id_2 = ?)
        AND active = 1
        ;`;
      db.all(query, [idUser1,idUser1], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as dbFriendship[]);
        }
      });
    });
  }
  static async getUserFriendsRequest(idUser1: number): Promise<dbFriendship[]> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM friendship 
        WHERE (user_id_1 = ? OR user_id_2 = ?)
        AND active = 0
        ;`;
      db.all(query, [idUser1,idUser1], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as dbFriendship[]);
        }
      });
    });
  }
  static async updateFriendship(updatedFriendship: dbFriendship): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE friendship SET active = ?
        WHERE user_id_1 = ? AND user_id_2 = ?;
      `;

      const params = [
        updatedFriendship.active,
        updatedFriendship.user_id_1,
        updatedFriendship.user_id_2
      ];

      db.run(query, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }
  static async deleteFriendship(updatedFriendship: dbFriendship): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const query = `
        DELETE FROM friendship 
        WHERE id = ?;
      `;
      const params = [ 
        updatedFriendship.id, 
      ];
      db.run(query, params , function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }
}

export default FriendshipService;
