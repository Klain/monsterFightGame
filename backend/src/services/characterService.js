//backend\src\services\characterService.js
const { db } = require("../database");

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

/**
 * Mejora un atributo de un personaje usando puntos de mejora.
 */
async function upgradeAttribute(user_id, attribute, res) {
  try {
    const validAttributes = ["attack", "defense", "health"];
    if (!validAttributes.includes(attribute)) {
      return res.status(400).json({ error: "Atributo inválido, debe ser attack, defense o health" });
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

    if (character.upgrade_points <= 0) {
      return res.status(400).json({ error: "No tienes puntos de mejora suficientes" });
    }

    // Calcular nuevo valor del atributo
    const newAttributeValue = character[attribute] + 1;
    const newUpgradePoints = character.upgrade_points - 1;

    // Actualizar en la base de datos
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE characters SET ${attribute} = ?, upgrade_points = ? WHERE user_id = ?`,
        [newAttributeValue, newUpgradePoints, user_id],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.json({
      message: `Has mejorado ${attribute} a ${newAttributeValue}`,
      new_value: newAttributeValue,
      remaining_upgrade_points: newUpgradePoints,
    });
  } catch (error) {
    console.error("❌ Error al mejorar atributo:", error);
    res.status(500).json({ error: "Error interno al mejorar atributo" });
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


module.exports = { addExperience,addUpgradePoints , upgradeAttribute, regenerateHealth, buyHealing };
