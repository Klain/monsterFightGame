//backend\src\routes\characterRoutes.ts
import express, { Request, Response } from "express";
import { db } from "../database";
import CharacterService from "../services/characterService";
import authMiddleware from "../middleware/authMiddleware";
import { validateCharacterMiddleware } from "../middleware/validateCharacterMiddleware";
import { validateAttributeMiddleware } from "../middleware/validateAttributeMiddleware";
import webSocketService from "../services/webSocketService";
import { SocketAddress } from "net";
import ActivityService from "../services/activityService";

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

      await CharacterService.upgradeCharacterAttribute(character,attribute,cost);
      const updatedCharacter = await CharacterService.getCharacterById(userId);

      webSocketService.characterRefresh(userId,{...updatedCharacter?.wsr()});
      res.status(200);
  } catch (error) {
    console.error("Error en la mejora de atributo:", error);
    res.status(500).json({ error: "Error interno al mejorar el atributo." });
  }
});

// Ruta: Obtener el ranking
router.get("/leaderboard", async (req: Request, res: Response): Promise<void> => {
  try {
    const leaderboard = await new Promise<any[]>((resolve, reject) => {
      db.all(
        `SELECT name, level, totalXp, totalGold FROM characters ORDER BY totalXp DESC LIMIT 10`,
        (err, rows) => {
          if (err) {
            return reject(err);
          }
          resolve(rows);
        }
      );
    });

    res.json({ leaderboard });
  } catch (error) {
    console.error("Error al obtener ranking:", error);
    res.status(500).json({ error: "Error interno al obtener el ranking." });
  }
});


// Ruta: Obtener el personaje del usuario autenticado
router.get("/", authMiddleware,validateCharacterMiddleware , async (req: Request, res: Response): Promise<void> => {
  try {
    const character = req.locals.character;
    const activity  = await ActivityService.getActivityStatus(character);

    res.json(webSocketService.characterRefreshBuilder(character,activity));
    res.status(200);
  } catch (error) {
    console.error("❌ Error al obtener personaje:", error);
    res.status(500).json({ error: "Error interno al recuperar el personaje." });
  }
});

export default router;
