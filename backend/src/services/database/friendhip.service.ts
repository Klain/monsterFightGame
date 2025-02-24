import { db } from "../../database";

export interface dbFriendship {
  idUser1: number,
  idUser2: number,
  active: number
}

class FriendshipService {
  static async createFriendship(friendship: dbFriendship): Promise<number> {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO friendship (idUser1, idUser2)
        VALUES (?, ?);
      `;
      const params = [
        friendship.idUser1,
        friendship.idUser2
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
  static async getUserFriends(idUser1: number): Promise<dbFriendship[]> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM friendship 
        WHERE (idUser1 = ? OR idUser2 = ?)
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
  static async getUserFriendsReques(idUser1: number): Promise<dbFriendship[]> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM friendship 
        WHERE (idUser1 = ? OR idUser2 = ?)
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
        WHERE idUser1 = ? AND idUser2 = ?;
      `;

      const params = [
        updatedFriendship.active,
        updatedFriendship.idUser1,
        updatedFriendship.idUser2
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
        WHERE idUser1 = ? AND idUser2 = ?;
      `;
      const params = [ 
        updatedFriendship.idUser1, 
        updatedFriendship.idUser2
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
