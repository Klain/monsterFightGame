import express, { Request, Response } from "express";
import authMiddleware from "../middleware/authMiddleware";
import { validateCharacterMiddleware } from "../middleware/validateCharacterMiddleware";
import { validateAttributeMiddleware } from "../middleware/validateAttributeMiddleware";
import webSocketService from "../services/webSocketService";
import { Character } from "../models/character.model";

const router = express.Router();

router.post("/goldChest", authMiddleware , validateCharacterMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
      const userId = req.locals.user!.id;
      const character : Character = req.locals.character;
      const cost = character.calculateUpgradeCost(character.goldChest);
      if (character.currentGold < cost) {
        res.status(400).json({ error: "No tienes suficiente oro para mejorar tu cofre." });
        return;
      }
      character.goldChest+=1;
      character.currentGold-=cost;
      webSocketService.characterRefresh(userId,{...character?.wsr()});
      res.status(200);
  } catch (error) {
    console.error("Error en la mejora de atributo:", error);
    res.status(500).json({ error: "Error interno al mejorar el atributo." });
  }
});
router.post("/warehouse", authMiddleware , validateCharacterMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
      const userId = req.locals.user!.id;
      const character : Character = req.locals.character;
      const cost = character.calculateUpgradeCost(character.warehouse);
      if (character.currentGold < cost) {
        res.status(400).json({ error: "No tienes suficiente oro para mejorar tu warehouse." });
        return;
      }
      character.warehouse+=1;
      character.currentGold-=cost;
      webSocketService.characterRefresh(userId,{...character?.wsr()});
      res.status(200);
  } catch (error) {
    console.error("Error en la mejora de atributo:", error);
    res.status(500).json({ error: "Error interno al mejorar el atributo." });
  }
});
router.post("/enviroment", authMiddleware , validateCharacterMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
      const userId = req.locals.user!.id;
      const character : Character = req.locals.character;
      const cost = character.calculateUpgradeCost(character.environment);
      if (character.currentGold < cost) {
        res.status(400).json({ error: "No tienes suficiente oro para mejorar tu enviroment." });
        return;
      }
      character.environment+=1;
      character.currentGold-=cost;
      webSocketService.characterRefresh(userId,{...character?.wsr()});
      res.status(200);
  } catch (error) {
    console.error("Error en la mejora de atributo:", error);
    res.status(500).json({ error: "Error interno al mejorar el atributo." });
  }
});
router.post("/traps", authMiddleware , validateCharacterMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
      const userId = req.locals.user!.id;
      const character : Character = req.locals.character;
      const cost = character.calculateUpgradeCost(character.traps);
      if (character.currentGold < cost) {
        res.status(400).json({ error: "No tienes suficiente oro para mejorar tu traps." });
        return;
      }
      character.traps+=1;
      character.currentGold-=cost;
      webSocketService.characterRefresh(userId,{...character?.wsr()});
      res.status(200);
  } catch (error) {
    console.error("Error en la mejora de atributo:", error);
    res.status(500).json({ error: "Error interno al mejorar el atributo." });
  }
});

export default router;
