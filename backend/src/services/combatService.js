//backend\src\services\combatService.js
const db = require("../database");
const { addExperience } = require("./characterService");

/**
 * Calcula el daño de un ataque basado en los atributos de atacante y defensor.
 * @param {Object} attacker - Datos del atacante.
 * @param {Object} defender - Datos del defensor.
 * @returns {number} - Daño infligido.
 */
function calculateDamage(attacker, defender) {
  return Math.max(attacker.attack - defender.defense / 2, 1); // Daño mínimo 1
}

/**
 * Maneja un combate entre dos personajes.
 */
async function handleCombat(attacker_id, defender_id, res) {
  try {
    const attacker = await db.get("SELECT * FROM characters WHERE id = ?", [attacker_id]);
    if (!attacker) {
      return res.status(404).json({ error: "Atacante no encontrado" });
    }

    const defender = await db.get("SELECT * FROM characters WHERE id = ?", [defender_id]);
    if (!defender) {
      return res.status(404).json({ error: "Defensor no encontrado" });
    }

    let attackerHP = attacker.health;
    let defenderHP = defender.health;

    while (attackerHP > 0 && defenderHP > 0) {
      defenderHP -= calculateDamage(attacker, defender);
      if (defenderHP <= 0) break;
      attackerHP -= calculateDamage(defender, attacker);
    }

    const winner = attackerHP > 0 ? attacker : defender;
    const loser = attackerHP > 0 ? defender : attacker;
    const xpGained = 50 + Math.floor(Math.random() * 50);
    const goldGained = Math.floor(Math.random() * 20) + 10;
    const lostGold = Math.min(loser.currentGold, goldGained / 2);

    // Actualizar los valores del ganador
    await db.run(
      `UPDATE characters 
       SET currentGold = currentGold + ?, totalGold = totalGold + ?, currentXp = currentXp + ? 
       WHERE id = ?`,
      [goldGained, goldGained, xpGained, winner.id]
    );

    // Reducir oro al perdedor
    await db.run(
      `UPDATE characters SET currentGold = currentGold - ? WHERE id = ?`,
      [lostGold, loser.id]
    );

    // Registrar la batalla
    await saveBattle(attacker_id, defender_id, winner.id, goldGained, xpGained);

    // Añadir experiencia al ganador
    await addExperience(winner.user_id, xpGained, res);
  } catch (error) {
    console.error("Error en combate:", error);
    res.status(500).json({ error: "Error interno en el combate" });
  }
}

/**
 * Verifica si un atacante puede atacar a un defensor nuevamente.
 */
async function canAttackAgain(attacker_id, defender_id) {
  try {
    const row = await db.get(
      `SELECT last_attack FROM battles WHERE attacker_id = ? AND defender_id = ? 
       ORDER BY last_attack DESC LIMIT 1`,
      [attacker_id, defender_id]
    );

    if (!row) return true; // Nunca han peleado antes, puede atacar

    const lastAttackTime = new Date(row.last_attack);
    const now = new Date();
    const minutesSinceLastAttack = (now - lastAttackTime) / 60000;

    return minutesSinceLastAttack >= 60; // Puede atacar si ha pasado 1 hora
  } catch (error) {
    console.error("Error al verificar ataque:", error);
    return false; // En caso de error, prevenir ataque
  }
}

/**
 * Registra una batalla en la base de datos.
 */
async function saveBattle(attacker_id, defender_id, winner_id, goldWon, xpWon) {
  try {
    await db.run(
      `INSERT INTO battles (attacker_id, defender_id, winner_id, gold_won, xp_won) 
       VALUES (?, ?, ?, ?, ?)`,
      [attacker_id, defender_id, winner_id, goldWon, xpWon]
    );
  } catch (error) {
    console.error("Error al guardar batalla:", error);
  }
}

module.exports = { handleCombat, canAttackAgain, saveBattle };

