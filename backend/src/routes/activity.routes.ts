import express, { Request, Response } from "express";
import authMiddleware from "../middleware/authMiddleware";
import { validateCharacterMiddleware } from "../middleware/validateCharacterMiddleware";
import { validateActivityMiddleware } from "../middleware/validateActivityMiddleware";
import webSocketService from "../services/webSocketService";
import { Character } from "../models/character.model";
import { CharacterService } from "../services/character.service";

const router = express.Router();

router.post( "/start", authMiddleware, validateCharacterMiddleware, validateActivityMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.locals.user!.id;
      const character : Character = req.locals.character;
      const activityType = req.locals.activityType!;
      const { duration } = req.body;
      if (character.getActivityStatus()) {
        res.status(400).json({ message: "El personaje ya está en otra actividad." });
        return;
      }
      const maxDuration = character.wsrActivitiesDuration().maxActivityDuration[activityType] || 0;
      if (maxDuration == 0) {
        res.status(400).json({ error: `El personaje esta exhausto.` });
        return;
      }
      if (duration < 1 || duration > maxDuration) {
        res.status(400).json({ error: `Duración inválida. Máximo permitido: ${maxDuration} minutos.` });
        return;
      }
      const activity = await CharacterService.startActivity(character, activityType, duration);
      if(!activity){res.status(500).json({ error: `Error al iniciar la actividad` }); }
      webSocketService.characterRefresh(userId,{...character?.wsr()});
      res.status(200);
    } catch (error) {
      console.error("Error al iniciar actividad:", error);
      res.status(500).json({ error: "Error interno." });
    }
  }
);
router.post( "/claim", authMiddleware, validateCharacterMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.locals.user!.id;
      const character : Character = req.locals.character;
      if (!character.getActivityStatus()) {
        res.status(404).json({ error: "No hay actividad en curso." });
      }
      if (character.getActivityStatus()!.isComplete()) {
        res.status(404).json({ error: "La actividad aún no está completada." });
      }
      const result = await CharacterService.claimActivityReward(character);
      if(!result){ 
        res.status(500).json({ error: "Error interno." });
        return;
      }
      webSocketService.characterRefresh(userId,{...character.wsr()});
      res.status(200);
    } catch (error) {
      console.error("Error al reclamar recompensa:", error);
      res.status(500).json({ error: "Error interno." });
    }
  }
);

export default router;
