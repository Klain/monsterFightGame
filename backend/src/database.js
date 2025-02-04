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
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      )
    `);
  });

db.serialize(() => {
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
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
});

db.serialize(() => {
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
});

db.serialize(() => {
  db.run(`
    CREATE TABLE activities (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      start_time TIMESTAMP NOT NULL,
      duration INTEGER NOT NULL, -- En minutos
      reward_xp INTEGER NOT NULL,
      reward_gold INTEGER NOT NULL,
      completed BOOLEAN DEFAULT FALSE
    )
  `);
});



  
module.exports = db;
