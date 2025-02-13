// src/middleware/validateCharacterMiddleware.ts
import { Request, Response, NextFunction } from "express";
import CharacterService from "../services/characterService";

export const validateDefenderMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { defender_id } = req.body;
    if (!defender_id) {
      res.status(400).json({ error: "El ID del defensor es obligatorio." });
      return;
    }
    const defender = await CharacterService.getCharacterById(defender_id);
    if (!defender) {
      res.status(404).json({ error: "Oponente no encontrado para el usuario." });
      return;
    }

    req.locals.combat = {
      defender : defender
    };

    next(); 
  } catch (error) {
    console.error("❌ Error al validar el personaje:", error);
    res.status(500).json({ error: "Error interno al validar el personaje." });
  }
};
