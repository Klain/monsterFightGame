import express, { Request, Response } from "express";
import { db } from "../database";
import authMiddleware from "../middleware/authMiddleware";
import { handleCombat, canAttackAgain } from "../services/combatService";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";

const router = express.Router();

// Ruta: Iniciar un combate entre jugadores
router.post("/battle", authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Usuario no autenticado." });
      return;
    }
    const userId = req.user.id;
    const { defender_id } = req.body;

    if (!defender_id) {
      res.status(400).json({ error: "El ID del defensor es obligatorio." });
      return;
    }

    const allowed = await canAttackAgain(userId, defender_id);
    if (!allowed) {
      res.status(400).json({ error: "Debes esperar al menos 1 hora antes de atacar de nuevo." });
      return;
    }

    await handleCombat(userId, defender_id, res);
  } catch (error) {
    console.error("Error al procesar la batalla:", error);
    res.status(500).json({ error: "Error interno al procesar la batalla." });
  }
});

// Ruta: Buscar un oponente aleatorio para combatir
router.get("/find-opponent", authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Usuario no autenticado." });
      return;
    }
    const userId = req.user.id;

    const player = await new Promise<any>((resolve, reject) => {
      db.get("SELECT * FROM characters WHERE user_id = ?", [userId], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });

    if (!player) {
      res.status(404).json({ error: "No tienes un personaje." });
      return;
    }

    const minLevel = Math.max(1, player.level - 2);
    const maxLevel = player.level + 2;

    const opponent = await new Promise<any>((resolve, reject) => {
      db.get(
        `SELECT * FROM characters WHERE level BETWEEN ? AND ? AND user_id != ? ORDER BY RANDOM() LIMIT 1`,
        [minLevel, maxLevel, userId],
        (err, row) => {
          if (err) return reject(err);
          resolve(row);
        }
      );
    });

    if (!opponent) {
      res.status(404).json({ error: "No se encontró un oponente adecuado." });
      return;
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

// Ruta: Luchar en la arena contra un oponente aleatorio
router.post("/arena-battle", authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Usuario no autenticado." });
      return;
    }

    const userId = req.user.id;
    const player = await new Promise<any>((resolve, reject) => {
      db.get("SELECT id FROM characters WHERE user_id = ?", [userId], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });

    if (!player) {
      res.status(404).json({ error: "No tienes un personaje." });
      return;
    }

    const opponent = await new Promise<any>((resolve, reject) => {
      db.get(
        `SELECT id FROM characters WHERE level BETWEEN (SELECT level FROM characters WHERE user_id = ?) - 2 
         AND (SELECT level FROM characters WHERE user_id = ?) + 2 AND user_id != ? ORDER BY RANDOM() LIMIT 1`,
        [userId, userId, userId],
        (err, row) => {
          if (err) return reject(err);
          resolve(row);
        }
      );
    });

    if (!opponent) {
      res.status(404).json({ error: "No se encontró un oponente." });
      return;
    }

    await handleCombat(player.id, opponent.id, res);
  } catch (error) {
    console.error("Error al iniciar la batalla en la arena:", error);
    res.status(500).json({ error: "Error interno al iniciar la batalla en la arena." });
  }
});

// Ruta: Obtener el historial de batallas
router.get("/battle-log", authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Usuario no autenticado." });
      return;
    }
    const userId = req.user.id;

    const battle_log = await new Promise<any[]>((resolve, reject) => {
      db.all(
        `SELECT * FROM battles WHERE attacker_id = ? OR defender_id = ? ORDER BY last_attack DESC LIMIT 10`,
        [userId, userId],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });

    res.json({ battle_log });
  } catch (error) {
    console.error("Error al obtener el historial de batallas:", error);
    res.status(500).json({ error: "Error interno al obtener el historial de batallas." });
  }
});

export default router;
