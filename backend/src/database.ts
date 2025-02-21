import sqlite3 from "sqlite3";
import path from "path";
import { EffectType } from "./constants/enums";
import ServerConfig from "./constants/serverConfig";

const dbPath = path.resolve(__dirname, "../data/monsterFight.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Error al conectar con la base de datos:", err);
  } else {
    console.log("✅ Conectado a la base de datos SQLite.");
  }
});

function runTables(): Promise<void> {
  console.log("🛠 Creando tablas...");
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("DROP TABLE IF EXISTS users;");
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          last_online TIMESTAMP
        )
      `);
      db.run("DROP TABLE IF EXISTS characters;");
      db.run(`
        CREATE TABLE IF NOT EXISTS characters (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          faction TEXT NOT NULL,
          class INTEGER DEFAULT 1,
          level INTEGER DEFAULT 1,
          strength INTEGER DEFAULT 1,
          endurance INTEGER DEFAULT 1,
          constitution INTEGER DEFAULT 1,
          precision INTEGER DEFAULT 1,
          agility INTEGER DEFAULT 1,
          vigor INTEGER DEFAULT 1,
          spirit INTEGER DEFAULT 1,
          willpower INTEGER DEFAULT 1,
          arcane INTEGER DEFAULT 1,
          current_health INTEGER DEFAULT 100,
          total_health INTEGER DEFAULT 100,
          current_stamina INTEGER DEFAULT 100,
          total_stamina INTEGER DEFAULT 100,
          current_mana INTEGER DEFAULT 100,
          total_mana INTEGER DEFAULT 100,
          current_xp INTEGER DEFAULT 0,
          total_xp INTEGER DEFAULT 0,
          current_gold INTEGER DEFAULT 0,
          total_gold INTEGER DEFAULT 0,
          upgrade_points INTEGER DEFAULT 0,
          last_fight TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      db.run("DROP TABLE IF EXISTS item_definitions;");
      db.run(`
        CREATE TABLE IF NOT EXISTS item_definitions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          itemType INTEGER NOT NULL, 
          equipType INTEGER DEFAULT NULL, 
          equipPositionType INTEGER DEFAULT NULL, 
          levelRequired INTEGER DEFAULT 1,
          price INTEGER NOT NULL
        )
      `);
      db.run("DROP TABLE IF EXISTS item_instances;");
      db.run(`
        CREATE TABLE IF NOT EXISTS item_instances (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          character_id INTEGER NOT NULL,
          item_id INTEGER NOT NULL,
          stock INTEGER DEFAULT 1,
          equipped BOOLEAN DEFAULT FALSE,
          FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
          FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
        )
      `);
      db.run("DROP TABLE IF EXISTS effects;");
      db.run(`
        CREATE TABLE IF NOT EXISTS effects (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL
        )
      `);
      db.run("DROP TABLE IF EXISTS items_effects;");  
      db.run(`
        CREATE TABLE IF NOT EXISTS items_effects (
          item_id INTEGER NOT NULL,
          effect_id INTEGER NOT NULL,
          value INTEGER NOT NULL,
          FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
          FOREIGN KEY (effect_id) REFERENCES effects(id) ON DELETE CASCADE,
          PRIMARY KEY (item_id, effect_id)
        )
      `);
      db.run("DROP TABLE IF EXISTS activities;");  
      db.run(`
      CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        character_id INTEGER NOT NULL,
        type INTEGER NOT NULL,
        start_time TIMESTAMP NOT NULL,
        duration INTEGER NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
      )
    `);
    db.run("DROP TABLE IF EXISTS battle_logs;");  
    db.run(`
      CREATE TABLE IF NOT EXISTS battle_logs (
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
    db.run("DROP TABLE IF EXISTS messages;");  
    db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER NOT NULL,
        sender_name TEXT NOT NULL,
        receiver_id INTEGER NOT NULL,
        receiver_name TEXT NOT NULL,
        subject TEXT NOT NULL,
        body TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
      )`, resolve);
    });
  });
}

function populateEffects(): Promise<void> {
  console.log("🛠 Insertando efectos...");
  return new Promise((resolve) => {
    const effects = Object.values(EffectType).filter(key => isNaN(Number(key)));
    let inserts = 0;

    effects.forEach(effect => {
      db.run("INSERT OR IGNORE INTO effects (name) VALUES (?)", [effect], () => {
        inserts++;
        if (inserts === effects.length) resolve();
      });
    });
  });
}

function clearItemsAndEffects(): Promise<void> {
  return new Promise((resolve) => {
    console.log("🗑 Eliminando todos los ítems y efectos...");
    db.run("DELETE FROM items_effects", () => {
      db.run("DELETE FROM items", resolve);
    });
  });
}

function populateWeapons(): Promise<void> {
  return new Promise(async (resolve) => {
    await clearItemsAndEffects();
    console.log("⚔️ Añadiendo objetos a la base de datos...");

    let totalInserts = 0;
    let completedInserts = 0;

    for (let i = 1; i <= ServerConfig.levelMax; i++) {
      const baseQuery = `INSERT INTO item_definitions (name, itemType, equipType, equipPositionType, levelRequired, price)
                         VALUES (?, ?, ?, ?, ?, ?)`;

      const itemType = 3;
      const equipType = 1;
      const equipPositionType = 15;
      const levelRequired = i;
      const price = ServerConfig.weaponValue(i);

      const items = [
        { name: "Sable", effects: [EffectType.STRENGTH] },
        { name: "Daga", effects: [EffectType.PRECISION] },
        { name: "Hacha", effects: [EffectType.AGILITY] },
        { name: "Pistola", effects: [EffectType.STRENGTH, EffectType.PRECISION] },
        { name: "Trabuco", effects: [EffectType.STRENGTH, EffectType.AGILITY] },
        { name: "Arcabuz", effects: [EffectType.PRECISION, EffectType.AGILITY] },
      ];

      items.forEach(({ name, effects }) => {
        totalInserts++;
        db.run(baseQuery, [name, itemType, equipType, equipPositionType, levelRequired, price], function (err) {
          if (err) return console.error("❌ Error al insertar el ítem:", err.message);
          const itemId = this.lastID;

          effects.forEach(effectId => {
            totalInserts++;
            db.run(
              "INSERT INTO items_effects (item_id, effect_id, value) VALUES (?, ?, ?)",
              [itemId, effectId, ServerConfig.effectValue(i, effects)],
              () => {
                completedInserts++;
                checkClose();
              }
            );
          });

          completedInserts++;
          checkClose();
        });
      });
    }

    function checkClose() {
      if (completedInserts >= totalInserts) {
        console.log("✅ Todos los ítems y efectos han sido insertados.");
        resolve();
      }
    }
  });
}

export async function initializeDatabase(): Promise<void> {
  await runTables();
  await populateEffects();
  await populateWeapons();
}

export { db };