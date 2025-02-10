import express, { Request, response, Response } from "express";
import CharacterService from "../services/characterService";
import ActivityService from "../services/activityService";
import authMiddleware from "../middleware/authMiddleware";
import { validateCharacterMiddleware } from "../middleware/validateCharacterMiddleware";
import { validateActivityMiddleware } from "../middleware/validateActivityMiddleware";
import { validateActivityStartMiddleware } from "../middleware/validateActivityStartMiddleware";
import { ActivityType } from "../constants/activities";

const router = express.Router();

//Obtener duración máxima permitida para una actividad
router.get(
  "/max-duration/:activity",
  authMiddleware,
  validateCharacterMiddleware,
  validateActivityMiddleware,
  async (req: Request, res: Response) => {
    try {
      const activityType =req.locals.activityType;
      const character = req.locals.character;

      let maxDuration = 1;
      if (activityType === "explorar") {
        maxDuration = character.currentStamina;
      } else if (activityType === "sanar") {
        maxDuration = character.currentHealth < character.totalHealth ? 60 : 0;
      } else if (activityType === "meditar") {
        maxDuration = character.currentMana < character.totalMana ? 60 : 0;
      }

      res.json({ activity: activityType, maxDuration });
    } catch (error) {
      console.error("Error al obtener duración máxima:", error);
      res.status(500).json({ error: "Error interno." });
    }
  }
);


// Ruta: Iniciar actividad
router.post(
  "/start",
  authMiddleware,
  validateCharacterMiddleware,
  validateActivityMiddleware,
  validateActivityStartMiddleware,
  async (req: Request, res: Response) => {
    try {
      const character = req.locals.character;
      const activityType = req.locals.activityType!;
      const { duration } = req.body;


      await ActivityService.startActivity(character, activityType, duration);
      res.json({ message: "Actividad iniciada correctamente." });
    } catch (error) {
      console.error("Error al iniciar actividad:", error);
      res.status(500).json({ error: "Error interno." });
    }
  }
);

//Consultar estado de actividad
router.get(
  "/status",
  authMiddleware,
  validateCharacterMiddleware,
  async (req: Request, res: Response) => {
    try {
      const character = req.locals.character;
      const status = await ActivityService.getActivityStatus(character);
      res.json(status);
    } catch (error) {
      console.error("Error al obtener estado de la actividad:", error);
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
      const character = req.locals.character;
      const updatedCharacter = await ActivityService.claimActivityReward(character);
      res.json(updatedCharacter);
    } catch (error) {
      console.error("Error al reclamar recompensa:", error);
      res.status(500).json({ error: "Error interno." });
    }
  }
);

export default router;
