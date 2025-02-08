import express, { Request, response, Response } from "express";
import authenticateToken from "../middleware/authMiddleware";
import CharacterService from "../services/characterService";
import ActivityService from "../services/activityService";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";

const router = express.Router();

// Ruta: Iniciar actividad
interface StartActivityRequest extends AuthenticatedRequest {
  body: {
    character_id: number;
    type: "trabajo" | "entrenamiento"; // Tipo explícito basado en las claves
  };
}


router.post("/start", authenticateToken, async (req: StartActivityRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Usuario no autenticado." });
      return;
    }

    const { character_id, type } = req.body;

    if (!character_id || !type) {
      res.status(400).json({ error: "character_id y type son obligatorios." });
      return;
    }

    const activityTypes = {
      trabajo: { duration: 1, reward_xp: 100, reward_gold: 50 },
      entrenamiento: { duration: 1, reward_xp: 150, reward_gold: 20 },
    };

    if (!activityTypes[type]) {
      res.status(400).json({ error: "Tipo de actividad no válido." });
      return;
    }

    const { duration, reward_xp, reward_gold } = activityTypes[type];
    await ActivityService.startActivity(req.user.id, character_id, type, duration, reward_xp, reward_gold,res);
    res.json({ message: "Actividad iniciada exitosamente." });
  } catch (error) {
    console.error("Error al iniciar actividad:", error);
    res.status(500).json({ error: "Error interno al iniciar la actividad." });
  }
});

// Ruta: Estado de la actividad
router.get("/status", authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Usuario no autenticado." });
      return;
    }

    const character = await CharacterService.getCharacterById(req.user.id);
    if (!character) {
      res.status(404).json({ error: "Personaje no encontrado." });
      return;
    }

    const status = await ActivityService.getActivityStatus(character.id,res);
    res.json(status);
  } catch (error) {
    console.error("Error al obtener estado de la actividad:", error);
    res.status(500).json({ error: "Error interno al consultar la actividad." });
  }
});

// Ruta: Reclamar recompensa
router.post("/claim", authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Usuario no autenticado." });
      return;
    }

    const character = await CharacterService.getCharacterById(req.user.id);
    if (!character) {
      res.status(404).json({ error: "Personaje no encontrado." });
      return;
    }

    await ActivityService.claimActivityReward(character.id,res);
    const updatedCharacter = await CharacterService.getCharacterById(req.user.id);
    res.json(updatedCharacter);
  } catch (error) {
    console.error("Error al reclamar recompensa de la actividad:", error);
    res.status(500).json({ error: "Error interno al reclamar la recompensa." });
  }
});

// Ruta: Iniciar entrenamiento
interface TrainingRequest extends AuthenticatedRequest {
  body: {
    duration: number;
  };
}

router.post("/training/start", authenticateToken, async (req: TrainingRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Usuario no autenticado." });
      return;
    }

    const { duration } = req.body;
    const character = await CharacterService.getCharacterById(req.user.id);
    if (!character) {
      res.status(404).json({ error: "Personaje no encontrado." });
      return;
    }

    if (!duration || duration <= 0) {
      res.status(400).json({ error: "El tiempo de entrenamiento debe ser mayor a 0." });
      return;
    }

    await ActivityService.startActivity(req.user.id, character.id, "train", duration, duration * 10, 0,res);
    res.json({ message: "Entrenamiento iniciado correctamente." });
  } catch (error) {
    console.error("Error al iniciar el entrenamiento:", error);
    res.status(500).json({ error: "Error interno al iniciar el entrenamiento." });
  }
});

// Ruta: Reclamar recompensa de entrenamiento
interface ClaimRequest extends AuthenticatedRequest {
  params: {
    character_id: string;
  };
}

router.post("/training/claim/:character_id", authenticateToken, async (req: ClaimRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Usuario no autenticado." });
      return;
    }

    const { character_id } = req.params;
    if (!character_id) {
      res.status(400).json({ error: "El ID del personaje es obligatorio." });
      return;
    }

    await ActivityService.claimActivityReward(Number(character_id),res);
    res.json({ message: "Recompensa reclamada correctamente." });
  } catch (error) {
    console.error("Error al reclamar recompensa de entrenamiento:", error);
    res.status(500).json({ error: "Error interno al reclamar la recompensa." });
  }
});

export default router;
