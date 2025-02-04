//backend\src\routes\characterRoutes.js
const express = require("express");
const db = require("../database");
const authenticateToken = require("../middleware/authMiddleware");
const {
  addExperience,
  upgradeAttribute,
  regenerateHealth,
  buyHealing,
} = require("../services/characterService");
const {
  handleCombat,
  canAttackAgain,
} = require("../services/combatService");

const router = express.Router();

// Crear un nuevo personaje
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { name, faction, class: characterClass } = req.body;
    const user_id = req.user.id;

    if (!name || !faction || !characterClass) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    // Verificar si el usuario ya tiene un personaje
    const existingCharacter = await db.get("SELECT * FROM characters WHERE user_id = ?", [user_id]);
    if (existingCharacter) {
      return res.status(400).json({ error: "Ya tienes un personaje creado" });
    }

    const result = await db.run(
      `INSERT INTO characters (user_id, name, faction, class) VALUES (?, ?, ?, ?)`,
      [user_id, name, faction, characterClass]
    );

    res.status(201).json({
      id: result.lastID,
      name,
      faction,
      class: characterClass,
      level: 1,
      experience: 0,
    });
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Obtener el personaje del usuario autenticado
router.get("/", authenticateToken, async (req, res) => {
  try {
    const character = await db.get("SELECT * FROM characters WHERE user_id = ?", [req.user.id]);

    if (!character) {
      return res.status(404).json({ error: "No se encontró un personaje para este usuario" });
    }
    res.json(character);
  } catch (error) {
    res.status(500).json({ error: "Error al recuperar el personaje" });
  }
});

// Añadir experiencia al personaje
router.post("/add-xp", authenticateToken, async (req, res) => {
  const { xp } = req.body;
  if (!xp || xp <= 0) {
    return res.status(400).json({ error: "La experiencia debe ser un número positivo" });
  }

  addExperience(req.user.id, xp, res);
});

// Iniciar un combate entre jugadores
router.post("/battle", authenticateToken, async (req, res) => {
  const { defender_id } = req.body;
  if (!defender_id) {
    return res.status(400).json({ error: "Falta el ID del defensor" });
  }

  try {
    const allowed = await canAttackAgain(req.user.id, defender_id);
    if (!allowed) {
      return res.status(400).json({ error: "Debes esperar al menos 1 hora antes de atacar de nuevo" });
    }

    handleCombat(req.user.id, defender_id, res);
  } catch (error) {
    res.status(500).json({ error: "Error al procesar la batalla" });
  }
});

// Buscar un oponente aleatorio para combatir
router.get("/find-opponent", authenticateToken, async (req, res) => {
  try {
    const player = await db.get("SELECT * FROM characters WHERE user_id = ?", [req.user.id]);

    if (!player) {
      return res.status(404).json({ error: "No tienes un personaje" });
    }

    const minLevel = Math.max(1, player.level - 2);
    const maxLevel = player.level + 2;

    const opponent = await db.get(
      `SELECT * FROM characters WHERE level BETWEEN ? AND ? AND user_id != ? ORDER BY RANDOM() LIMIT 1`,
      [minLevel, maxLevel, req.user.id]
    );

    if (!opponent) {
      return res.status(404).json({ error: "No se encontró un oponente adecuado" });
    }

    res.json({
      message: "Oponente encontrado",
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
    res.status(500).json({ error: "Error al buscar un oponente" });
  }
});

// Luchar en la arena contra un oponente aleatorio
router.post("/arena-battle", authenticateToken, async (req, res) => {
  try {
    const player = await db.get("SELECT id FROM characters WHERE user_id = ?", [req.user.id]);

    if (!player) {
      return res.status(404).json({ error: "No tienes un personaje" });
    }

    const opponent = await db.get(
      `SELECT id FROM characters WHERE level BETWEEN (SELECT level FROM characters WHERE user_id = ?) - 2 
       AND (SELECT level FROM characters WHERE user_id = ?) + 2 AND user_id != ? ORDER BY RANDOM() LIMIT 1`,
      [req.user.id, req.user.id, req.user.id]
    );

    if (!opponent) {
      return res.status(404).json({ error: "No se encontró un oponente" });
    }

    handleCombat(player.id, opponent.id, res);
  } catch (error) {
    res.status(500).json({ error: "Error al iniciar la batalla en la arena" });
  }
});

// Obtener el ranking de los mejores jugadores
router.get("/leaderboard", async (req, res) => {
  try {
    const leaderboard = await db.all(
      `SELECT name, level, totalXp, totalGold FROM characters ORDER BY totalXp DESC LIMIT 10`
    );

    res.json({ leaderboard });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el ranking" });
  }
});

// Mejorar un atributo usando experiencia
router.post("/upgrade-attribute", authenticateToken, async (req, res) => {
  const { attribute } = req.body;
  if (!attribute) {
    return res.status(400).json({ error: "Debes especificar un atributo para mejorar" });
  }

  upgradeAttribute(req.user.id, attribute, res);
});

// Regenerar salud del personaje
router.get("/regenerate-health", authenticateToken, async (req, res) => {
  regenerateHealth(req.user.id, res);
});

// Comprar curación
router.post("/buy-healing", authenticateToken, async (req, res) => {
  buyHealing(req.user.id, res);
});

// Obtener el historial de batallas
router.get("/battle-log", authenticateToken, async (req, res) => {
  try {
    const battle_log = await db.all(
      `SELECT * FROM battles WHERE attacker_id = ? OR defender_id = ? ORDER BY last_attack DESC LIMIT 10`,
      [req.user.id, req.user.id]
    );

    res.json({ battle_log });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el historial de batallas" });
  }
});

module.exports = router;
