import express, { Request, Response } from "express";
import authMiddleware from "../middleware/authMiddleware";
import { validateCharacterMiddleware } from "../middleware/validateCharacterMiddleware";
import { validateDefenderMiddleware } from "../middleware/validateDefenderMiddleware";
import CacheDataService from "../services/cache/CacheDataService";
import { Character } from "../models/character.model";
import CombatService from "../services/combatService";
import ServerConfig from "../constants/serverConfig";
import webSocketService from "../services/webSocketService";

const router = express.Router();

// Ruta: Buscar un oponente aleatorio para combatir
router.get("/searchOpponent", authMiddleware, validateCharacterMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const character : Character = req.locals.character;
    if(character.currentStamina<ServerConfig.assault.searchCost){
      res.status(404).json({ error: "No tienes suficiente energía." });
      return;
    }
    const opponents = await CombatService.getOpponentList(character, 5);
    if (opponents.length === 0) {
      res.status(404).json({ error: "No se encontró un oponente adecuado." });
      return;
    }
    character.currentStamina-=ServerConfig.assault.searchCost;
    webSocketService.characterRefresh(character.userId,{...character.wsrStatus()});
    
    res.json({
      message: "Oponentes encontrados.",
      opponents: opponents.map((opponent) => ({
        id: opponent.id,
        name: opponent.name,
        level: opponent.level,
      })),
    });
  } catch (error) {
    console.error("Error al buscar un oponente:", error);
    res.status(500).json({ error: "Error interno al buscar un oponente." });
  }
});
// Ruta: Iniciar un combate entre jugadores
router.post("/assault", authMiddleware , validateCharacterMiddleware , validateDefenderMiddleware , async (req: Request, res: Response): Promise<void> => {
  try {
    const attacker : Character = req.locals.character;
    const defender : Character = req.locals.combat!.defender;
    const combatResult = await CombatService.handleCombat(attacker, defender);
    res.status(200).json(combatResult);
  } catch (error) {
    console.error("Error al procesar la batalla:", error);
    res.status(500).json({ error: "Error interno al procesar la batalla." });
  }
});

router.post("/heist", authMiddleware , validateCharacterMiddleware , validateDefenderMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const thief = req.locals.character;
    const target = req.locals.combat!.defender;
    const heistLog = await CombatService.handleHeist(thief, target);

    res.json({
      message: "Intento de robo procesado.",
      log: heistLog,
    });
  } catch (error) {
    console.error("Error al procesar el intento de robo:", error);
    res.status(500).json({ error: "Error interno al procesar el intento de robo." });
  }
});

router.get( "/leaderboard", authMiddleware, validateCharacterMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      if (page < 1 || limit < 1) {
        res.status(400).json({ error: "Los parámetros page y limit deben ser números positivos." });
        return;
      }
      const allCharacters = CacheDataService.getAllCharacters();
      const totalCharacters = allCharacters.length;
      const sortedCharacters = allCharacters.sort((a, b) => b.totalGold - a.totalGold);
      const startIndex = (page - 1) * limit;
      const paginatedCharacters = sortedCharacters.slice(startIndex, startIndex + limit);
      res.json({
        characters: paginatedCharacters,
        page,
        limit,
        total: totalCharacters,
        totalPages: Math.ceil(totalCharacters / limit)
      });
    } catch (error) {
      console.error("Error al obtener el leaderboard:", error);
      res.status(500).json({ error: "Error interno al obtener el leaderboard." });
    }
  }
);

export default router;
