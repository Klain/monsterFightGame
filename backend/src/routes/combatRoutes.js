//backend\src\routes\combatRoutes.js
const express = require("express");
const { db } = require("../database");
const authenticateToken = require("../middleware/authMiddleware");
const { handleCombat, canAttackAgain } = require("../services/combatService");

const router = express.Router();

/**
 * Iniciar un combate entre jugadores
 */
router.post("/battle", authenticateToken, async (req, res) => {
  try {
    const { defender_id } = req.body;

    if (!defender_id) {
      return res.status(400).json({ error: "El ID del defensor es obligatorio." });
    }

    const allowed = await canAttackAgain(req.user.id, defender_id);
    if (!allowed) {
      return res.status(400).json({ error: "Debes esperar al menos 1 hora antes de atacar de nuevo." });
    }

    handleCombat(req.user.id, defender_id, res);
  } catch (error) {
    console.error("Error al procesar la batalla:", error);
    res.status(500).json({ error: "Error interno al procesar la batalla." });
  }
});

/**
 * Buscar un oponente aleatorio para combatir
 */
router.get("/find-opponent", authenticateToken, async (req, res) => {
  try {
    const player = await db.get("SELECT * FROM characters WHERE user_id = ?", [req.user.id]);

    if (!player) {
      return res.status(404).json({ error: "No tienes un personaje." });
    }

    const minLevel = Math.max(1, player.level - 2);
    const maxLevel = player.level + 2;

    const opponent = await db.get(
      `SELECT * FROM characters WHERE level BETWEEN ? AND ? AND user_id != ? ORDER BY RANDOM() LIMIT 1`,
      [minLevel, maxLevel, req.user.id]
    );

    if (!opponent) {
      return res.status(404).json({ error: "No se encontró un oponente adecuado." });
    }

    res.json({
      message: "Oponente encontrado.",
      opponent: {
        id: opponent.id,
        name: opponent.name,
        level: opponent.level,
        attack: opponent.attack,
        defense: opponent.defense,
        health: opponent.health,
      },
    });
  } catch (error) {
    console.error("Error al buscar un oponente:", error);
    res.status(500).json({ error: "Error interno al buscar un oponente." });
  }
});

/**
 * Luchar en la arena contra un oponente aleatorio
 */
router.post("/arena-battle", authenticateToken, async (req, res) => {
  try {
    const player = await db.get("SELECT id FROM characters WHERE user_id = ?", [req.user.id]);

    if (!player) {
      return res.status(404).json({ error: "No tienes un personaje." });
    }

    const opponent = await db.get(
      `SELECT id FROM characters WHERE level BETWEEN (SELECT level FROM characters WHERE user_id = ?) - 2 
       AND (SELECT level FROM characters WHERE user_id = ?) + 2 AND user_id != ? ORDER BY RANDOM() LIMIT 1`,
      [req.user.id, req.user.id, req.user.id]
    );

    if (!opponent) {
      return res.status(404).json({ error: "No se encontró un oponente." });
    }

    handleCombat(player.id, opponent.id, res);
  } catch (error) {
    console.error("Error al iniciar la batalla en la arena:", error);
    res.status(500).json({ error: "Error interno al iniciar la batalla en la arena." });
  }
});

/**
 * Obtener el historial de batallas
 */
router.get("/battle-log", authenticateToken, async (req, res) => {
  try {
    const battle_log = await db.all(
      `SELECT * FROM battles WHERE attacker_id = ? OR defender_id = ? ORDER BY last_attack DESC LIMIT 10`,
      [req.user.id, req.user.id]
    );

    res.json({ battle_log });
  } catch (error) {
    console.error("Error al obtener el historial de batallas:", error);
    res.status(500).json({ error: "Error interno al obtener el historial de batallas." });
  }
});

module.exports = router;
