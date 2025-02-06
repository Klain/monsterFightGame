//backend\src\services\combatService.js
const { db } = require("../database");
const { addExperience } = require("./characterService");
const { getEquippedStats } = require("../services/characterService");
const { sendMessage } = require("./messageService");
const { connectedUsers, sendRealTimeNotification } = require("../sessionManager"); // Importar correctamente

/**
 * Calcula el daño de un ataque basado en los atributos del atacante y defensor.
 * Aplica chance de crítico (+50% daño) y evasión (evita el golpe).
 */
async function calculateDamage(attacker_id, defender_id) {
  const attackerStats = await getEquippedStats(attacker_id);
  const defenderStats = await getEquippedStats(defender_id);

  // Probabilidad de crítico (10% de chance, +50% daño)
  const isCritical = Math.random() < 0.1;
  let damage = Math.max(attackerStats.attack - defenderStats.defense / 2, 1);

  if (isCritical) {
    damage = Math.floor(damage * 1.5);
  }

  // Probabilidad de evasión (10% de chance, daño reducido a 0)
  const evasionChance = Math.random() < 0.1;
  if (evasionChance) {
    return 0;
  }

  return damage;
}

/**
 * Maneja un combate entre dos personajes.
 */
async function handleCombat(attacker_id, defender_id, res) {
  try {
    const attacker = await db.get("SELECT * FROM characters WHERE id = ?", [attacker_id]);
    if (!attacker) return res.status(404).json({ error: "Atacante no encontrado" });

    const defender = await db.get("SELECT * FROM characters WHERE id = ?", [defender_id]);
    if (!defender) return res.status(404).json({ error: "Defensor no encontrado" });

    let attackerHP = attacker.health;
    let defenderHP = defender.health;
    let turn = 1;
    let battleLog = [];

    while (attackerHP > 0 && defenderHP > 0) {
      const attackerDamage = await calculateDamage(attacker.id, defender.id);
      defenderHP -= attackerDamage;
      battleLog.push(`Turno ${turn}: ${attacker.name} ataca y hace ${attackerDamage} de daño.`);

      if (defenderHP <= 0) break;

      const defenderDamage = await calculateDamage(defender.id, attacker.id);
      attackerHP -= defenderDamage;
      battleLog.push(`Turno ${turn}: ${defender.name} contraataca y hace ${defenderDamage} de daño.`);

      turn++;
    }

    const winner = attackerHP > 0 ? attacker : defender;
    const loser = attackerHP > 0 ? defender : attacker;
    const xpGained = 50 + Math.floor(Math.random() * 50);
    const goldGained = Math.floor(Math.random() * 20) + 10;
    const lostGold = Math.min(loser.currentGold, goldGained / 2);

    // Actualizar valores en BD
    await db.run(
      `UPDATE characters 
       SET currentGold = currentGold + ?, totalGold = totalGold + ?, currentXp = currentXp + ? 
       WHERE id = ?`,
      [goldGained, goldGained, xpGained, winner.id]
    );

    await db.run(
      `UPDATE characters SET currentGold = currentGold - ? WHERE id = ?`,
      [lostGold, loser.id]
    );

    await saveBattle(attacker_id, defender_id, winner.id, goldGained, xpGained);

    // Notificar al jugador atacado
    if (connectedUsers.has(defender.id)) {
      sendRealTimeNotification(defender.id, `¡${attacker.name} te ha atacado!`);
    } else {
      await sendMessage(attacker_id, defender_id, "Has sido atacado", `El jugador ${attacker.name} te ha atacado.`);
    }

    res.json({
      message: `${winner.name} ha ganado la batalla.`,
      battle_log: battleLog,
      xpGained,
      goldGained
    });
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
