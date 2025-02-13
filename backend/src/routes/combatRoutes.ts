import express, { Request, Response } from "express";
import authMiddleware from "../middleware/authMiddleware";
import { Character } from "../models/character.model";
import CharacterService from "../services/characterService";
import CombatService from "../services/combatService";
import ServerConfig from "../constants/serverConfig";
import { validateCharacterMiddleware } from "../middleware/validateCharacterMiddleware";
import { validateDefenderMiddleware } from "../middleware/validateDefenderMiddleware";

const router = express.Router();

// Ruta: Buscar un oponente aleatorio para combatir
router.get("/searchOpponent", authMiddleware, validateCharacterMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const character : Character = req.locals.character;
    if(character.currentStamina<ServerConfig.assaultSearchCost){
      res.status(404).json({ error: "No tienes suficiente energía." });
      return;
    }

    const opponents = await CharacterService.getOpponentList(character, 5);
    if (opponents.length === 0) {
      res.status(404).json({ error: "No se encontró un oponente adecuado." });
      return;
    }

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
export default router;



// ya veremos si utilizamos esto o no... Ruta: Luchar en la arena contra un oponente aleatorio
/*router.post("/arena-battle", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.locals.user?.id || 0;

    // Obtener personaje del usuario
    const player = await CharacterService.getCharacterById(userId);
    if (!player) {
      res.status(404).json({ error: "No tienes un personaje." });
      return;
    }

    // Buscar un oponente aleatorio
    const opponents = await CharacterService.getOpponentList(player, 5);
    const opponent = opponents[Math.floor(Math.random() * opponents.length)];

    if (!opponent) {
      res.status(404).json({ error: "No se encontró un oponente." });
      return;
    }

    // Manejar combate
    const combatResult = await CombatService.handleCombat(player, opponent);
    res.status(200).json(combatResult);
  } catch (error) {
    console.error("Error al iniciar la batalla en la arena:", error);
    res.status(500).json({ error: "Error interno al iniciar la batalla en la arena." });
  }
});
export default router;

*/
