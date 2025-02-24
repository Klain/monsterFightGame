import { db } from "../../../data/database";

export interface dbUser{
  id:number,
  username:string,
  password:string,
  last_online:string,
}

class UserService {
  static async getUserByUsername(username: string): Promise<dbUser | null> {
    return new Promise((resolve, reject) => {
      db.get("SELECT * FROM users WHERE username = ?", [username], (err, row:dbUser) => {
        if (err) {
          return reject(err);
        }
        resolve(row || null);
      });
    });
  }
  static async getUserById(userId: number): Promise<dbUser | null> {
    return new Promise((resolve, reject) => {
      db.get("SELECT * FROM users WHERE id = ?", [userId], (err, row:dbUser) => {
        if (err) {
          return reject(err);
        }
        resolve(row || null);
      });
    });
  }
  static async getAllUsers(): Promise<dbUser[]> {
    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM users", [], (err: any, rows:dbUser[]) => {
        if (err) {
          return reject(err);
        }
        resolve(rows || []);
      });
    });
  }
  static async updateUser(updatedUser: dbUser): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE users SET
        username = ?, password = ?, last_online = ?
        WHERE id = ?;
      `;
  
      const params = [
        updatedUser.username,
        updatedUser.password,
        updatedUser.last_online,
        updatedUser.id
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
  static async createUser(user: dbUser): Promise<number> {
    return new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [user.username, user.password],
        function (err) {
          if (err) {
            return reject(err);
          }
          resolve(this.lastID);
        }
      );
    });
  }
  static async deleteUser(userId: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM users WHERE id = ?;`;
      db.run(query, [userId], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }
}
export default UserService
  