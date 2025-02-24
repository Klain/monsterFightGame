import sqlite3 from "sqlite3";
import path from "path";
import { EffectType } from "../src/constants/enums";
import ServerConfig from "../src/constants/serverConfig";

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
          gold_chest INTEGER DEFAULT 0,
          warehouse INTEGER DEFAULT 0,
          enviroment INTEGER DEFAULT 0,
          traps INTEGER DEFAULT 0,
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
function populateItems():Promise<void>{
  return new Promise(async (resolve) => {
    await clearItemsAndEffects();
    console.log("⚔️ Añadiendo objetos a la base de datos...");
    populateWeapons();
    populateArmors();
    populateJewels();
  });
}
function populateWeapons(): Promise<void> {
  return new Promise(async (resolve) => {
    let totalInserts = 0;
    let completedInserts = 0;

    for (let i = 1; i <= ServerConfig.levelMax; i++) {
      const baseQuery = `INSERT INTO item_definitions (name, itemType, equipType, equipPositionType, levelRequired, price)
                         VALUES (?, ?, ?, ?, ?, ?)`;

      const itemType = 3;
      const equipType = 2;
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
function populateArmors(): Promise<void> {
  return new Promise(async (resolve) => {
    let totalInserts = 0;
    let completedInserts = 0;

    const baseQuery = `INSERT INTO item_definitions (name, itemType, equipType, equipPositionType, levelRequired, price)
    VALUES (?, ?, ?, ?, ?, ?)`;

    const itemType = 3;
    const equipType = 1;
  
    //HEAD equipPositionType-1
    for (let i = 1; i <= ServerConfig.levelMax; i++) {
      const equipPositionType = 1;
      const levelRequired = i;
      const price = ServerConfig.weaponValue(i);
      const items = [
        { name: "Casco", effects: [EffectType.ENDURANCE] },
        { name: "Gorro", effects: [EffectType.CONSTITUTION] },
        { name: "Parche", effects: [EffectType.AGILITY] },
        { name: "Tricornio", effects: [EffectType.ENDURANCE, EffectType.CONSTITUTION] },
        { name: "Chambergo", effects: [EffectType.ENDURANCE, EffectType.AGILITY] },
        { name: "Capucha", effects: [EffectType.CONSTITUTION, EffectType.AGILITY] },
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
    //CHEST equipPositionType-3
    for (let i = 1; i <= ServerConfig.levelMax; i++) {
      const equipPositionType = 3;
      const levelRequired = i;
      const price = ServerConfig.weaponValue(i);
      const items = [
        { name: "Coraza", effects: [EffectType.ENDURANCE] }, // Protección pesada
        { name: "Chaleco", effects: [EffectType.CONSTITUTION] }, // Cómodo y resistente
        { name: "Camisa", effects: [EffectType.AGILITY] }, // Ligera y flexible
        { name: "Casaca", effects: [EffectType.ENDURANCE, EffectType.CONSTITUTION] }, // Usada por oficiales y capitanes
        { name: "Gambesón", effects: [EffectType.ENDURANCE, EffectType.AGILITY] }, // Protección ligera pero flexible
        { name: "Jubón", effects: [EffectType.CONSTITUTION, EffectType.AGILITY] }, // Prenda ajustada y cómoda
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
    //SHOULDER equipPositionType-4
    for (let i = 1; i <= ServerConfig.levelMax; i++) {
      const equipPositionType = 4;
      const levelRequired = i;
      const price = ServerConfig.weaponValue(i);
      const items = [
        { name: "Espaldar", effects: [EffectType.ENDURANCE] }, // Protección sólida  
        { name: "Guardabrazo", effects: [EffectType.CONSTITUTION] }, // Protección y movilidad  
        { name: "Bandolera", effects: [EffectType.AGILITY] }, // Ligera, para armas o suministros  
        { name: "Morrión", effects: [EffectType.ENDURANCE, EffectType.CONSTITUTION] }, // Protección reforzada  
        { name: "Charretera", effects: [EffectType.ENDURANCE, EffectType.AGILITY] }, // Usada por oficiales, ligera pero destacada  
        { name: "Esguarda", effects: [EffectType.CONSTITUTION, EffectType.AGILITY] }, // Protección ligera y flexible  
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
    //WRIST equipPositionType-5
    for (let i = 1; i <= ServerConfig.levelMax; i++) {
      const equipPositionType = 5;
      const levelRequired = i;
      const price = ServerConfig.weaponValue(i);
      const items = [
        { name: "Grebas", effects: [EffectType.ENDURANCE] }, // Protección sólida en las piernas  
        { name: "Espinilleras", effects: [EffectType.CONSTITUTION] }, // Resistencia y soporte  
        { name: "Polainas", effects: [EffectType.AGILITY] }, // Ligereza y movilidad  
        { name: "Zahones", effects: [EffectType.ENDURANCE, EffectType.CONSTITUTION] }, // Protección reforzada para exploradores  
        { name: "Canilleras", effects: [EffectType.ENDURANCE, EffectType.AGILITY] }, // Protección parcial sin perder movilidad  
        { name: "Escarpines", effects: [EffectType.CONSTITUTION, EffectType.AGILITY] }, // Comodidad y flexibilidad en movimiento  
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
    //LEGS equipPositionType-8
    for (let i = 1; i <= ServerConfig.levelMax; i++) {
      const equipPositionType = 8;
      const levelRequired = i;
      const price = ServerConfig.weaponValue(i);
      const items = [
        { name: "Calzas", effects: [EffectType.ENDURANCE] }, // Ajustadas, resistentes
        { name: "Pantalón", effects: [EffectType.CONSTITUTION] }, // Clásico y versátil
        { name: "Bragas", effects: [EffectType.AGILITY] }, // Ligeras y cómodas
        { name: "Gregüescos", effects: [EffectType.ENDURANCE, EffectType.CONSTITUTION] }, // Robustos y usados por exploradores
        { name: "Faldón", effects: [EffectType.ENDURANCE, EffectType.AGILITY] }, // Movilidad con algo de protección
        { name: "Bombachos", effects: [EffectType.CONSTITUTION, EffectType.AGILITY] }, // Anchos y cómodos, perfectos para maniobrar
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
function populateJewels(): Promise<void>{
  return new Promise(async (resolve) => {
    let totalInserts = 0;
    let completedInserts = 0;

    const baseQuery = `INSERT INTO item_definitions (name, itemType, equipType, equipPositionType, levelRequired, price)
    VALUES (?, ?, ?, ?, ?, ?)`;

    const itemType = 3;
    const equipType = 4;
  
    //NECKLACE equipPositionType-2
    for (let i = 1; i <= ServerConfig.levelMax; i++) {
      const equipPositionType = 2;
      const levelRequired = i;
      const price = ServerConfig.weaponValue(i);
      const items = [
        { name: "Colgante", effects: [EffectType.STRENGTH] }, // Simple y directo
        { name: "Amuleto", effects: [EffectType.ENDURANCE] }, // Protección mística o supersticiosa
        { name: "Talismán", effects: [EffectType.CONSTITUTION] }, // Objeto con poder protector
        { name: "Dije", effects: [EffectType.PRECISION] }, // Pequeño adorno con significado
        { name: "Gargantilla", effects: [EffectType.AGILITY] }, // Collar corto, ligero y elegante
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

    //RING1 equipPositionType-11
    for (let i = 1; i <= ServerConfig.levelMax; i++) {
      const equipPositionType = 11;
      const levelRequired = i;
      const price = ServerConfig.weaponValue(i);
      const items = [
        { name: "Runa de Fuego", effects: [EffectType.STRENGTH] },
        { name: "Runa de Hierro", effects: [EffectType.ENDURANCE] },
        { name: "Runa de Sangre", effects: [EffectType.CONSTITUTION] },
        { name: "Runa del Halcón", effects: [EffectType.PRECISION] },
        { name: "Runa del Viento", effects: [EffectType.AGILITY] },
        { name: "Runa del León", effects: [EffectType.VIGOR] },
        { name: "Runa del Alma", effects: [EffectType.SPIRIT] },
        { name: "Runa del Titán", effects: [EffectType.WILLPOWER] },
        { name: "Runa Arcana", effects: [EffectType.ARCANE] },
        { name: "Runa Dorada", effects: [EffectType.COMBAT_GOLD_BONUS] },
        { name: "Runa del Sabio", effects: [EffectType.COMBAT_XP_BONUS] },
        { name: "Runa de las Sombras", effects: [EffectType.COMBAT_HIDE_BONUS] },
        { name: "Runa del Ojo", effects: [EffectType.COMBAT_SEARCH_BONUS] },
        { name: "Runa del Escondite", effects: [EffectType.HEIST_HIDE_BONUS] },
        { name: "Runa del Centinela", effects: [EffectType.HEIST_ALERT_BONUS] },
        { name: "Runa del Mercante", effects: [EffectType.WORK_GOLD_BONUS] },
        { name: "Runa del Aprendiz", effects: [EffectType.WORK_XP_BONUS] },
        { name: "Runa del Reloj", effects: [EffectType.WORK_TIME_BONUS] },
        { name: "Runa de la Vida", effects: [EffectType.HEALTH_REGEN_BONUS] },
        { name: "Runa de la Energía", effects: [EffectType.ENERGY_REGEN_BONUS] },
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
function populateConsumables(): Promise<void>{
  return new Promise(async (resolve) => {
    let totalInserts = 0;
    let completedInserts = 0;

    const baseQuery = `INSERT INTO item_definitions (name, itemType, equipType, equipPositionType, levelRequired, price)
    VALUES (?, ?, ?, ?, ?, ?)`;

    const itemType = 2;
    const equipType = 0;
    const equipPositionType = 0;
  
    for (let i = 1; i <= ServerConfig.levelMax; i++) {
      const equipPositionType = 11;
      const levelRequired = i;
      const price = ServerConfig.weaponValue(i);
      const items = [
        { name: "Fruta del Leviatán", effects: [EffectType.STRENGTH, EffectType.USABLE_EFFECT] },  
        { name: "Raíz del Coloso", effects: [EffectType.ENDURANCE, EffectType.USABLE_EFFECT] },  
        { name: "Esencia de Dragón", effects: [EffectType.CONSTITUTION, EffectType.USABLE_EFFECT] },  
        { name: "Ojo de Halcón", effects: [EffectType.PRECISION, EffectType.USABLE_EFFECT] },  
        { name: "Pluma de Zephyr", effects: [EffectType.AGILITY, EffectType.USABLE_EFFECT] },  
        { name: "Cuerno de Bestia", effects: [EffectType.VIGOR, EffectType.USABLE_EFFECT] },  
        { name: "Lágrima de Sirena", effects: [EffectType.SPIRIT, EffectType.USABLE_EFFECT] },  
        { name: "Corazón de Titán", effects: [EffectType.WILLPOWER, EffectType.USABLE_EFFECT] },  
        { name: "Gema Arcana", effects: [EffectType.ARCANE, EffectType.USABLE_EFFECT] },  
        { name: "Poción de Gigante", effects: [EffectType.STRENGTH, EffectType.USABLE_EFFECT, EffectType.DURATION_EFFECT] },  
        { name: "Elixir de Hierro", effects: [EffectType.ENDURANCE, EffectType.USABLE_EFFECT, EffectType.DURATION_EFFECT] },  
        { name: "Brebaje de Vitalidad", effects: [EffectType.CONSTITUTION, EffectType.USABLE_EFFECT, EffectType.DURATION_EFFECT] },  
        { name: "Tónico de Cazador", effects: [EffectType.PRECISION, EffectType.USABLE_EFFECT, EffectType.DURATION_EFFECT] },  
        { name: "Esencia del Relámpago", effects: [EffectType.AGILITY, EffectType.USABLE_EFFECT, EffectType.DURATION_EFFECT] },  
        { name: "Mezcla Energizante", effects: [EffectType.VIGOR, EffectType.USABLE_EFFECT, EffectType.DURATION_EFFECT] },  
        { name: "Néctar Sagrado", effects: [EffectType.SPIRIT, EffectType.USABLE_EFFECT, EffectType.DURATION_EFFECT] },  
        { name: "Extracto de Voluntad", effects: [EffectType.WILLPOWER, EffectType.USABLE_EFFECT, EffectType.DURATION_EFFECT] },  
        { name: "Poción Arcana", effects: [EffectType.ARCANE, EffectType.USABLE_EFFECT, EffectType.DURATION_EFFECT] },  
        { name: "Frasco de Fortuna", effects: [EffectType.COMBAT_GOLD_BONUS, EffectType.USABLE_EFFECT, EffectType.DURATION_EFFECT] },  
        { name: "Extracto del Sabio", effects: [EffectType.COMBAT_XP_BONUS, EffectType.USABLE_EFFECT, EffectType.DURATION_EFFECT] },  
        { name: "Poción de Sombra", effects: [EffectType.COMBAT_HIDE_BONUS, EffectType.USABLE_EFFECT, EffectType.DURATION_EFFECT] },  
        { name: "Tintura del Explorador", effects: [EffectType.COMBAT_SEARCH_BONUS, EffectType.USABLE_EFFECT, EffectType.DURATION_EFFECT] },  
        { name: "Velo del Forajido", effects: [EffectType.HEIST_HIDE_BONUS, EffectType.USABLE_EFFECT, EffectType.DURATION_EFFECT] },  
        { name: "Aguamiel del Vigía", effects: [EffectType.HEIST_ALERT_BONUS, EffectType.USABLE_EFFECT, EffectType.DURATION_EFFECT] },  
        { name: "Elixir del Comerciante", effects: [EffectType.WORK_GOLD_BONUS, EffectType.USABLE_EFFECT, EffectType.DURATION_EFFECT] },  
        { name: "Pócima del Aprendiz", effects: [EffectType.WORK_XP_BONUS, EffectType.USABLE_EFFECT, EffectType.DURATION_EFFECT] },  
        { name: "Té del Cronista", effects: [EffectType.WORK_TIME_BONUS, EffectType.USABLE_EFFECT, EffectType.DURATION_EFFECT] },  
        { name: "Esencia de la Vida", effects: [EffectType.HEALTH_REGEN_BONUS, EffectType.USABLE_EFFECT, EffectType.DURATION_EFFECT] },  
        { name: "Tónico Revitalizante", effects: [EffectType.ENERGY_REGEN_BONUS, EffectType.USABLE_EFFECT, EffectType.DURATION_EFFECT] },  
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
  await populateItems();
}

export { db };