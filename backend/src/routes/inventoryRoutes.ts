import express, { Request, Response } from "express";
import authMiddleware from "../middleware/authMiddleware";
import { validateCharacterMiddleware } from "../middleware/validateCharacterMiddleware";
import { Character } from "../models/character.model";
import CacheDataService from "../services/CacheDataService";
import webSocketService from "../services/webSocketService";

const router = express.Router();

router.get("/", authMiddleware, validateCharacterMiddleware, async (req: Request, res: Response) => {
  try {
    const character : Character = req.locals.character;
    res.status(200).json(character.inventory);
  } catch (error) {
    console.error("❌ Error al obtener inventario:", error);
    res.status(500).json({ error: "Error interno al recuperar el inventario." });
  }
});

router.post("/equip/:itemId", authMiddleware, validateCharacterMiddleware, async (req: Request, res: Response) => {
  try {
    const character : Character = req.locals.character;
    const { itemId } = req.params;
    const item = character.inventory.items.filter(item=> item.equipped==false && item.id==(Number(itemId)))[0];
    if(!item){  res.status(404).json({ error: "Objeto no encontrado." });  }
    character.equipItem(item!.id);
    webSocketService.characterRefresh(character.userId, {...character.inventory.wsr});
    res.status(200).json({ message: "Ítem equipado con éxito" });
  } catch (error:any) {
    console.error("❌ Error al equipar ítem:", error);
    res.status(500).json({ error: error.message || "Error al equipar el ítem." });
  }
});

router.post("/unequip/:itemId", authMiddleware, validateCharacterMiddleware, async (req: Request, res: Response) => {
  try {
    const character : Character = req.locals.character;
    const { itemId } = req.params;
    const item = character.inventory.items.filter(item=> item.equipped==true && item.id==(Number(itemId)))[0];
    character.unequipItem(item.id);
    webSocketService.characterRefresh(character.userId, {...character.inventory.wsr()});
    res.status(200).json({ message: "Ítem desequipado con éxito" });
  } catch (error:any) {
    console.error("❌ Error al desequipar ítem:", error);
    res.status(500).json({ error: error.message || "Error al desequipar el ítem." });
  }
});

export default router;
