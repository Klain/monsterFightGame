import { Request, Response, NextFunction } from "express";
import ActivityService from "../services/activityService";

export const validateActivityStartMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { activity, duration } = req.body;
    const character = req.locals.character;
    const activityType =  req.locals.activityType;

    const existingActivity = await ActivityService.getActivityStatus(character);
    if (existingActivity) {
      res.status(400).json({ error: "El personaje ya está en otra actividad." });
      return;
    }

    let maxDuration = 1;
    if (activity === "explorar") {
      maxDuration = character.currentStamina;
    } else if (activity === "sanar") {
      maxDuration = character.currentHealth < character.totalHealth ? 60 : 0;
    } else if (activity === "meditar") {
      maxDuration = character.currentMana < character.totalMana ? 60 : 0;
    }

    if (duration < 1 || duration > maxDuration) {
      res.status(400).json({ error: `Duración inválida. Máximo permitido: ${maxDuration} minutos.` });
      return;
    }

    req.locals.maxDuration = maxDuration;
    next();
  } catch (error) {
    console.error("❌ Error en validación de actividad:", error);
    res.status(500).json({ error: "Error interno en validación de actividad." });
  }
};
