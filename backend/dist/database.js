"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const dbPath = path_1.default.resolve(__dirname, "../data/monsterFight.db");
const db = new sqlite3_1.default.Database(dbPath, (err) => {
    if (err) {
        console.error("Error al conectar con la base de datos:", err);
    }
    else {
        console.log("Conectado a la base de datos SQLite.");
    }
});
exports.db = db;
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
    
      -- Atributos
      strength INTEGER DEFAULT 1,
      endurance INTEGER DEFAULT 1,
      constitution INTEGER DEFAULT 1,
      precision INTEGER DEFAULT 1,
      agility INTEGER DEFAULT 1,
      vigor INTEGER DEFAULT 1,
      spirit INTEGER DEFAULT 1,
      willpower INTEGER DEFAULT 1,
      arcane INTEGER DEFAULT 1,
    
      -- Status
      current_health INTEGER DEFAULT 100,
      total_health INTEGER DEFAULT 100,
      current_stamina INTEGER DEFAULT 100,
      total_stamina INTEGER DEFAULT 100,
      current_mana INTEGER DEFAULT 100,
      total_mana INTEGER DEFAULT 100,
    
      -- Currencies
      current_xp INTEGER DEFAULT 0,
      total_xp INTEGER DEFAULT 0,
      current_gold INTEGER DEFAULT 0,
      total_gold INTEGER DEFAULT 0,
    
      -- Otros
      upgrade_points INTEGER DEFAULT 0,
      last_fight TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )  
  `);
    db.run(`
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      character_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      start_time TIMESTAMP NOT NULL,
      duration INTEGER NOT NULL,
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
