import express, { Request, Response } from "express";
import authMiddleware from "../middleware/authMiddleware";
import { validateCharacterMiddleware } from "../middleware/validateCharacterMiddleware";
import { Character } from "../models/character.model";
import CacheDataService from "../services/cache/CacheDataService";
import webSocketService from "../services/webSocketService";

const router = express.Router();

router.get("/", authMiddleware, validateCharacterMiddleware, async (req: Request, res: Response) => {
  try {
    const character: Character = req.locals.character;
    res.status(200).json(character.inventory);
  } catch (error) {
    console.error("❌ Error al obtener inventario:", error);
    res.status(500).json({ error: "Error interno al recuperar el inventario." });
  }
});
router.post("/equip/:itemId", authMiddleware, validateCharacterMiddleware, async (req: Request, res: Response) => {
  try {
    const character: Character = req.locals.character;
    const itemId = Number(req.params.itemId);
    if (isNaN(itemId)) {
      res.status(400).json({ error: "El itemId debe ser un número válido." });
      return ;
    }
    const item = character.inventory.items.find(i => !i.equipped && i.id === itemId);
    if (!item) {
      res.status(404).json({ error: "Ítem no encontrado o ya equipado." });
      return ;
    }
    character.equipItem(item.id);
    webSocketService.characterRefresh(character.userId, { ...character.wsr() });
    res.status(200).json({ message: "Ítem equipado con éxito" });
  } catch (error: any) {
    console.error("❌ Error al equipar ítem:", error);
    res.status(500).json({ error: error instanceof Error ? error.message : "Error al equipar el ítem." });
  }
});
router.post("/unequip/:itemId", authMiddleware, validateCharacterMiddleware, async (req: Request, res: Response) => {
  try {
    const character: Character = req.locals.character;
    const itemId = Number(req.params.itemId);
    if (isNaN(itemId)) {
      res.status(400).json({ error: "El itemId debe ser un número válido." });
      return;
    }
    const item = character.inventory.items.find(i => i.equipped && i.id === itemId);
    if (!item) {
      res.status(404).json({ error: "Ítem no encontrado o ya está desequipado." });
      return;
    }
    character.unequipItem(item.id);
    webSocketService.characterRefresh(character.userId, { ...character.wsr() });
    res.status(200).json({ message: "Ítem desequipado con éxito" });
  } catch (error: any) {
    console.error("❌ Error al desequipar ítem:", error);
    res.status(500).json({ error: error instanceof Error ? error.message : "Error al desequipar el ítem." });
  }
});

export default router;
