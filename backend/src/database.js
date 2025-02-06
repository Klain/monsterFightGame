//backend\src\database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../data/monsterFight.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err);
  } else {
    console.log('Conectado a la base de datos SQLite.');
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
      class TEXT NOT NULL,
      level INTEGER DEFAULT 1,
      currentXp INTEGER DEFAULT 0,
      totalXp INTEGER DEFAULT 0,
      currentGold INTEGER DEFAULT 0,
      totalGold INTEGER DEFAULT 0,
      health INTEGER DEFAULT 100,
      attack INTEGER DEFAULT 10,
      defense INTEGER DEFAULT 5,
      upgrade_points INTEGER DEFAULT 0,
      last_fight TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Tabla de batallas
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

  // Tabla de actividades (trabajos, entrenamiento, sanación)
  db.run(`
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      character_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      start_time TIMESTAMP NOT NULL,
      duration INTEGER NOT NULL, -- En minutos
      reward_xp INTEGER NOT NULL,
      reward_gold INTEGER NOT NULL,
      completed BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
    )
  `);

  // **NUEVA**: Tabla de tienda (items disponibles para comprar)
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

  // **NUEVA**: Tabla de relación entre personajes e items (inventario)
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

  // **NUEVA**: Tabla de mensajes entre jugadores
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

// Función para obtener un usuario por nombre de usuario
async function getUserByUsername(username) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
      if (err) reject(err);
      resolve(row);
    });
  });
}

// Función para crear un nuevo usuario con contraseña encriptada
async function createUser(username, hashedPassword) {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, hashedPassword],
      function (err) {
        if (err) reject(err);
        resolve({ id: this.lastID });
      }
    );
  });
}

// Exportar las funciones para usarlas en authRoutes.js
module.exports = {
  db,
  getUserByUsername,
  createUser,
};
