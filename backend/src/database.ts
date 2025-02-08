import sqlite3 from "sqlite3";
import path from "path";

const dbPath = path.resolve(__dirname, "../data/monsterFight.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error al conectar con la base de datos:", err);
  } else {
    console.log("Conectado a la base de datos SQLite.");
  }
});

db.serialize(() => {
  // Tabla de usuarios
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )
  `);

  // Tabla de personajes
  db.run(`
    CREATE TABLE IF NOT EXISTS characters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      faction TEXT NOT NULL,
      class INTEGER DEFAULT 1,
      level INTEGER DEFAULT 1,

      STRENGTH INTEGER DEFAULT 1,
      ENDURANCE INTEGER DEFAULT 1,
      CONSTITUTION INTEGER DEFAULT 1,
      PRECISION INTEGER DEFAULT 1,
      AGILITY INTEGER DEFAULT 1,
      VIGOR INTEGER DEFAULT 1,
      SPIRIT INTEGER DEFAULT 1,
      WILLPOWER INTEGER DEFAULT 1,
      ARCANE INTEGER DEFAULT 1,

      upgrade_points INTEGER DEFAULT 0,
      last_fight TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS status (
      character_id INTEGER PRIMARY KEY,
      currentHealth INTEGER DEFAULT 100,
      totalHealth INTEGER DEFAULT 100,
      currentStamina INTEGER DEFAULT 100,
      totalStamina INTEGER DEFAULT 100,
      currentMana INTEGER DEFAULT 100,
      totalMana INTEGER DEFAULT 100,
      FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS currencies (
      character_id INTEGER PRIMARY KEY,
      currentXp INTEGER DEFAULT 0,
      totalXp INTEGER DEFAULT 0,
      currentGold INTEGER DEFAULT 0,
      totalGold INTEGER DEFAULT 0,
      FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      character_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      start_time TIMESTAMP NOT NULL,
      duration INTEGER NOT NULL,
      reward_xp INTEGER NOT NULL,
      reward_gold INTEGER NOT NULL,
      completed BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS battles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      attacker_id INTEGER NOT NULL,
      defender_id INTEGER NOT NULL,
      winner_id INTEGER NOT NULL,
      gold_won INTEGER,
      xp_won INTEGER,
      last_attack TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (attacker_id) REFERENCES characters(id),
      FOREIGN KEY (defender_id) REFERENCES characters(id),
      FOREIGN KEY (winner_id) REFERENCES characters(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT CHECK(type IN ('weapon', 'armor', 'accessory')) NOT NULL,
      attack_bonus INTEGER DEFAULT 0,
      defense_bonus INTEGER DEFAULT 0,
      price INTEGER NOT NULL,
      rarity TEXT CHECK(rarity IN ('common', 'rare', 'legendary')) NOT NULL,
      level_required INTEGER DEFAULT 1
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS character_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      character_id INTEGER NOT NULL,
      item_id INTEGER NOT NULL,
      equipped BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
      FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      receiver_id INTEGER NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      read BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
});

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

export { db };
