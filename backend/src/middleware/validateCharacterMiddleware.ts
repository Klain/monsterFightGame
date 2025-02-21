// src/middleware/validateCharacterMiddleware.ts
import { Request, Response, NextFunction } from "express";
import CacheDataService from "../services/cache/CacheDataService";

export const validateCharacterMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if(req.locals.user){
      const character = CacheDataService.getCharacterById(req.locals.user.id);
      if (!character) {
        res.status(404).json({ error: "Personaje no encontrado para el usuario." });
        return;
      }
      req.locals.character = character;
      next(); 
    }else{
      throw new Error(
        "El middleware de autenticación (authMiddleware) previo, no se ejecutó correctamente o fue omitido."
      );
    }
    
  } catch (error) {
    console.error("❌ Error al validar el personaje:", error);
    res.status(500).json({ error: "Error interno al validar el personaje." });
  }
};
