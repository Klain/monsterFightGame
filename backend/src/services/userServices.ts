import { db } from "../database";


/**
 * Obtiene un usuario por nombre de usuario.
 * @param username - Nombre de usuario
 * @returns Una promesa que resuelve con los datos del usuario o null si no se encuentra
 */
 export async function getUserByUsername(username: string): Promise<any | null> {
    return new Promise((resolve, reject) => {
      db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
        if (err) {
          return reject(err);
        }
        resolve(row || null);
      });
    });
  }
  
  /**
   * Crea un nuevo usuario con contraseña encriptada.
   * @param username - Nombre de usuario
   * @param hashedPassword - Contraseña encriptada
   * @returns Una promesa que resuelve con el ID del nuevo usuario
   */
  export async function createUser(username: string, hashedPassword: string): Promise<{ id: number }> {
    return new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [username, hashedPassword],
        function (err) {
          if (err) {
            return reject(err);
          }
          resolve({ id: this.lastID });
        }
      );
    });
  }