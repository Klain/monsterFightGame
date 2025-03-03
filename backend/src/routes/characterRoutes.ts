//backend\src\routes\characterRoutes.ts
import express, { Request, Response } from "express";
import authMiddleware from "../middleware/authMiddleware";
import { validateCharacterMiddleware } from "../middleware/validateCharacterMiddleware";
import { validateAttributeMiddleware } from "../middleware/validateAttributeMiddleware";
import webSocketService from "../services/webSocketService";
import { Character } from "../models/character.model";
import DatabaseService from "../services/database/databaseService";
import CacheDataService from "../services/cache/CacheDataService";

const router = express.Router();
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
      character.currentXp-=cost;
      character[attribute]+=1;
      webSocketService.characterRefresh(userId,{...character?.wsr()});
      res.status(200);
  } catch (error) {
    console.error("Error en la mejora de atributo:", error);
    res.status(500).json({ error: "Error interno al mejorar el atributo." });
  }
});

router.get("/", authMiddleware,validateCharacterMiddleware , async (req: Request, res: Response): Promise<void> => {
  try {
    const character : Character = req.locals.character;
    res.status(200).json(character.wsr());
  } catch (error) {
    console.error("❌ Error al obtener personaje:", error);
    res.status(500).json({ error: "Error interno al recuperar el personaje." });
  }
});

router.post("/newCharacter", authMiddleware , async (req: Request, res: Response): Promise<void> => {
  try {
      const userId = req.locals.user!.id;
      const { characterName,characterClass } = req.body;

      if (!characterName || !characterClass) {
        res.status(400).json({ error: "Es necesario rellenar nombre y clase del nuevo personaje." });
        return;
      }
      const isCharacterNameAvailable = await DatabaseService.isCharacterNameAvailable(characterName);
      if(!isCharacterNameAvailable){
        res.status(400).json({ error: "El nombre del personaje no esta disponible." });
        return;
      }
      const createCharacter = await CacheDataService.createCharacter(new Character({
        userId:userId,
        name:characterName,
        class:characterClass
      }));
      if(!createCharacter){
        res.status(500).json({ error: "Error durante la creacion del personaje" });
        return;
      }
      const newCharacter = CacheDataService.getCharacterByUserId(userId);
      if(!newCharacter){
        res.status(500).json({ error: "Error durante la creacion del personaje" });
        return;
      }
      webSocketService.characterRefresh(userId,{...newCharacter.wsr()});
      res.status(200);
  } catch (error) {
    console.error("Error en la mejora de atributo:", error);
    res.status(500).json({ error: "Error interno al mejorar el atributo." });
  }
});

export default router;
