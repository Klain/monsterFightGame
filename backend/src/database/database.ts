import sqlite3 from "sqlite3";
import path from "path";
import { EffectType, EquipPositionType, EquipType, ItemType } from "../constants/enums";
import ServerConfig from "../constants/serverConfig";

const dbPath = path.resolve(__dirname, "./monsterFight.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(`❌ Error al conectar con la base de datos: ${err} \n en ${dbPath}`);
  } else {
    console.log("✅ Conectado a la base de datos SQLite.");
  }
});

function runQuery(query: string, params: any[]): Promise<number> {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) {
        return reject(err);
      }
      resolve(this.lastID);
    });
  });
}

function runTables(): Promise<void> {
  console.log("🛠 Creando tablas...");
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      //db.run("DROP TABLE IF EXISTS activities;");  
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


      //db.run("DROP TABLE IF EXISTS users;");
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          last_online TIMESTAMP
        )
      `);
      //db.run("DROP TABLE IF EXISTS characters;");
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
      //db.run("DROP TABLE IF EXISTS item_definitions;");
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
      //db.run("DROP TABLE IF EXISTS item_instances;");
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
      //db.run("DROP TABLE IF EXISTS effects;");
      db.run(`
        CREATE TABLE IF NOT EXISTS effects (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL
        )
      `);
      //db.run("DROP TABLE IF EXISTS items_effects;");  
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
      //db.run("DROP TABLE IF EXISTS messages;");  
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
        )
      `);
      //db.run("DROP TABLE IF EXISTS friendship;");  
      db.run(`
        CREATE TABLE IF NOT EXISTS friendship (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id_1 INTEGER NOT NULL,
        user_id_2 INTEGER NOT NULL,
        active INTEGER DEFAULT 0,
        FOREIGN KEY (user_id_1) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id_2) REFERENCES users(id) ON DELETE CASCADE
        )
      `, resolve);
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
async function clearItemsAndEffects(): Promise<void> {
  console.log("🗑 Eliminando todos los ítems y efectos...");
  await runQuery("DELETE FROM items_effects", []);
  await runQuery("DELETE FROM item_definitions", []);
}

async function populateItems(): Promise<void> {
  await clearItemsAndEffects();
  console.log("⚔️ Añadiendo objetos a la base de datos...");

  await populateWeapons();
  console.log("Exito en populateWeapons");

  await populateArmors();
  console.log("Exito en populateArmors");

  await populateJewels();
  console.log("Exito en populateJewels");

  await populateConsumables();
  console.log("Exito en populateConsumables");

  console.log("✅ Exito en populateItems");
}

async function populateWeapons(): Promise<void> {
  try {
    console.log("⚔️ Insertando armas...");
    const itemType = ItemType.EQUIPMENT;
    const equipType = EquipType.WEAPON;
    const equipPositionType = EquipPositionType.MAINHAND;

    for (let i = 1; i <= ServerConfig.levelMax; i++) {
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

      for (const { name, effects } of items) {
        try {
          const itemId = await runQuery(
            `INSERT INTO item_definitions (name, itemType, equipType, equipPositionType, levelRequired, price) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [name, itemType, equipType, equipPositionType, levelRequired, price]
          );

          for (const effectId of effects) {
            await runQuery(
              "INSERT INTO items_effects (item_id, effect_id, value) VALUES (?, ?, ?)",
              [itemId, effectId, ServerConfig.effectValue(i, effects)]
            );
          }
        } catch (err) {
          console.error(`❌ Error al insertar ${name}:`, err);
          throw err; // Lanzamos el error para que sea capturado en el `catch` de `populateWeapons`
        }
      }
    }

    console.log("✅ Todas las armas fueron añadidas.");
  } catch (err) {
    console.error("❌ Error en populateWeapons():", err);
    throw err; // Para que el error se propague y el flujo pueda manejarlo correctamente
  }
}

async function populateArmors(): Promise<void> {
  try {
    console.log("🛡️ Insertando armaduras...");
    const itemType = ItemType.EQUIPMENT;
    const equipType = EquipType.ARMOR;

    const armorPositions = [
      { position: EquipPositionType.HEAD, items: [
        { name: "Casco", effects: [EffectType.ENDURANCE] },
        { name: "Gorro", effects: [EffectType.CONSTITUTION] },
        { name: "Parche", effects: [EffectType.AGILITY] },
        { name: "Tricornio", effects: [EffectType.ENDURANCE, EffectType.CONSTITUTION] },
        { name: "Chambergo", effects: [EffectType.ENDURANCE, EffectType.AGILITY] },
        { name: "Capucha", effects: [EffectType.CONSTITUTION, EffectType.AGILITY] },
      ]},
      { position: EquipPositionType.CHEST, items: [
        { name: "Coraza", effects: [EffectType.ENDURANCE] },
        { name: "Chaleco", effects: [EffectType.CONSTITUTION] },
        { name: "Camisa", effects: [EffectType.AGILITY] },
        { name: "Casaca", effects: [EffectType.ENDURANCE, EffectType.CONSTITUTION] },
        { name: "Gambesón", effects: [EffectType.ENDURANCE, EffectType.AGILITY] },
        { name: "Jubón", effects: [EffectType.CONSTITUTION, EffectType.AGILITY] },
      ]},
      { position: EquipPositionType.SHOULDER, items: [
        { name: "Espaldar", effects: [EffectType.ENDURANCE] },
        { name: "Guardabrazo", effects: [EffectType.CONSTITUTION] },
        { name: "Bandolera", effects: [EffectType.AGILITY] },
        { name: "Morrión", effects: [EffectType.ENDURANCE, EffectType.CONSTITUTION] },
        { name: "Charretera", effects: [EffectType.ENDURANCE, EffectType.AGILITY] },
        { name: "Esguarda", effects: [EffectType.CONSTITUTION, EffectType.AGILITY] },
      ]},
      { position: EquipPositionType.WRIST, items: [
        { name: "Grebas", effects: [EffectType.ENDURANCE] },
        { name: "Espinilleras", effects: [EffectType.CONSTITUTION] },
        { name: "Polainas", effects: [EffectType.AGILITY] },
        { name: "Zahones", effects: [EffectType.ENDURANCE, EffectType.CONSTITUTION] },
        { name: "Canilleras", effects: [EffectType.ENDURANCE, EffectType.AGILITY] },
        { name: "Escarpines", effects: [EffectType.CONSTITUTION, EffectType.AGILITY] },
      ]},
      { position: EquipPositionType.LEGS, items: [
        { name: "Calzas", effects: [EffectType.ENDURANCE] },
        { name: "Pantalón", effects: [EffectType.CONSTITUTION] },
        { name: "Bragas", effects: [EffectType.AGILITY] },
        { name: "Gregüescos", effects: [EffectType.ENDURANCE, EffectType.CONSTITUTION] },
        { name: "Faldón", effects: [EffectType.ENDURANCE, EffectType.AGILITY] },
        { name: "Bombachos", effects: [EffectType.CONSTITUTION, EffectType.AGILITY] },
      ]}
    ];

    for (const { position, items } of armorPositions) {
      for (let i = 1; i <= ServerConfig.levelMax; i++) {
        const levelRequired = i;
        const price = ServerConfig.weaponValue(i);

        for (const { name, effects } of items) {
          try {
            // Insertamos la armadura en item_definitions
            const itemId = await runQuery(
              `INSERT INTO item_definitions (name, itemType, equipType, equipPositionType, levelRequired, price) 
               VALUES (?, ?, ?, ?, ?, ?)`,
              [name, itemType, equipType, position, levelRequired, price]
            );

            // Insertamos los efectos asociados a la armadura
            for (const effectId of effects) {
              await runQuery(
                "INSERT INTO items_effects (item_id, effect_id, value) VALUES (?, ?, ?)",
                [itemId, effectId, ServerConfig.effectValue(i, effects)]
              );
            }
          } catch (err) {
            console.error(`❌ Error al insertar ${name}:`, err);
            throw err; // Propagamos el error para manejarlo a nivel superior
          }
        }
      }
    }

    console.log("✅ Todas las armaduras fueron añadidas.");
  } catch (err) {
    console.error("❌ Error en populateArmors():", err);
    throw err; // Propagamos el error para manejarlo correctamente en la función que lo llama
  }
}

async function populateJewels(): Promise<void> {
  try {
    console.log("💎 Insertando joyas...");
    const itemType = ItemType.EQUIPMENT;
    const equipType = EquipType.JEWEL;

    const jewelPositions = [
      { position: EquipPositionType.NECKLACE, items: [
        { name: "Colgante", effects: [EffectType.STRENGTH] },
        { name: "Amuleto", effects: [EffectType.ENDURANCE] },
        { name: "Talismán", effects: [EffectType.CONSTITUTION] },
        { name: "Dije", effects: [EffectType.PRECISION] },
        { name: "Gargantilla", effects: [EffectType.AGILITY] },
      ]},
      { position: EquipPositionType.RING1, items: [
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
        { name: "Runa de la Vida", effects: [EffectType.HEALTH_REGEN] },
        { name: "Runa de la Energía", effects: [EffectType.ENERGY_REGEN] },
      ]}
    ];

    for (const { position, items } of jewelPositions) {
      for (let i = 1; i <= ServerConfig.levelMax; i++) {
        const levelRequired = i;
        const price = ServerConfig.weaponValue(i); // Asegurar que esto sea correcto para joyas

        for (const { name, effects } of items) {
          try {
            // Insertar la joya en item_definitions
            const itemId = await runQuery(
              `INSERT INTO item_definitions (name, itemType, equipType, equipPositionType, levelRequired, price) 
               VALUES (?, ?, ?, ?, ?, ?)`,
              [name, itemType, equipType, position, levelRequired, price]
            );

            // Insertar los efectos asociados a la joya
            for (const effectId of effects) {
              await runQuery(
                "INSERT INTO items_effects (item_id, effect_id, value) VALUES (?, ?, ?)",
                [itemId, effectId, ServerConfig.effectValue(i, effects)]
              );
            }
          } catch (err) {
            console.error(`❌ Error al insertar ${name}:`, err);
            throw err; // Propagar error correctamente
          }
        }
      }
    }

    console.log("✅ Todas las joyas fueron añadidas.");
  } catch (err) {
    console.error("❌ Error en populateJewels():", err);
    throw err; // Manejar el error a nivel superior
  }
}

async function populateConsumables(): Promise<void> {
  try {
    console.log("🍶 Insertando consumibles...");
    const itemType = ItemType.CONSUMABLE;
    const equipType = EquipType.NONE;
    const equipPositionType = EquipPositionType.NONE;

    const consumables = [
      { name: "Fruta del Leviatán", effects: [EffectType.STRENGTH, EffectType.USABLE_EFFECT] },
      { name: "Raíz del Coloso", effects: [EffectType.ENDURANCE, EffectType.USABLE_EFFECT] },
      { name: "Esencia de Dragón", effects: [EffectType.CONSTITUTION, EffectType.USABLE_EFFECT] },
      { name: "Ojo de Halcón", effects: [EffectType.PRECISION, EffectType.USABLE_EFFECT] },
      { name: "Pluma de Zephyr", effects: [EffectType.AGILITY, EffectType.USABLE_EFFECT] },
      { name: "Cuerno de Bestia", effects: [EffectType.VIGOR, EffectType.USABLE_EFFECT] },
      { name: "Lágrima de Sirena", effects: [EffectType.SPIRIT, EffectType.USABLE_EFFECT] },
      { name: "Corazón de Titán", effects: [EffectType.WILLPOWER, EffectType.USABLE_EFFECT] },
      { name: "Gema Arcana", effects: [EffectType.ARCANE, EffectType.USABLE_EFFECT] },
      { name: "Poción de Salud", effects: [EffectType.HEALTH, EffectType.USABLE_EFFECT] },
      { name: "Poción de Energía", effects: [EffectType.ENERGY, EffectType.USABLE_EFFECT] },
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
      { name: "Esencia de la Vida", effects: [EffectType.HEALTH_REGEN, EffectType.USABLE_EFFECT, EffectType.DURATION_EFFECT] },
      { name: "Tónico Revitalizante", effects: [EffectType.ENERGY_REGEN, EffectType.USABLE_EFFECT, EffectType.DURATION_EFFECT] }
    ];

    // Iterar por niveles de 5 en 5
    for (let i = 1; i <= ServerConfig.levelMax; i += 5) {
      const levelRequired = i;
      const price = ServerConfig.weaponValue(i); // Corregido para consumibles

      for (const { name, effects } of consumables) {
        try {
          // Insertar consumible en `item_definitions`
          const itemId = await runQuery(
            `INSERT INTO item_definitions (name, itemType, equipType, equipPositionType, levelRequired, price) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [name, itemType, equipType, equipPositionType, levelRequired, price]
          );

          // Insertar efectos asociados al consumible
          for (const effectId of effects) {
            await runQuery(
              "INSERT INTO items_effects (item_id, effect_id, value) VALUES (?, ?, ?)",
              [itemId, effectId, ServerConfig.effectValue(i, effects)]
            );
          }
        } catch (err) {
          console.error(`❌ Error al insertar ${name}:`, err);
          throw err; // Propagar error correctamente
        }
      }
    }

    console.log("✅ Todos los consumables añadidos.");
  } catch (err) {
    console.error("❌ Error en populateConsumables():", err);
    throw err; // Manejar el error a nivel superior
  }
}

export async function initializeDatabase(): Promise<void> {
  await runTables();
  console.log("Exito en runTables");
  //await populateEffects();
  console.log("Exito en populateEffects");
  // await populateItems();
  console.log("Exito en populateItems");
}

export { db };