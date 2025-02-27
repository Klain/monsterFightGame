import express, { Request, Response } from "express";
import { ItemType } from "../constants/enums";
import authMiddleware from "../middleware/authMiddleware";
import { validateCharacterMiddleware } from "../middleware/validateCharacterMiddleware";
import { Character } from "../models/character.model";
import CacheDataService from "../services/cache/CacheDataService";
import { CharacterService } from "../services/character.service";
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
    const characterItemInstances = CacheDataService.getItemInstancesByCharacter(character);
    const item = characterItemInstances.find(itemInstance => !itemInstance.equipped && itemInstance.itemId === itemId);
    if (!item) {
      res.status(404).json({ error: "Ítem no encontrado o ya equipado." });
      return ;
    }
    const databaseItem = CacheDataService.getItemDefinitionById(item.itemId);
    if (!databaseItem){
      res.status(404).json({ error: "Definicion del objeto no encontrada." });
      return;
    }
    if (databaseItem.itemType !== ItemType.EQUIPMENT){
      res.status(404).json({ error: "Este ítem no es equipable." });
      return;
    }
    if (character.level < databaseItem.levelRequired){
      res.status(404).json({ error: "Nivel insuficiente para equipar este ítem." });
      return;
    } 
    if (!databaseItem.equipPositionType){
      res.status(404).json({ error:"El ítem no tiene una posición válida para equiparse." });
      return;
    }

    CharacterService.equipItem(character, item,databaseItem);
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
    const characterItemInstances = CacheDataService.getItemInstancesByCharacter(character);

    const item = characterItemInstances.find(i => i.equipped && i.itemId === itemId);
    if (!item) {
      res.status(404).json({ error: "Ítem no encontrado o ya está desequipado." });
      return;
    }
    const backpackItems = characterItemInstances.filter(itemInstance => !itemInstance.equipped);
    if (backpackItems.length >= 30){  
      res.status(404).json({ error: "No hay espacio en la mochila para desequipar el ítem."});
      return;
    }
    CharacterService.unequipItem(item);
    webSocketService.characterRefresh(character.userId, { ...character.wsr() });
    res.status(200).json({ message: "Ítem desequipado con éxito" });
  } catch (error: any) {
    console.error("❌ Error al desequipar ítem:", error);
    res.status(500).json({ error: error instanceof Error ? error.message : "Error al desequipar el ítem." });
  }
});

export default router;
