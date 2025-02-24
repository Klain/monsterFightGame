import express, { Request, response, Response } from "express";
import authMiddleware from "../middleware/authMiddleware";
import { validateCharacterMiddleware } from "../middleware/validateCharacterMiddleware";
import { validateActivityMiddleware } from "../middleware/validateActivityMiddleware";
import webSocketService from "../services/webSocketService";
import { ActivityType } from "../constants/enums";
import { Character } from "../models/character.model";
import CacheDataService from "../services/cache/CacheDataService";

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

      let maxDuration = 1;
      if (activityType === ActivityType.EXPLORE) {
        maxDuration = character.currentStamina;
      } else if (activityType === ActivityType.HEAL) {
        maxDuration = character.currentHealth < character.totalHealth ? character.totalHealth - character.currentHealth : 0;
      } else if (activityType === ActivityType.REST) {
        maxDuration = character.currentStamina < character.totalStamina ? character.totalStamina - character.currentStamina : 0;
      } else if (activityType === ActivityType.MEDITATE) {
        maxDuration = character.currentMana < character.totalMana ? character.totalMana - character.currentMana : 0;
      }

      if (duration < 1 || duration > maxDuration) {
        res.status(400).json({ error: `Duración inválida. Máximo permitido: ${maxDuration} minutos.` });
        return;
      }
      const activity = await character.startActivity(activityType, duration);
      if(!activity){res.status(500).json({ error: `Error al iniciar la actividad` }); }
      webSocketService.characterRefresh(userId,
        (activity ? activity.wsr() : { activity: null }),
      );
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
      if (character.getActivityStatus()!.getRemainingTime() > 0) {
        res.status(404).json({ error: "La actividad aún no está completada." });
      }
      character.claimActivityReward();
      const activity = character.getActivityStatus();
      webSocketService.characterRefresh(userId,{
        ...character?.wsr(),
        ...(activity ? activity.wsr() : { activity: null }),
      });
      res.status(200);
    } catch (error) {
      console.error("Error al reclamar recompensa:", error);
      res.status(500).json({ error: "Error interno." });
    }
  }
);

export default router;
