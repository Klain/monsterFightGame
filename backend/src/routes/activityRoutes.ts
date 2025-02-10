import express, { Request, response, Response } from "express";
import CharacterService from "../services/characterService";
import ActivityService from "../services/activityService";
import authMiddleware from "../middleware/authMiddleware";
import { validateCharacterMiddleware } from "../middleware/validateCharacterMiddleware";
import { validateActivityMiddleware } from "../middleware/validateActivityMiddleware";
import { ActivityType } from "../constants/activities";

const router = express.Router();

// Ruta: Iniciar actividad
router.post(
  "/start",
    authMiddleware,
    validateCharacterMiddleware,
    validateActivityMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.locals.user.id;
      const character = req.locals.character;
      const activityType = req.locals.activityType as ActivityType;

      const activityTypes: Record<ActivityType, { duration: number; reward_xp: number; reward_gold: number }> = {
        trabajo: { duration: 1, reward_xp: 100, reward_gold: 50 },
        entrenamiento: { duration: 1, reward_xp: 150, reward_gold: 20 },
      };

      const { duration, reward_xp, reward_gold } = activityTypes[activityType];

      await ActivityService.startActivity(userId, character.id, activityType, duration, reward_xp, reward_gold, res);
      res.json({ message: "Actividad iniciada exitosamente." });
    } catch (error) {
      console.error("Error al iniciar actividad:", error);
      res.status(500).json({ error: "Error interno al iniciar la actividad." });
    }
  }
);

// Ruta: Estado de la actividad
router.get("/status",
  authMiddleware,
  validateCharacterMiddleware,
async (req: Request, res: Response): Promise<void> => {
  try {
    const character = req.locals.character;
    const status = await ActivityService.getActivityStatus(character.id,res);
    res.json(status);
  } catch (error) {
    console.error("Error al obtener estado de la actividad:", error);
    res.status(500).json({ error: "Error interno al consultar la actividad." });
  }
});

// Ruta: Reclamar recompensa
router.post("/claim",
  authMiddleware,
  validateCharacterMiddleware,
  validateActivityMiddleware,
async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.locals.user.id;
    const character = req.locals.character;

    await ActivityService.claimActivityReward(character.id,res);
    const updatedCharacter = await CharacterService.getCharacterById(userId);
    res.json(updatedCharacter);
  } catch (error) {
    console.error("Error al reclamar recompensa de la actividad:", error);
    res.status(500).json({ error: "Error interno al reclamar la recompensa." });
  }
});

export default router;
