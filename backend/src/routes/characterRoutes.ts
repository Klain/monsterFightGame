//backend\src\routes\characterRoutes.ts
import express, { Request, Response } from "express";
import { db } from "../database";
import authMiddleware from "../middleware/authMiddleware";
import { validateCharacterMiddleware } from "../middleware/validateCharacterMiddleware";
import { validateAttributeMiddleware } from "../middleware/validateAttributeMiddleware";
import webSocketService from "../services/webSocketService";
import { Inventory } from "../models/inventory.model";

const router = express.Router();

// Ruta: Mejorar un atributo del personaje
router.post("/attributes/upgrade-attribute", authMiddleware , validateAttributeMiddleware, validateCharacterMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
      const { attribute } = req.body;
      const userId = req.locals.user!.id;
      const character = req.locals.character;
      const currentValue = character[attribute];
      const cost = character.calculateUpgradeCost(currentValue);

      if (character.currentXp < cost) {
        res.status(400).json({ error: "No tienes suficiente experiencia para mejorar este atributo." });
        return;
      }
      character[attribute]+=1;
      webSocketService.characterRefresh(userId,{...character?.wsr()});
      res.status(200);
  } catch (error) {
    console.error("Error en la mejora de atributo:", error);
    res.status(500).json({ error: "Error interno al mejorar el atributo." });
  }
});




// Ruta: Obtener el personaje del usuario autenticado
router.get("/", authMiddleware,validateCharacterMiddleware , async (req: Request, res: Response): Promise<void> => {
  try {
    const character = req.locals.character;
    const activity  = await ActivityService.getActivityStatus(character);
    const inventory = new Inventory(InventoryService.getInventory(character.id));

    res.status(200).json(webSocketService.characterRefreshBuilder(character,activity,inventory));
  } catch (error) {
    console.error("❌ Error al obtener personaje:", error);
    res.status(500).json({ error: "Error interno al recuperar el personaje." });
  }
});

export default router;
