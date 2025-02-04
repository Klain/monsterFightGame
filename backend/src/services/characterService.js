//backend\src\services\characterService.js
const db = require("../database");

/**
 * Calcula la cantidad de experiencia necesaria para subir de nivel.
 * @param {number} level - Nivel actual del personaje.
 * @returns {number} - Experiencia requerida para el próximo nivel.
 */
function getNextLevelXP(level) {
  return level * 100; // Fórmula de XP necesaria por nivel.
}

/**
 * Añade experiencia a un personaje y maneja la subida de nivel.
 */
async function addExperience(user_id, xpGained, res) {
  try {
    const character = await db.get("SELECT * FROM characters WHERE user_id = ?", [user_id]);

    if (!character) {
      return res.status(404).json({ error: "Personaje no encontrado" });
    }

    let newCurrentXp = character.currentXp + xpGained;
    let newTotalXp = character.totalXp + xpGained;
    let newLevel = character.level;
    let xpRequired = getNextLevelXP(newLevel);
    let upgradePoints = character.upgrade_points;

    while (newTotalXp >= xpRequired) {
      newTotalXp -= xpRequired;
      newLevel++;
      xpRequired = getNextLevelXP(newLevel);
      upgradePoints += 3; // Puntos de mejora por nivel
    }

    await db.run(
      `UPDATE characters SET currentXp = ?, totalXp = ?, level = ?, upgrade_points = ? WHERE user_id = ?`,
      [newCurrentXp, newTotalXp, newLevel, upgradePoints, user_id]
    );

    res.json({
      message: "Experiencia añadida",
      level: newLevel,
      currentXp: newCurrentXp,
      totalXp: newTotalXp,
      upgrade_points: upgradePoints,
    });
  } catch (error) {
    res.status(500).json({ error: "Error al añadir experiencia" });
  }
}

/**
 * Mejora un atributo de un personaje usando experiencia.
 */
async function upgradeAttribute(user_id, attribute, res) {
  try {
    const validAttributes = ["attack", "defense", "health"];
    if (!validAttributes.includes(attribute)) {
      return res.status(400).json({ error: "Atributo inválido, debe ser attack, defense o health" });
    }

    const character = await db.get("SELECT * FROM characters WHERE user_id = ?", [user_id]);
    if (!character) {
      return res.status(404).json({ error: "Personaje no encontrado" });
    }

    const currentValue = character[attribute];
    const cost = currentValue * 10;

    if (character.currentXp < cost) {
      return res.status(400).json({ error: "No tienes suficiente XP para mejorar este atributo" });
    }

    await db.run(
      `UPDATE characters SET ${attribute} = ${attribute} + 1, currentXp = currentXp - ? WHERE user_id = ?`,
      [cost, user_id]
    );

    res.json({
      message: `Has mejorado ${attribute} a ${currentValue + 1}`,
      new_value: currentValue + 1,
      remaining_xp: character.currentXp - cost,
    });
  } catch (error) {
    res.status(500).json({ error: "Error al mejorar atributo" });
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

module.exports = { addExperience, upgradeAttribute, regenerateHealth, buyHealing };
