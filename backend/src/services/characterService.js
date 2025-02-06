//backend\src\services\characterService.js
const { db } = require("../database");

async function createCharacterForUser(user_id, username) {
  try {
      const defaultFaction = "Neutral";
      const defaultClass = "Guerrero";

      const result = await new Promise((resolve, reject) => {
          db.run(
              `INSERT INTO characters (user_id, name, faction, class, level, totalXp, currentXp, currentGold, totalGold, health, attack, defense, upgrade_points) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [user_id, username, defaultFaction, defaultClass, 1, 0, 0, 0, 0, 100, 10, 5, 0],
              function (err) {
                  if (err) reject(err);
                  else resolve(this);
              }
          );
      });

      console.log(`✅ Personaje creado para el usuario ${user_id}`);
      return result;
  } catch (error) {
      console.error("❌ Error al crear personaje:", error);
      throw new Error("Error al crear personaje.");
  }
}

/**
 * Calcula la cantidad de experiencia necesaria para subir de nivel.
 */
function getNextLevelXP(level) {
  return level * 100; // Fórmula de XP necesaria por nivel.
}

/**
 * Añade experiencia a un personaje y maneja la subida de nivel.
 */
 async function addExperience(user_id, xpGained, res) {
  try {
    const character = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM characters WHERE user_id = ?", [user_id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!character) {
      return res.status(404).json({ error: "Personaje no encontrado" });
    }

    let newCurrentXp = character.currentXp + xpGained;
    let newTotalXp = character.totalXp + xpGained;
    let newLevel = character.level;
    let xpRequired = getNextLevelXP(newLevel);
    let upgradePoints = character.upgrade_points;

    while (newCurrentXp >= xpRequired) {
      newCurrentXp -= xpRequired;
      newLevel++;
      xpRequired = getNextLevelXP(newLevel);
      upgradePoints += 3; // Puntos de mejora por nivel
    }

    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE characters SET currentXp = ?, totalXp = ?, level = ?, upgrade_points = ? WHERE user_id = ?`,
        [newCurrentXp, newTotalXp, newLevel, upgradePoints, user_id],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.json({
      message: "Experiencia añadida",
      currentXp: newCurrentXp,
      totalXp: newTotalXp,
      level: newLevel,
      upgrade_points: upgradePoints,
    });
  } catch (error) {
    console.error("❌ Error al añadir experiencia:", error);
    res.status(500).json({ error: "Error al añadir experiencia" });
  }
}

function calculateUpgradeCost(attribute, currentValue) {
  if (!["attack", "defense", "health"].includes(attribute)) {
      throw new Error("Atributo inválido.");
  }

  return 100 + (currentValue * 10); // Fórmula de progresión
}

async function upgradeCharacterAttribute(user_id, attribute) {
  try {
      if (!["attack", "defense", "health"].includes(attribute)) {
          throw new Error("Atributo inválido.");
      }

      // Obtener el personaje del usuario
      const character = await db.get("SELECT * FROM characters WHERE user_id = ?", [user_id]);
      if (!character) {
          throw new Error("Personaje no encontrado.");
      }

      // Calcular el costo de mejora
      const cost = calculateUpgradeCost(attribute, character[attribute]);

      // Verificar que el personaje tenga suficiente XP
      if (character.currentXp < cost) {
          throw new Error("No tienes suficiente experiencia para mejorar este atributo.");
      }

      // Aplicar la mejora
      const newAttributeValue = character[attribute] + 1;
      const newXp = character.currentXp - cost;

      await db.run(
          `UPDATE characters SET ${attribute} = ?, currentXp = ? WHERE user_id = ?`,
          [newAttributeValue, newXp, user_id]
      );

      return {
          success: true,
          message: `Has mejorado ${attribute} a ${newAttributeValue}.`,
          new_value: newAttributeValue,
          remaining_xp: newXp
      };
  } catch (error) {
      console.error("Error al mejorar atributo:", error);
      return { success: false, message: error.message };
  }
}


/**
 * Regenera salud del personaje con base en el tiempo transcurrido desde la última batalla.
 */
async function regenerateHealth(user_id, res) {
  try {
    const character = await db.get("SELECT * FROM characters WHERE user_id = ?", [user_id]);
    if (!character) {
      return res.status(404).json({ error: "Personaje no encontrado" });
    }

    const lastFightTime = new Date(character.last_fight || 0);
    const now = new Date();
    const minutesSinceLastFight = (now - lastFightTime) / 60000; // Convertir a minutos
    const regenRate = minutesSinceLastFight > 30 ? 0.10 : 0.05; // 10% si pasaron 30 min, 5% si no

    let healthRecovered = Math.floor(character.health * regenRate);
    let newHealth = Math.min(character.health + healthRecovered, 100); // Máximo 100

    await db.run("UPDATE characters SET health = ? WHERE user_id = ?", [newHealth, user_id]);

    res.json({ message: `Has regenerado ${healthRecovered} de salud`, new_health: newHealth });
  } catch (error) {
    res.status(500).json({ error: "Error al regenerar salud" });
  }
}

/**
 * Permite comprar sanación a cambio de oro.
 */
async function buyHealing(user_id, res) {
  try {
    const character = await db.get("SELECT * FROM characters WHERE user_id = ?", [user_id]);
    if (!character) {
      return res.status(404).json({ error: "Personaje no encontrado" });
    }

    const healCost = 50; // 50 de oro por 50 de salud
    if (character.currentGold < healCost) {
      return res.status(400).json({ error: "No tienes suficiente oro" });
    }

    const newHealth = Math.min(character.health + 50, 100); // Salud máxima 100
    await db.run("UPDATE characters SET health = ?, currentGold = currentGold - ? WHERE user_id = ?", [
      newHealth,
      healCost,
      user_id,
    ]);

    res.json({ message: `Has comprado sanación, nueva salud: ${newHealth}`, gold_spent: healCost });
  } catch (error) {
    res.status(500).json({ error: "Error al comprar sanación" });
  }
}

/**
 * DEBUGGER
 * 
 */
 async function addUpgradePoints (user_id, points, res) {
  try {
    if (!points || points <= 0) {
      return res.status(400).json({ error: "Debes especificar una cantidad válida de puntos de mejora." });
    }

    // Obtener el personaje
    const character = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM characters WHERE user_id = ?", [user_id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!character) {
      return res.status(404).json({ error: "Personaje no encontrado" });
    }

    let newUpgradePoints = character.upgrade_points + points;

    // Actualizar en la base de datos
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE characters SET upgrade_points = ? WHERE user_id = ?`,
        [newUpgradePoints, user_id],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.json({
      message: `Se han añadido ${points} puntos de mejora.`,
      total_upgrade_points: newUpgradePoints
    });
  } catch (error) {
    console.error("❌ Error al añadir puntos de mejora:", error);
    res.status(500).json({ error: "Error interno al añadir puntos de mejora." });
  }
}


module.exports = { createCharacterForUser, calculateUpgradeCost, upgradeCharacterAttribute , regenerateHealth, buyHealing , addExperience,addUpgradePoints  };
