import express, { Request, response, Response } from "express";
import ActivityService from "../services/activityService";
import authMiddleware from "../middleware/authMiddleware";
import { validateCharacterMiddleware } from "../middleware/validateCharacterMiddleware";
import { validateActivityMiddleware } from "../middleware/validateActivityMiddleware";
import webSocketService from "../services/webSocketService";
import { ActivityType } from "../constants/enums";

const router = express.Router();

router.post(
  "/start",
  authMiddleware,
  validateCharacterMiddleware,
  validateActivityMiddleware,
  async (req: Request, res: Response) => {
    try {
      const userId = req.locals.user!.id;
      const character = req.locals.character;
      const activityType = req.locals.activityType!;
      const { duration } = req.body;

      const existingActivity = await ActivityService.getActivityStatus(character);
      if (existingActivity) {
        res.status(400).json({ message: "El personaje ya está en otra actividad." });
        return;
      }

      let maxDuration = 1;
      if (activityType === ActivityType.EXPLORE) {
        maxDuration = character.currentStamina;
      } else if (activityType === ActivityType.HEAL) {
        maxDuration = character.currentHealth < character.totalHealth ? 60 : 0;
      } else if (activityType === ActivityType.REST) {
        maxDuration = character.currentStamina < character.totalStamina ? 60 : 0;
      } else if (activityType === ActivityType.MEDITATE) {
        maxDuration = character.currentMana < character.totalMana ? 60 : 0;
      }

      if (duration < 1 || duration > maxDuration) {
        res.status(400).json({ error: `Duración inválida. Máximo permitido: ${maxDuration} minutos.` });

      }

      await ActivityService.startActivity(character, activityType, duration);
      const activity =  await ActivityService.getActivityStatus(character);

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

//Reclamar recompensa de actividad
router.post(
  "/claim",
  authMiddleware,
  validateCharacterMiddleware,
  async (req: Request, res: Response) => {
    try {
      const userId = req.locals.user!.id;
      const character = req.locals.character;
      const updatedCharacter = await ActivityService.claimActivityReward(character);
      const activity =  await ActivityService.getActivityStatus(character);

      webSocketService.characterRefresh(userId,{
        ...updatedCharacter?.wsr(),
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
