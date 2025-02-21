// src/middleware/validateCharacterMiddleware.ts
import { Request, Response, NextFunction } from "express";
import CacheDataService from "../services/cache/CacheDataService";

export const validateItemMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const itemId : number = +(req.body?.itemId || req.params?.itemId);
    const item = await CacheDataService.getItemDefinitionById(itemId);
    if (!item) {
      res.status(404).json({ error: "No existe el objeto seleccionado." });
      return;
    }
    req.locals.item = item;
    next(); 
  } catch (error) {
    console.error("❌ Error al validar el personaje:", error);
    res.status(500).json({ error: "Error interno al validar el personaje." });
  }
};
